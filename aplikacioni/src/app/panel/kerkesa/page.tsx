import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { merRolin } from "@/lib/lejet";
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

  let roli = "";
  if (session?.user && login) {
    try {
      roli = await merRolin(login);
    } catch {
      roli = "";
    }
  }

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
          <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>Login: {login}</p>
          {kerkesa.length === 0 ? <p>Nuk ka kërkesa për momentin.</p> : null}
        </>
      )}
      {session && kerkesa.length > 0 ? (
        <div style={{ display: "grid", gap: "0.9rem", marginTop: "1rem" }}>
          {kerkesa.map((k) => (
            <article
              key={k.id}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "1rem",
                background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <strong>
                    {k.nisja} → {k.destinacioni}
                  </strong>{" "}
                  · Ora: {k.ora} · ID udhëtimi: {k.udhetimi_id}
                </div>
                <span
                  style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    background:
                      k.status === "ne_pritje"
                        ? "rgba(59, 130, 246, 0.14)"
                        : k.status === "pranuar"
                        ? "rgba(22, 163, 74, 0.14)"
                        : "rgba(239, 68, 68, 0.14)",
                    color:
                      k.status === "ne_pritje"
                        ? "#1d4ed8"
                        : k.status === "pranuar"
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {k.status === "ne_pritje" ? "Në pritje" : k.status === "pranuar" ? "Pranuar" : "Refuzuar"}
                </span>
              </div>
              <p style={{ margin: "0.4rem 0 0", color: "#4b5563" }}>Udhëtari: {k.udhetari_login}</p>
              {k.status === "ne_pritje" ? <VeprimKerkese kerkesaId={k.id} /> : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
