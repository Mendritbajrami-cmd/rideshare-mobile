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
      <p style={{ marginTop: "1rem", fontSize: "0.95rem", opacity: 0.8 }}>
        Nuk ka udhëtime për të ndryshuar orën momentalisht.
      </p>
    );
  }

  return (
    <form
      action={veprimi}
      style={{
        display: "grid",
        gap: "0.75rem",
        maxWidth: 420,
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#fafafa",
      }}
    >
      <h3 style={{ margin: 0 }}>Ndrysho orën e udhëtimit</h3>
      <div style={{ display: "grid", gap: "0.4rem" }}>
        <label htmlFor="id">Zgjidh udhëtimin</label>
        <select
          id="id"
          name="id"
          required
          style={{
            padding: "0.6rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          {udhetimet.map((u) => (
            <option key={u.id} value={u.id}>
              ID {u.id}: {u.nisja} → {u.destinacioni} · Ora aktuale: {u.ora}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gap: "0.4rem" }}>
        <label htmlFor="ora">Ora e re (HH:MM)</label>
        <input
          id="ora"
          name="ora"
          type="text"
          pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
          placeholder="p.sh. 08:25"
          required
          style={{
            padding: "0.6rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <button className="action" type="submit" disabled={po}>
        {po ? "Duke ruajtur..." : "Ruaj ndryshimin"}
      </button>
      {gjendja.mesazhi ? (
        <p role="alert" style={{ fontWeight: "bold", margin: 0 }}>
          {gjendja.mesazhi}
        </p>
      ) : null}
    </form>
  );
}
