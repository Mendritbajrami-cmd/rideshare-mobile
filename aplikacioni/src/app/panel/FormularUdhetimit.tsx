"use client";

import { useActionState } from "react";
import { shtoUdhetimin, type RezultatiUdhetimit } from "./actions";

const fillestare: RezultatiUdhetimit = { mesazhi: "", sukses: false };

const fusha = {
  padding: "0.7rem 0.9rem",
  fontSize: "1rem",
  borderRadius: "10px",
  border: "1px solid #39455b",
  background: "#0b1220",
  color: "#edf2fc",
} as const;

export function FormularUdhetimit({
  shoferet,
  login,
}: {
  shoferet: string[];
  login: string;
}) {
  const [gjendja, veprimi, po] = useActionState(
    async (_prev: RezultatiUdhetimit, formData: FormData) => shtoUdhetimin(formData),
    fillestare
  );

  const iZgjedhur = shoferet.includes(login) ? login : shoferet[0] ?? "";

  return (
    <form
      action={veprimi}
      data-testid="form-shto-udhetim"
      style={{
        display: "grid",
        gap: "0.9rem",
        maxWidth: 460,
        marginTop: "1.5rem",
        padding: "1.25rem",
        border: "1px solid #39455b",
        borderRadius: "14px",
        background: "rgba(53, 72, 212, 0.08)",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Shto udhëtim të re</h3>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="nisja" style={{ fontWeight: 600, color: "#cfe0ff" }}>
          Nisja
        </label>
        <input id="nisja" name="nisja" required placeholder="p.sh. Ferizaj" style={fusha} />
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="destinacioni" style={{ fontWeight: 600, color: "#cfe0ff" }}>
          Destinacioni
        </label>
        <input id="destinacioni" name="destinacioni" required placeholder="p.sh. AAB" style={fusha} />
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="ora" style={{ fontWeight: 600, color: "#cfe0ff" }}>
          Ora (HH:MM)
        </label>
        <input
          id="ora"
          name="ora"
          type="text"
          pattern="^([01][0-9]|2[0-3]):[0-5][0-9]$"
          placeholder="p.sh. 08:15"
          required
          style={fusha}
        />
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="vendtakimi" style={{ fontWeight: 600, color: "#cfe0ff" }}>
          Vendtakimi
        </label>
        <input
          id="vendtakimi"
          name="vendtakimi"
          required
          placeholder="p.sh. Biblioteka"
          style={fusha}
        />
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="vende" style={{ fontWeight: 600, color: "#cfe0ff" }}>
          Vende të lira
        </label>
        <input
          id="vende"
          name="vende"
          type="number"
          min={0}
          max={20}
          defaultValue={2}
          required
          style={fusha}
        />
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <label htmlFor="shoferi" style={{ fontWeight: 600, color: "#cfe0ff" }}>
          Shoferi (vetëm llogari të autorizuara)
        </label>
        <select
          id="shoferi"
          name="shoferi"
          required
          defaultValue={iZgjedhur}
          disabled={shoferet.length === 0}
          data-testid="shoferi"
          style={fusha}
        >
          {shoferet.length === 0 ? (
            <option value="">Nuk ka shoferë të autorizuar</option>
          ) : (
            shoferet.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))
          )}
        </select>
        {shoferet.length === 0 ? (
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#f0b429" }}>
            Asnjë profil nuk ka rolin shofer. Shto një profil me rol shofer para se të
            krijosh udhëtim.
          </p>
        ) : null}
      </div>

      <button
        className="action"
        type="submit"
        disabled={po || shoferet.length === 0}
        data-testid="shto-udhetim"
        style={{ borderRadius: "999px", border: "none", fontWeight: 600 }}
      >
        {po ? "Duke shtuar..." : "Shto udhëtimin"}
      </button>

      {gjendja.mesazhi ? (
        <p
          role="alert"
          style={{
            fontWeight: "bold",
            margin: 0,
            padding: "0.7rem 0.9rem",
            borderRadius: "10px",
            background: gjendja.sukses ? "rgba(22, 163, 74, 0.18)" : "rgba(220, 38, 38, 0.18)",
            color: gjendja.sukses ? "#86efac" : "#fca5a5",
          }}
        >
          {gjendja.mesazhi}
        </p>
      ) : null}
    </form>
  );
}
