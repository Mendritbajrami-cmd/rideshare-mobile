import "server-only";
import { getSql } from "./db";

export type Udhetim = {
  id: string;
  nisja: string;
  destinacioni: string;
  ora: string;
  vendtakimi: string;
  vende: number;
  pronari: string | null;
};

export async function lexoUdhetimet(): Promise<Udhetim[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, nisja, destinacioni, ora, vendtakimi, vende, pronari
    FROM udhetimet ORDER BY id
  `;
  return rows as Udhetim[];
}

export async function gjejUdhetimin(id: string): Promise<Udhetim | undefined> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, nisja, destinacioni, ora, vendtakimi, vende, pronari
    FROM udhetimet WHERE id = ${id}
  `;
  return rows[0] as Udhetim | undefined;
}

export async function ndryshoOren(
  id: string,
  oraRe: string,
  githubLogin: string
): Promise<void> {
  const sql = getSql();
  const rows = await sql`
    SELECT pronari, shofer_id FROM udhetimet WHERE id = ${id}
  `;
  if (rows.length === 0) throw new Error("nuk_ekziston");
  const pronari =
    (rows[0].shofer_id as string | null) ??
    (rows[0].pronari as string | null);
  if (!pronari || pronari !== githubLogin) throw new Error("jo_pronar");
  await sql`UPDATE udhetimet SET ora = ${oraRe} WHERE id = ${id}`;
}