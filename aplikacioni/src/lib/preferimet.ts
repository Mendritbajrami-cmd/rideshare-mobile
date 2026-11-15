import "server-only";
import { getSql } from "./db";

export type Preferim = {
  id: number;
  udhetimi_id: string;
  udhetari_login: string;
  krijuar_ne: string;
};

export async function lexoPreferimin(
  udhetariLogin: string,
  udhetimiId: string
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT id FROM preferimet
    WHERE udhetari_login = ${udhetariLogin} AND udhetimi_id = ${udhetimiId}
  `;
  return rows.length > 0;
}

export async function numriPreferimeve(udhetariLogin: string): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS numri FROM preferimet WHERE udhetari_login = ${udhetariLogin}
  `;
  return Number(rows[0]?.numri ?? 0);
}

export async function ruajPreferimin(
  udhetimiId: string,
  udhetariLogin: string
): Promise<{ ok: true; numri: number } | { ok: false; arsyeja: string }> {
  const sql = getSql();
  try {
    const udhetimet = await sql`
      SELECT id FROM udhetimet WHERE id = ${udhetimiId}
    `;
    if (udhetimet.length === 0) {
      return { ok: false, arsyeja: "Udhëtimi nuk u gjet." };
    }

    // Vetëm një preferim për çiftin përdorues–udhëtim.
    await sql`
      INSERT INTO preferimet (udhetimi_id, udhetari_login)
      VALUES (${udhetimiId}, ${udhetariLogin})
      ON CONFLICT (udhetimi_id, udhetari_login) DO NOTHING
    `;

    const numri = await numriPreferimeve(udhetariLogin);
    return { ok: true, numri };
  } catch (err) {
    console.error(err);
    return { ok: false, arsyeja: "Gabim gjatë ruajtjes së preferimit." };
  }
}
