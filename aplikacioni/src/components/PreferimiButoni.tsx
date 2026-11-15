"use client";

import { useState } from "react";

// Ylli i preferuara: pamja reagon menjëherë, suksesi konfirmohet vetëm
// pas ruajtjes në server. Ruajtje të tjera nuk nisen gjatë pritjes.
export function PreferimiButoni({
  idUdhetimi,
  ruajturNisje,
  numriNisje,
}: {
  idUdhetimi: string;
  ruajturNisje: boolean;
  numriNisje: number;
}) {
  const [ruajtur, setRuajtur] = useState(ruajturNisje);
  const [numri, setNumri] = useState(numriNisje);
  const [pritje, setPritje] = useState(false);
  const [deshmuar, setDeshmuar] = useState(false);
  const [mesazhi, setMesazhi] = useState(
    ruajturNisje ? "Preferimet u lexuan nga serveri." : "Nuk është te të preferuarat."
  );

  async function ruaj() {
    if (ruajtur || pritje) return;
    setPritje(true);
    setDeshmuar(false);
    setNumri((n) => n + 1); // optimistik: numri rritet para konfirmimit
    setMesazhi("Po presim konfirmimin e serverit.");

    // Mjet prove: ?gabim-prove=1 në adresë shkakton refuzim të kontrolluar
    // para shkrimit në databazë; hiqet duke hapur faqen pa të.
    const gabimProve =
      new URLSearchParams(window.location.search).get("gabim-prove") === "1";

    try {
      const res = await fetch("/api/preferimet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ udhetimiId: idUdhetimi, gabimProve }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.sukses) {
        setRuajtur(true);
        setNumri(typeof data.numri === "number" ? data.numri : numri + 1);
        setMesazhi("U ruajt te të preferuarat.");
      } else {
        setNumri((n) => n - 1); // rikthehet vlera e mëparshme
        setDeshmuar(true);
        setMesazhi("Nuk u ruajt. Provo përsëri.");
      }
    } catch {
      setNumri((n) => n - 1);
      setDeshmuar(true);
      setMesazhi("Nuk u ruajt. Provo përsëri.");
    } finally {
      setPritje(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        className="action"
        type="button"
        onClick={ruaj}
        disabled={pritje || ruajtur}
      >
        {ruajtur
          ? "★ I ruajtur"
          : pritje
          ? "★ Po ruhet…"
          : deshmuar
          ? "☆ Provo përsëri"
          : "☆ Ruaj udhëtimin"}
      </button>
      <p role="status" style={{ fontWeight: 600 }}>
        {mesazhi}
      </p>
      <p>
        Të preferuarat: <strong>{numri}</strong>
      </p>
      <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Preferim personal · jo rezervim</p>
    </div>
  );
}
