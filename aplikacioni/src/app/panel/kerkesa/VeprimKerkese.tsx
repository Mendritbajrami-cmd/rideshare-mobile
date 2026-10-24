"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VeprimKerkese({ kerkesaId }: { kerkesaId: number }) {
  const router = useRouter();
  const [po, setPo] = useState(false);
  const [mesazhi, setMesazhi] = useState("");

  async function vepro(vendim: "pranuar" | "refuzuar") {
    if (po) return;
    setPo(true);
    setMesazhi("");
    try {
      const res = await fetch(`/api/kerkesa/${kerkesaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendim }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.sukses) {
        setMesazhi(vendim === "pranuar" ? "Kërkesa u pranua." : "Kërkesa u refuzua.");
        router.refresh();
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
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginTop: "0.9rem" }}>
      <button
        type="button"
        className="action"
        onClick={() => vepro("pranuar")}
        disabled={po}
        style={{
          background: "#22c55e",
          color: "#ffffff",
          border: "none",
        }}
      >
        {po ? "Duke procesuar..." : "Prano"}
      </button>
      <button
        type="button"
        className="action"
        onClick={() => vepro("refuzuar")}
        disabled={po}
        style={{
          background: "transparent",
          color: "#dc2626",
          border: "1px solid #fca5a5",
        }}
      >
        Refuzo
      </button>
      {mesazhi ? (
        <span style={{ fontWeight: 600, color: "#1f2937" }}>{mesazhi}</span>
      ) : null}
    </div>
  );
}
