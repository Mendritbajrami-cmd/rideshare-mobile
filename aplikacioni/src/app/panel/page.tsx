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
      <h1>Paneli i shoferit</h1>
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

      <h2>Udhëtimet e disponueshme</h2>
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          marginTop: "1rem",
        }}
      >
        {udhetimet.map((u) => (
          <article
            key={u.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "1rem",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <strong>ID {u.id}</strong>
              <span>Ora: {u.ora}</span>
            </div>
            <div>
              {u.nisja} → {u.destinacioni}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.8, marginTop: "0.3rem" }}>
              Vendtakimi: {u.vendtakimi}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              Vende të lira: {u.vende}
            </div>
          </article>
        ))}
      </div>

      {session && roli === "shofer" ? (
        <FormularOres udhetimet={udhetimet} />
      ) : session ? (
        <p style={{ marginTop: "1rem", fontSize: "0.95rem", opacity: 0.8 }}>
          Vetëm përdoruesit me rol <strong>shofer</strong> mund të ndryshojnë orën e udhëtimit.
        </p>
      ) : null}
    </main>
  );
}
