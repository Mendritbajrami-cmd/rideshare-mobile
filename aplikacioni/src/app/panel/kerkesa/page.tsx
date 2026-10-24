import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { merrKerkesatPerShoferin } from "@/lib/kerkesa";
import { Hyrja } from "@/components/Hyrja";
import { VeprimKerkese } from "./VeprimKerkese";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PanelKerkesat() {
  const session = await getServerSession(authOptions);
  const login =
    (session?.user as { login?: string } | undefined)?.login ??
    session?.user?.name ??
    "";

  let kerkesa: Awaited<ReturnType<typeof merrKerkesatPerShoferin>> = [];
  if (session?.user && login) {
    try {
      kerkesa = await merrKerkesatPerShoferin(login);
    } catch {
      kerkesa = [];
    }
  }

  return (
    <main>
      <Link href="/panel">← Kthehu te paneli</Link>
      <h1>Kërkesat për udhëtimet</h1>
      <Hyrja />

      {!session ? (
        <p>Hyr me GitHub për të parë kërkesat.</p>
      ) : (
        <>
          <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>I kyçur si: {login}</p>
          {kerkesa.length === 0 ? <p style={{ color: "#4b5563" }}>Nuk ka kërkesa për momentin.</p> : null}
        </>
      )}
      {session && kerkesa.length > 0 ? (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
          {kerkesa.map((k) => (
            <article
              key={k.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#111827" }}>
                    {k.nisja} → {k.destinacioni}
                  </div>
                  <div style={{ marginTop: "0.25rem", color: "#4b5563" }}>
                    Ora: {k.ora} · ID udhëtimi: {k.udhetimi_id}
                  </div>
                  <div style={{ marginTop: "0.25rem", color: "#4b5563" }}>Udhëtari: {k.udhetari_login}</div>
                </div>
                <span
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    background:
                      k.status === "ne_pritje"
                        ? "rgba(37, 99, 235, 0.1)"
                        : k.status === "pranuar"
                        ? "rgba(34, 197, 94, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                    color:
                      k.status === "ne_pritje"
                        ? "#1d4ed8"
                        : k.status === "pranuar"
                        ? "#166534"
                        : "#b91c1c",
                  }}
                >
                  {k.status === "ne_pritje" ? "Në pritje" : k.status === "pranuar" ? "Pranuar" : "Refuzuar"}
                </span>
              </div>
              {k.status === "ne_pritje" ? <VeprimKerkese kerkesaId={k.id} /> : null}
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
