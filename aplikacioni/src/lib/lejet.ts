import "server-only";
import { getSql } from "./db";

export type Roli = "shofer" | "udhetar";

export async function merRolin(githubLogin: string): Promise<Roli> {
  const sql = getSql();
  const rows = await sql`
    SELECT roli FROM profilet WHERE github_login = ${githubLogin}
  `;
  if (rows.length === 0) {
    await sql`
      INSERT INTO profilet (github_login, roli)
      VALUES (${githubLogin}, 'udhetar')
      ON CONFLICT (github_login) DO NOTHING
    `;
    return "udhetar";
  }
  return rows[0].roli as Roli;
}

export async function eshtePronar(
  id: string,
  githubLogin: string
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT id FROM udhetimet
    WHERE id = ${id}
      AND (shofer_id = ${githubLogin} OR pronari = ${githubLogin})
  `;
  return rows.length > 0;
}

// Vetëm llogaritë me rol "shofer" mund të zgjidhen si pronar i një udhëtimi.
export async function lexoShoferet(): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT github_login FROM profilet
    WHERE roli = 'shofer'
    ORDER BY github_login
  `;
  return rows.map((r) => String(r.github_login));
}

export async function eshteShofer(githubLogin: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT 1 FROM profilet
    WHERE github_login = ${githubLogin} AND roli = 'shofer'
  `;
  return rows.length > 0;
}

export async function lejohetNdryshimiOres(
  id: string,
  githubLogin: string
): Promise<{ ok: true } | { ok: false; arsyeja: string }> {
  const roli = await merRolin(githubLogin);
  if (roli !== "shofer" || !(await eshtePronar(id, githubLogin))) {
    return {
      ok: false,
      arsyeja: "Nuk ke leje për këtë udhëtim. Ora nuk ndryshoi.",
    };
  }
  return { ok: true };
}
