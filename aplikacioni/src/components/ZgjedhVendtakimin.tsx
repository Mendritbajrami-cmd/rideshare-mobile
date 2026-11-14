"use client";

import { useState } from "react";

type Gjendja = "idle" | "loading" | "success" | "denied" | "timeout" | "unavailable";

const mesazhet: Record<Gjendja, string> = {
  idle: "Vendndodhja nuk është kërkuar.",
  loading: "Po kërkojmë vendndodhjen…",
  success: "Pozicioni u mor.",
  denied: "Leja u refuzua. Shkruaj vendtakimin vetë.",
  timeout: "Koha mbaroi. Provo sërish ose shkruaj vendtakimin vetë.",
  unavailable: "Pozicioni nuk është i disponueshëm. Shkruaj vendtakimin vetë.",
};

// Zgjedhja lokale e vendtakimit: shkrim manual ose lexim i vendndodhjes me lejen e telefonit.
export function ZgjedhVendtakimin() {
  const [teksti, setTeksti] = useState("");
  const [vendtakimi, setVendtakimi] = useState("");
  const [gabimFushes, setGabimFushes] = useState("");
  const [gjendja, setGjendja] = useState<Gjendja>("idle");
  const [saktesia, setSaktesia] = useState<number | null>(null);

  function konfirmo() {
    const pastuar = teksti.trim();
    if (!pastuar) {
      setGabimFushes("Shkruaj vendtakimin para se ta konfirmosh.");
      return;
    }
    setGabimFushes("");
    setVendtakimi(pastuar);
  }

  function kurMerretPozicioni(position: GeolocationPosition) {
    setSaktesia(Math.round(position.coords.accuracy));
    setGjendja("success");
  }

  function kurDeshtonLeximi(gabimi: GeolocationPositionError) {
    setSaktesia(null);
    if (gabimi.code === 1) setGjendja("denied");
    else if (gabimi.code === 2) setGjendja("unavailable");
    else setGjendja("timeout");
  }

  function perdorVendndodhjen() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setSaktesia(null);
      setGjendja("unavailable");
      return;
    }
    setSaktesia(null);
    setGjendja("loading");
    navigator.geolocation.getCurrentPosition(
      kurMerretPozicioni,
      kurDeshtonLeximi,
      { timeout: 10000 }
    );
  }

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Vendtakimi im</h2>
      <p>
        <label htmlFor="vendtakimi-fusha">Shkruaj vendtakimin</label>
        <br />
        <input
          id="vendtakimi-fusha"
          data-testid="meeting-input"
          value={teksti}
          onChange={(e) => setTeksti(e.target.value)}
          placeholder="p.sh. Biblioteka"
        />
      </p>
      <p role="alert" data-testid="meeting-error">
        {gabimFushes}
      </p>
      <p>
        <button className="action" data-testid="confirm-meeting" type="button" onClick={konfirmo}>
          Konfirmo në telefon
        </button>
      </p>
      <p>
        Vendtakimi i konfirmuar:{" "}
        <strong data-testid="confirmed-meeting">
          {vendtakimi || "(nuk është konfirmuar)"}
        </strong>
      </p>
      <button className="action" data-testid="locate-me" type="button" onClick={perdorVendndodhjen}>
        Përdor vendndodhjen time
      </button>
      <p data-testid="location-status" data-state={gjendja} role="status">
        {mesazhet[gjendja]}
      </p>
      <p data-testid="location-accuracy">
        {saktesia !== null ? `Saktësia rreth ${saktesia} m` : ""}
      </p>
    </section>
  );
}
