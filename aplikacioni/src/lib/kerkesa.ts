import "server-only";
import { getSql } from "./db";

export type KerkesaStatus = "ne_pritje" | "pranuar" | "refuzuar";

export type Kerkesa = {
  id: number;
  udhetimi_id: string;
  udhetari_login: string;
  status: KerkesaStatus;
  krijuar_ne: string;
  perditesuar_ne: string;
};

export type DritarjaKerkeseve = {
  fillimi: string; // timestamp lokal (Europe/Belgrade)
  rifreskohet: string; // ora e nisjes së radhës, HH:MM
};

// Një cikël = nga nisja e kaluar deri te nisja e radhës e të njëjtës linjë.
// Ora merret nga serveri (NOW në databazë), jo nga klienti, në zonën e
// Kosovës. Kështu kufiri rifreskohet vetëm kur nis udhëtimi.
export async function dritarjaERadhes(
  udhetimiId: string
): Promise<DritarjaKerkeseve | null> {
  const sql = getSql();
  const rows = await sql`
    WITH t AS (
      SELECT ora FROM udhetimet WHERE id = ${udhetimiId}
    ), n AS (
      SELECT t.ora, (NOW() AT TIME ZONE 'Europe/Belgrade') AS tani
      FROM t
    ), r AS (
      SELECT n.ora, n.tani,
             (n.tani::date + n.ora::time) AS nisja_sot
      FROM n
    ), o AS (
      SELECT r.ora,
             CASE WHEN r.tani < r.nisja_sot THEN r.nisja_sot
                  ELSE r.nisja_sot + INTERVAL '1 day' END AS nisja_radhes
      FROM r
    )
    SELECT
      (o.nisja_radhes - INTERVAL '1 day')::text AS fillimi,
      to_char(o.nisja_radhes, 'HH24:MI') AS rifreskohet
    FROM o
  `;
  if (rows.length === 0) return null;
  return {
    fillimi: String(rows[0].fillimi),
    rifreskohet: String(rows[0].rifreskohet),
  };
}

// A ka ky udhëtar një kërkesë për të njëjtën linjë (nisja → destinacioni, ora)
// brenda ciklit aktual? Linja matet me vlerat e udhëtimit, jo me ID-në, ndaj
// edhe një rresht tjetër me të njëjtën linjë nuk e anashkalon kufirin.
export async function kaKerkeseNeCikel(
  udhetimiId: string,
  login: string,
  fillimi: string
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM kerkesa k
      JOIN udhetimet u ON u.id = k.udhetimi_id
      JOIN udhetimet t ON t.id = ${udhetimiId}
      WHERE LOWER(TRIM(k.udhetari_login)) = LOWER(TRIM(${login}))
        AND LOWER(TRIM(u.nisja)) = LOWER(TRIM(t.nisja))
        AND LOWER(TRIM(u.destinacioni)) = LOWER(TRIM(t.destinacioni))
        AND u.ora::time = t.ora::time
        AND ((k.krijuar_ne AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Belgrade')
            >= ${fillimi}::timestamp
    ) AS bllokuar
  `;
  return Boolean(rows[0].bllokuar);
}

export async function merrKufirin(
  udhetimiId: string,
  login: string
): Promise<{ bllokuar: boolean; rifreskohet: string; fillimi: string }> {
  const dritarja = await dritarjaERadhes(udhetimiId);
  if (!dritarja) return { bllokuar: false, rifreskohet: "", fillimi: "" };
  return {
    bllokuar: await kaKerkeseNeCikel(udhetimiId, login, dritarja.fillimi),
    rifreskohet: dritarja.rifreskohet,
    fillimi: dritarja.fillimi,
  };
}

export async function krijoKerkese(
  udhetimiId: string,
  udhetariLogin: string
): Promise<{ ok: true } | { ok: false; arsyeja: string }> {
  const sql = getSql();
  try {
    const udhetimet = await sql`
      SELECT id, vende FROM udhetimet WHERE id = ${udhetimiId}
    `;
    if (udhetimet.length === 0) {
      return { ok: false, arsyeja: "Udhëtimi nuk u gjet." };
    }
    if (Number(udhetimet[0].vende) <= 0) {
      return { ok: false, arsyeja: "Nuk ka vende të lira." };
    }

    // Kufiri: një kërkesë për udhëtar dhe linjë brenda ciklit aktual.
    // Cikli rifreskohet kur nis udhëtimi (koha e serverit).
    const kufiri = await merrKufirin(udhetimiId, udhetariLogin);
    if (kufiri.bllokuar) {
      return {
        ok: false,
        arsyeja: `Ke përdorur kërkesën për këtë linjë. Një vend mund të kërkohet një herë; rifreskohet pas nisjes në ${kufiri.rifreskohet}.`,
      };
    }

    const ekziston = await sql`
      SELECT id, status FROM kerkesa
      WHERE udhetimi_id = ${udhetimiId} AND udhetari_login = ${udhetariLogin}
    `;
    if (ekziston.length > 0) {
      if (ekziston[0].status === "ne_pritje") {
        return { ok: false, arsyeja: "Ke dërguar tashmë një kërkesë për këtë udhëtim." };
      }
      if (ekziston[0].status === "pranuar") {
        // Kërkesë e re pas një pranimi: anulo rezervimin e mëparshëm dhe kthe vendin,
        // që i njëjti udhëtar të mos zërë dy vende me të njëjtin çift.
        await sql`UPDATE udhetimet SET vende = vende + 1 WHERE id = ${udhetimiId}`;
      }
    }

    await sql`
      INSERT INTO kerkesa (udhetimi_id, udhetari_login, status)
      VALUES (${udhetimiId}, ${udhetariLogin}, 'ne_pritje')
      ON CONFLICT (udhetimi_id, udhetari_login)
      DO UPDATE SET status = 'ne_pritje', krijuar_ne = NOW(), perditesuar_ne = NOW()
    `;
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, arsyeja: "Gabim gjatë dërgimit të kërkesës." };
  }
}

export async function merrKerkesatPerShoferin(
  shoferLogin: string
): Promise<(Kerkesa & { nisja: string; destinacioni: string; ora: string; shofer_id?: string | null; pronari?: string | null })[]> {
  const sql = getSql();
  const login = (shoferLogin || "").trim().toLowerCase();
  if (!login) return [];

  const rows = await sql`
    SELECT k.id, k.udhetimi_id, k.udhetari_login, k.status, k.krijuar_ne, k.perditesuar_ne,
           u.nisja, u.destinacioni, u.ora, u.shofer_id, u.pronari
    FROM kerkesa k
    LEFT JOIN udhetimet u ON u.id = k.udhetimi_id
    WHERE LOWER(TRIM(COALESCE(u.shofer_id, ''))) = ${login}
       OR LOWER(TRIM(COALESCE(u.pronari, ''))) = ${login}
    ORDER BY k.krijuar_ne DESC
  `;
  if (rows.length > 0) return rows as any;

  const all = await sql`
    SELECT k.id, k.udhetimi_id, k.udhetari_login, k.status, k.krijuar_ne, k.perditesuar_ne,
           u.nisja, u.destinacioni, u.ora, u.shofer_id, u.pronari
    FROM kerkesa k
    LEFT JOIN udhetimet u ON u.id = k.udhetimi_id
    ORDER BY k.krijuar_ne DESC
  `;
  return all as any;
}

export async function merrKerkesatPerUdhetarin(
  udhetariLogin: string
): Promise<(Kerkesa & { nisja: string; destinacioni: string; ora: string })[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT k.id, k.udhetimi_id, k.udhetari_login, k.status, k.krijuar_ne, k.perditesuar_ne,
           u.nisja, u.destinacioni, u.ora
    FROM kerkesa k
    JOIN udhetimet u ON u.id = k.udhetimi_id
    WHERE k.udhetari_login = ${udhetariLogin}
    ORDER BY k.krijuar_ne DESC
  `;
  return rows as any;
}

export async function pergjigjuKerkeses(
  kerkesaId: number,
  shoferLogin: string,
  vendim: "pranuar" | "refuzuar"
): Promise<
  { ok: true; tashme?: boolean; vende?: number } | { ok: false; arsyeja: string }
> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT k.id, k.udhetimi_id, k.status, u.shofer_id, u.pronari, u.vende
      FROM kerkesa k
      LEFT JOIN udhetimet u ON u.id = k.udhetimi_id
      WHERE k.id = ${kerkesaId}
    `;
    if (rows.length === 0) return { ok: false, arsyeja: "Kërkesa nuk u gjet." };

    // Identiteti vjen nga sesioni; shoferin pronar e njeh udhëtimi.
    const pronari =
      (rows[0].shofer_id as string | null) ?? (rows[0].pronari as string | null);
    const login = (shoferLogin || "").trim().toLowerCase();
    if (pronari && pronari.trim().toLowerCase() !== login) {
      return { ok: false, arsyeja: "Vetëm shoferi pronar mund të përgjigjet." };
    }

    if (vendim === "refuzuar") {
      const r = await sql`
        UPDATE kerkesa SET status = 'refuzuar', perditesuar_ne = NOW()
        WHERE id = ${kerkesaId} AND status = 'ne_pritje'
        RETURNING id
      `;
      if (r.length === 0) {
        if (rows[0].status === "refuzuar") return { ok: true, tashme: true };
        return { ok: false, arsyeja: "Kërkesa është trajtuar tashmë." };
      }
      return { ok: true };
    }

    // Pranimi dhe zbritja e vendeve bëhen në një deklaratë të vetme:
    // vetëm një kërkesë në pritje me vende të lira pranohet, një herë.
    const r = await sql`
      WITH kandidat AS (
        SELECT k.id, k.udhetimi_id, u.vende
        FROM kerkesa k
        JOIN udhetimet u ON u.id = k.udhetimi_id
        WHERE k.id = ${kerkesaId} AND k.status = 'ne_pritje'
      ), pranimi AS (
        UPDATE kerkesa SET status = 'pranuar', perditesuar_ne = NOW()
        WHERE id IN (SELECT id FROM kandidat WHERE vende > 0)
        RETURNING udhetimi_id
      )
      UPDATE udhetimet SET vende = vende - 1
      WHERE id IN (SELECT udhetimi_id FROM pranimi)
      RETURNING vende
    `;
    if (r.length > 0) return { ok: true, vende: Number(r[0].vende) };

    // Përsëritja e të njëjtit pranim nuk e ul numrin përsëri.
    if (rows[0].status === "pranuar") return { ok: true, tashme: true };
    if (Number(rows[0].vende) <= 0) {
      return { ok: false, arsyeja: "Nuk ka më vende të lira." };
    }
    return { ok: false, arsyeja: "Kërkesa është trajtuar tashmë." };
  } catch (err) {
    const kodi = (err as { code?: string })?.code;
    if (kodi === "23514") {
      return { ok: false, arsyeja: "Nuk ka më vende të lira." };
    }
    console.error(err);
    return { ok: false, arsyeja: "Gabim gjatë përpunimit të kërkesës." };
  }
}

export type GjendjaEUdhetimit = {
  udhetimi: {
    id: string;
    nisja: string;
    destinacioni: string;
    ora: string;
    vende: number;
  };
  roli: "shofer" | "udhetar";
  kerkesat: {
    id: number;
    udhetari_login: string;
    status: KerkesaStatus;
    krijuar_ne: string;
  }[];
  // Vetëm për udhëtarin: a ka shfrytëzuar kërkesën e linjës në këtë cikël.
  kufizimi: { bllokuar: boolean; rifreskohet: string } | null;
};

// Leximi i gjendjes: identiteti vjen nga sesioni.
// Shoferi lexon kërkesat e udhëtimit të vet; udhëtari vetëm kërkesën e vet.
export async function lexoGjendjenEUdhetimit(
  udhetimiId: string,
  loginSesionit: string
): Promise<GjendjaEUdhetimit | null> {
  const sql = getSql();
  const login = (loginSesionit || "").trim();
  const u = await sql`
    SELECT id, nisja, destinacioni, ora, vende, pronari, shofer_id
    FROM udhetimet WHERE id = ${udhetimiId}
  `;
  if (u.length === 0) return null;

  const pronari =
    (u[0].shofer_id as string | null) ?? (u[0].pronari as string | null);
  const jamShofer =
    !!pronari && login !== "" && pronari.trim().toLowerCase() === login.toLowerCase();

  // Kufiri llogaritet vetëm për udhëtarin dhe vetëm me kohën e serverit.
  const kufizimi = jamShofer
    ? null
    : await merrKufirin(udhetimiId, login).then((k) => ({
        bllokuar: k.bllokuar,
        rifreskohet: k.rifreskohet,
      }));

  const kerkesat = jamShofer
    ? await sql`
        SELECT id, udhetari_login, status, krijuar_ne
        FROM kerkesa
        WHERE udhetimi_id = ${udhetimiId}
        ORDER BY krijuar_ne ASC, id ASC
      `
    : await sql`
        SELECT id, udhetari_login, status, krijuar_ne
        FROM kerkesa
        WHERE udhetimi_id = ${udhetimiId}
          AND LOWER(TRIM(udhetari_login)) = LOWER(TRIM(${login}))
        ORDER BY krijuar_ne ASC, id ASC
      `;

  return {
    udhetimi: {
      id: String(u[0].id),
      nisja: String(u[0].nisja),
      destinacioni: String(u[0].destinacioni),
      ora: String(u[0].ora),
      vende: Number(u[0].vende),
    },
    roli: jamShofer ? "shofer" : "udhetar",
    kerkesat: kerkesat.map((k) => ({
      id: Number(k.id),
      udhetari_login: String(k.udhetari_login),
      status: k.status as KerkesaStatus,
      krijuar_ne: String(k.krijuar_ne),
    })),
    kufizimi,
  };
}
