"use client";

import { useActionState } from "react";
import { ruajOren, type RezultatiOres } from "./actions";

const fillestare: RezultatiOres = { mesazhi: "", sukses: false };

export function FormularOres() {
  const [gjendja, veprimi, po] = useActionState(
    async (_prev: RezultatiOres, formData: FormData) => ruajOren(formData),
    fillestare
  );

  return (
    <form action={veprimi} style={{ display: "grid", gap: "0.75rem", maxWidth: 320 }}>
      <input type="hidden" name="id" defaultValue="2" />
      <label htmlFor="ora">Ora e re (HH:MM) për udhëtimin tënd</label>
      <input
        id="ora"
        name="ora"
        type="text"
        pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
        placeholder="p.sh. 08:25"
        required
        style={{ padding: "0.5rem", fontSize: "1rem" }}
      />
      <button className="action" type="submit" disabled={po}>
        {po ? "Duke ruajtur..." : "Ruaj"}
      </button>
      {gjendja.mesazhi ? (
        <p role="alert" style={{ fontWeight: "bold" }}>
          {gjendja.mesazhi}
        </p>
      ) : null}
    </form>
  );
}
