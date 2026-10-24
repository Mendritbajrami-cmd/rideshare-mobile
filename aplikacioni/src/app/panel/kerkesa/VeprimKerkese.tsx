"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VeprimKerkese({ kerkesaId }: { kerkesaId: number }) {
  const router = useRouter();
  const [po, setPo] = useState(false);
  const [mesazhi, setMesazhi] = useState("");

  async function vepro(vendim: "pranuar" | "refuzuar") {
    setPo(true);
    setMesazhi("");
    try {
      const res = await fetch(`/api/kerkesa/${kerkesaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendim }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.sukses) {
        setMesazhi(vendim === "pranuar" ? "Kërkesa u pranua." : "Kërkesa u refuzua.");
        setTimeout(() => router.refresh(), 800);
        return;
      }
      setMesazhi(data.gabim || "Gabim gjatë përpunimit.");
    } catch {
      setMesazhi("Gabim rrjeti.");
    } finally {
      setPo(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.9rem" }}>
      <button
        type="button"
        onClick={() => vepro("pranuar")}
        disabled={po}
        style={{
          padding: "0.6rem 1rem",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
          color: "#ffffff",
          fontWeight: 600,
        }}
      >
        {po ? "Duke procesuar..." : "Prano"}
      </button>
      <button
        type="button"
        onClick={() => vepro("refuzuar")}
        disabled={po}
        style={{
          padding: "0.6rem 1rem",
          borderRadius: "999px",
          border: "1px solid #fca5a5",
          background: "rgba(239, 68, 68, 0.12)",
          color: "#991b1b",
          fontWeight: 600,
        }}
      >
        Refuzo
      </button>
      {mesazhi && <span style={{ alignSelf: "center", fontWeight: 600 }}>{mesazhi}</span>}
    </div>
  );
}
