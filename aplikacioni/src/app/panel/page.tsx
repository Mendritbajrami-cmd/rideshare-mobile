import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { merRolin } from "@/lib/lejet";
import { lexoUdhetimet } from "@/lib/udhetimet";
import { Hyrja } from "@/components/Hyrja";
import { FormularOres } from "./FormularOres";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Panel() {
  const session = await getServerSession(authOptions);
  const login =
    (session?.user as { login?: string } | undefined)?.login ??
    session?.user?.name ??
    "";

  let roli = "";
  if (session?.user && login) {
    try {
      roli = await merRolin(login);
    } catch {
      roli = "";
    }
  }

  let udhetimet: Awaited<ReturnType<typeof lexoUdhetimet>> = [];
  try {
    udhetimet = await lexoUdhetimet();
  } catch {
    udhetimet = [];
  }

  return (
    <main>
      <Link href="/">← Kthehu te lista publike</Link>
      <h1>Paneli</h1>
      <Hyrja />

      {!session ? (
        <p>Lista e udhëtimeve është publike. Hyr me GitHub për të ndryshuar orën e udhëtimit tënd.</p>
      ) : (
        <p>
          Emri: <strong>{session.user?.name ?? login}</strong>
          {roli ? (
            <>
              {" "}
              · Roli: <strong>{roli}</strong>
            </>
          ) : null}
        </p>
      )}

      <h2>Udhëtimet</h2>
      <ul>
        {udhetimet.map((u) => (
          <li key={u.id}>
            ID {u.id}: {u.nisja} → {u.destinacioni} · {u.ora}
          </li>
        ))}
      </ul>

      {session ? <FormularOres /> : null}
    </main>
  );
}
