"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NdryshoPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ora, setOra] = useState("");
  const [mesazhi, setMesazhi] = useState("");
  const [po, setPo] = useState(false);

  async function dergoPerkerkese(e: React.FormEvent) {
    e.preventDefault();
    setPo(true);
    setMesazhi("");
    try {
      const res = await fetch("/api/ora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ora }),
      });
      const data = await res.json();
      if (res.ok) {
        setMesazhi("✅ Ora u ndryshua me sukses!");
        setTimeout(() => router.push(`/udhetimi/${id}`), 1500);
      } else {
        setMesazhi(`❌ ${data.gabim}`);
      }
    } catch {
      setMesazhi("❌ Gabim rrjeti. Provo përsëri.");
    } finally {
      setPo(false);
    }
  }

  if (status === "loading") return <main><p>Duke ngarkuar...</p></main>;

  if (!session) {
    return (
      <main>
        <h1>Ndrysho Orën</h1>
        <p role="alert">❌ Nuk je i autentikuar. Hyr me GitHub që të ndryshosh orën.</p>
        <a className="action" href={`/udhetimi/${id}`}>← Kthehu</a>
      </main>
    );
  }

  return (
    <main>
      <a href={`/udhetimi/${id}`}>← Kthehu te detajet</a>
      <h1>Ndrysho Orën · Udhëtimi {id}</h1>
      <p>I kyçur si: <strong>{session.user?.name}</strong></p>
      <form onSubmit={dergoPerkerkese} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "320px", marginTop: "1rem" }}>
        <label htmlFor="ora">Ora e re (HH:MM)</label>
        <input
          id="ora"
          type="text"
          pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
          placeholder="p.sh. 09:30"
          value={ora}
          onChange={(e) => setOra(e.target.value)}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button className="action" type="submit" disabled={po}>
          {po ? "Duke dërguar..." : "Ruaj orën"}
        </button>
      </form>
      {mesazhi && (
        <p role="alert" style={{ marginTop: "1rem", fontWeight: "bold" }}>
          {mesazhi}
        </p>
      )}
    </main>
  );
}
