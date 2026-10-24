"use client";

import { useActionState } from "react";
import { ruajOren, type RezultatiOres } from "./actions";
import type { Udhetim } from "@/lib/udhetimet";

const fillestare: RezultatiOres = { mesazhi: "", sukses: false };

export function FormularOres({ udhetimet }: { udhetimet: Udhetim[] }) {
  const [gjendja, veprimi, po] = useActionState(
    async (_prev: RezultatiOres, formData: FormData) => ruajOren(formData),
    fillestare
  );

  if (udhetimet.length === 0) {
    return (
      <p style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#6b7280" }}>
        Nuk ka udhëtime për të ndryshuar orën momentalisht.
      </p>
    );
  }

  return (
    <form
      action={veprimi}
      style={{
        display: "grid",
        gap: "0.9rem",
        maxWidth: 460,
        marginTop: "1.5rem",
        padding: "1.25rem",
        border: "1px solid #d1d5db",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>Ndrysho orën e udhëtimit</h3>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="id" style={{ fontWeight: 600, color: "#1f2937" }}>
          Zgjidh udhëtimin
        </label>
        <select
          id="id"
          name="id"
          required
          style={{
            padding: "0.7rem 0.9rem",
            fontSize: "1rem",
            borderRadius: "10px",
            border: "1px solid #cbd5f5",
            background: "#ffffff",
            color: "#111827",
            boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
          }}
        >
          {udhetimet.map((u) => (
            <option key={u.id} value={u.id}>
              ID {u.id}: {u.nisja} → {u.destinacioni} · Ora aktuale: {u.ora}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="ora" style={{ fontWeight: 600, color: "#1f2937" }}>
          Ora e re (HH:MM)
        </label>
        <input
          id="ora"
          name="ora"
          type="text"
          pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
          placeholder="p.sh. 08:25"
          required
          style={{
            padding: "0.7rem 0.9rem",
            fontSize: "1rem",
            borderRadius: "10px",
            border: "1px solid #cbd5f5",
            background: "#ffffff",
            color: "#111827",
            boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
          }}
        />
      </div>

      <button
        className="action"
        type="submit"
        disabled={po}
        style={{
          padding: "0.8rem 1rem",
          borderRadius: "999px",
          border: "none",
          background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "0 12px 30px rgba(37, 99, 235, 0.18)",
        }}
      >
        {po ? "Duke ruajtur..." : "Ruaj ndryshimin"}
      </button>
      {gjendja.mesazhi ? (
        <p
          role="alert"
          style={{
            fontWeight: "bold",
            margin: 0,
            padding: "0.7rem 0.9rem",
            borderRadius: "10px",
            background: gjendja.sukses ? "rgba(22, 163, 74, 0.12)" : "rgba(220, 38, 38, 0.12)",
            color: gjendja.sukses ? "#166534" : "#991b1b",
          }}
        >
          {gjendja.mesazhi}
        </p>
      ) : null}
    </form>
  );
}
