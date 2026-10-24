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

    const ekziston = await sql`
      SELECT id, status FROM kerkesa
      WHERE udhetimi_id = ${udhetimiId} AND udhetari_login = ${udhetariLogin}
    `;
    if (ekziston.length > 0) {
      if (ekziston[0].status === "ne_pritje") {
        return { ok: false, arsyeja: "Ke dërguar tashmë një kërkesë për këtë udhëtim." };
      }
      if (ekziston[0].status === "pranuar") {
        return { ok: false, arsyeja: "Kërkesa jote është pranuar tashmë." };
      }
    }

    await sql`
      INSERT INTO kerkesa (udhetimi_id, udhetari_login, status)
      VALUES (${udhetimiId}, ${udhetariLogin}, 'ne_pritje')
      ON CONFLICT (udhetimi_id, udhetari_login)
      DO UPDATE SET status = 'ne_pritje', perditesuar_ne = NOW()
    `;
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, arsyeja: "Gabim gjatë dërgimit të kërkesës." };
  }
}

export async function merrKerkesatPerShoferin(
  shoferLogin: string
): Promise<(Kerkesa & { nisja: string; destinacioni: string; ora: string })[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT k.id, k.udhetimi_id, k.udhetari_login, k.status, k.krijuar_ne, k.perditesuar_ne,
           u.nisja, u.destinacioni, u.ora
    FROM kerkesa k
    JOIN udhetimet u ON u.id = k.udhetimi_id
    WHERE LOWER(COALESCE(u.shofer_id, '')) = LOWER(${shoferLogin})
       OR LOWER(COALESCE(u.pronari, '')) = LOWER(${shoferLogin})
       OR LOWER(COALESCE(u.shofer_id, '')) = LOWER(COALESCE(${shoferLogin}, ''))
    ORDER BY k.krijuar_ne DESC
  `;
  return rows as any;
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
): Promise<{ ok: true } | { ok: false; arsyeja: string }> {
  const sql = getSql();
  try {
    const rows = await sql`
      SELECT k.id, k.udhetimi_id, k.status, u.shofer_id, u.pronari, u.vende
      FROM kerkesa k
      JOIN udhetimet u ON u.id = k.udhetimi_id
      WHERE k.id = ${kerkesaId}
    `;
    if (rows.length === 0) return { ok: false, arsyeja: "Kërkesa nuk u gjet." };
    const pronari = (rows[0].shofer_id as string | null) ?? (rows[0].pronari as string | null);
    if (!pronari || pronari.toLowerCase() !== shoferLogin.toLowerCase()) {
      return { ok: false, arsyeja: "Nuk ke leje për këtë kërkesë." };
    }
    if (rows[0].status !== "ne_pritje") return { ok: false, arsyeja: "Kërkesa është trajtuar tashmë." };

    if (vendim === "pranuar") {
      const vende = Number(rows[0].vende);
      if (vende <= 0) return { ok: false, arsyeja: "Nuk ka më vende të lira." };
      await sql`UPDATE udhetimet SET vende = ${vende - 1} WHERE id = ${rows[0].udhetimi_id}`;
    }

    await sql`UPDATE kerkesa SET status = ${vendim}, perditesuar_ne = NOW() WHERE id = ${kerkesaId}`;
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, arsyeja: "Gabim gjatë përpunimit të kërkesës." };
  }
}
