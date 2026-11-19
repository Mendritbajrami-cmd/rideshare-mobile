"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { signIn } from "next-auth/react";

// Dy ekrane, një gjendje: leximi i gjendjes nga serveri çdo 5 sekonda.
// Nuk nisim një lexim të dytë ndërsa i pari pret; timer-i pastrohet në dalje.
// Në dështim mbajmë vlerat e fundit dhe paralajmërojmë "Po rilidhemi".

type Statusi = "ne_pritje" | "pranuar" | "refuzuar";
type Vendim = "pranuar" | "refuzuar";

type Kerkese = {
  id: number;
  udhetari_login: string;
  status: Statusi;
};

type Gjendja = {
  udhetimi: {
    id: string;
    nisja: string;
    destinacioni: string;
    ora: string;
    vende: number;
  };
  roli: "shofer" | "udhetar";
  kerkesat: Kerkese[];
};

const INTERVALI_MS = 5000;

const karta: CSSProperties = {
  border: "1px solid #39455b",
  borderRadius: "12px",
  padding: "1rem 1.25rem",
  marginTop: "0.75rem",
  background: "rgba(53, 72, 212, 0.08)",
};

function tekstiStatusit(s: Statusi) {
  return s === "ne_pritje" ? "Në pritje" : s === "pranuar" ? "U pranua" : "U refuzua";
}

export function GjendjaUdhetimit({
  idUdhetimi,
  vendeNisje,
}: {
  idUdhetimi: string;
  vendeNisje: number;
}) {
  const [gjendja, setGjendja] = useState<Gjendja | null>(null);
  const [lidhur, setLindhur] = useState(true);
  const [lexuar, setLexuar] = useState(false);
  const [hyrje, setHyrje] = useState(false);
  const [pritje, setPritje] = useState(false);
  const [mesazhi, setMesazhi] = useState("");
  const [njoftim, setNjoftim] = useState("");
  const statuset = useRef<Record<number, Statusi>>({});
  const lexoRef = useRef<() => void>(() => {});

  useEffect(() => {
    let aktiv = true;
    let ndalo = false;
    let neFluturim = false;
    let kerkoPerseri = false;
    let numri = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let kontrollues: AbortController | undefined;

    async function lexo() {
      if (!aktiv || ndalo || neFluturim) return;
      neFluturim = true;
      kontrollues = new AbortController();
      const ky = ++numri;
      try {
        const res = await fetch(`/api/udhetimet/${idUdhetimi}/gjendja`, {
          cache: "no-store",
          signal: kontrollues.signal,
        });
        if (res.status === 401) {
          if (aktiv) {
            setHyrje(true);
            setLexuar(false);
          }
          ndalo = true;
          return;
        }
        if (!res.ok) throw new Error("lexim");
        const data = (await res.json()) as Gjendja;
        if (!aktiv || ky !== numri) return; // përgjigje e vjetruar

        // Njoftim kur përgjigjja e shoferit ndryshon gjendjen e kërkesës.
        if (data.roli === "udhetar") {
          for (const k of data.kerkesat) {
            const mePare = statuset.current[k.id];
            if (mePare === "ne_pritje" && k.status !== "ne_pritje") {
              setNjoftim(
                k.status === "pranuar"
                  ? "Kërkesa u pranua nga shoferi."
                  : "Kërkesa u refuzua nga shoferi."
              );
            }
            statuset.current[k.id] = k.status;
          }
        }

        setGjendja(data);
        setHyrje(false);
        setLexuar(true);
        setLindhur(true); // paralajmërimi hiqet vetëm pas një përgjigjeje të suksesshme
      } catch {
        if (aktiv && ky === numri) setLindhur(false);
      } finally {
        neFluturim = false;
        if (aktiv && !ndalo) {
          if (kerkoPerseri) {
            kerkoPerseri = false;
            lexo();
          } else {
            if (timer) clearTimeout(timer);
            timer = setTimeout(lexo, INTERVALI_MS);
          }
        }
      }
    }

    function lexoMenjehere() {
      if (!aktiv || ndalo) return;
      if (timer) clearTimeout(timer);
      if (neFluturim) {
        kerkoPerseri = true;
        return;
      }
      lexo();
    }

    lexoRef.current = lexoMenjehere;
    lexo();

    function onRikthim() {
      lexoMenjehere();
    }
    window.addEventListener("online", onRikthim);

    return () => {
      aktiv = false;
      if (timer) clearTimeout(timer);
      kontrollues?.abort();
      window.removeEventListener("online", onRikthim);
      lexoRef.current = () => {};
    };
  }, [idUdhetimi]);

  async function vepro(kerkesaId: number, vendim: Vendim) {
    if (pritje || !lidhur) return;
    setPritje(true);
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
        setMesazhi(vendim === "pranuar" ? "Pranimi u ruajt" : "Refuzimi u ruajt");
        lexoRef.current();
      } else {
        setMesazhi(data.gabim || "Veprimi nuk u ruajt. Provo përsëri.");
      }
    } catch {
      setMesazhi("Veprimi nuk u ruajt. Provo përsëri.");
    } finally {
      setPritje(false);
    }
  }

  async function kerkoVend() {
    if (pritje || !lidhur) return;
    setPritje(true);
    setMesazhi("");
    setNjoftim("");
    try {
      const res = await fetch("/api/kerkesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ udhetimiId: idUdhetimi }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.sukses) {
        setMesazhi("Kërkesa u dërgua");
        lexoRef.current();
      } else {
        setMesazhi(data.gabim || "Kërkesa nuk u dërgua. Provo përsëri.");
      }
    } catch {
      setMesazhi("Kërkesa nuk u dërgua. Provo përsëri.");
    } finally {
      setPritje(false);
    }
  }

  if (hyrje) {
    return (
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Gjendja e udhëtimit</h2>
        <p>Hyr me GitHub që të shohësh gjendjen dhe të veprosh.</p>
        <button type="button" className="action" onClick={() => signIn("github")}>
          Hyr me GitHub
        </button>
      </section>
    );
  }

  const vende = gjendja?.udhetimi.vende ?? vendeNisje;
  const jamShofer = gjendja?.roli === "shofer";
  const butoniKerko = (teksti: string) => (
    <button
      type="button"
      className="action"
      onClick={kerkoVend}
      disabled={pritje || !lidhur || vende <= 0}
      data-testid="kerko-vend"
    >
      {pritje ? "Duke dërguar…" : vende > 0 ? teksti : "Nuk ka vende të lira"}
    </button>
  );

  return (
    <section style={{ marginTop: "1.5rem" }} data-testid="gjendja">
      <h2>Gjendja e udhëtimit</h2>
      <p data-testid="vende">
        Vende të lira: <strong>{vende}</strong>
      </p>
      <p>Statusi: {vende > 0 ? "Aktiv" : "I plotë"}</p>

      {gjendja === null ? (
        <p>Po lexojmë gjendjen…</p>
      ) : jamShofer ? (
        gjendja.kerkesat.length === 0 ? (
          <p data-testid="pa-kerkese">Pa kërkesë · Ende pa kërkesë</p>
        ) : (
          gjendja.kerkesat.map((k) => (
            <article key={k.id} style={karta}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Kërkesa e {k.udhetari_login}
              </h3>
              <p data-testid={`statusi-${k.id}`} style={{ fontWeight: 600, margin: "0.5rem 0" }}>
                {tekstiStatusit(k.status)}
              </p>
              {k.status === "ne_pritje" ? (
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="action"
                    onClick={() => vepro(k.id, "pranuar")}
                    disabled={pritje || !lidhur}
                    data-testid={`prano-${k.id}`}
                    style={{ marginTop: 0, background: "#15803d" }}
                  >
                    {pritje ? "Duke procesuar…" : "Prano kërkesën"}
                  </button>
                  <button
                    type="button"
                    className="action"
                    onClick={() => vepro(k.id, "refuzuar")}
                    disabled={pritje || !lidhur}
                    data-testid={`refuzo-${k.id}`}
                    style={{
                      marginTop: 0,
                      background: "transparent",
                      color: "#fca5a5",
                      border: "1px solid #7f1d1d",
                    }}
                  >
                    Refuzo
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#9fb0cc" }}>
                  {k.status === "pranuar" ? "Pranimi u ruajt" : "Refuzimi u ruajt"}
                </p>
              )}
            </article>
          ))
        )
      ) : (
        <>
          {njoftim ? (
            <p role="status" data-testid="njoftim" style={{ fontWeight: 600, color: "#89ddff" }}>
              {njoftim}
            </p>
          ) : null}

          {gjendja.kerkesat.length === 0 ? (
            <article style={karta}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Pa kërkesë
              </h3>
              <p style={{ margin: "0.5rem 0", color: "#9fb0cc" }}>Nuk ke kërkesë për këtë udhëtim.</p>
              {butoniKerko("Kërko një vend")}
            </article>
          ) : (
            gjendja.kerkesat.map((k) => (
              <article key={k.id} style={karta}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Kërkesa ime
                </h3>
                <p data-testid={`statusi-${k.id}`} style={{ fontWeight: 600, margin: "0.5rem 0" }}>
                  {tekstiStatusit(k.status)}
                </p>
                <p style={{ margin: 0, color: "#9fb0cc" }}>
                  {k.status === "ne_pritje"
                    ? "Kërkesa u dërgua · në pritje të përgjigjes së shoferit"
                    : k.status === "pranuar"
                    ? "Vendi u konfirmua"
                    : "Kërkesa u refuzua nga shoferi"}
                </p>
                {/* Butoni mbetet i dukshëm edhe pas një përgjigjeje, që kërkimi të mund të përsëritet. */}
                {k.status !== "ne_pritje" ? (
                  <div style={{ marginTop: "0.75rem" }}>
                    {butoniKerko(k.status === "refuzuar" ? "Provo përsëri" : "Kërko një vend")}
                  </div>
                ) : null}
              </article>
            ))
          )}
        </>
      )}

      <p
        data-testid="statusi-leximit"
        style={{ marginTop: "1rem", fontWeight: 600, color: lidhur ? "#7bd88f" : "#f0b429" }}
      >
        {!lidhur
          ? "Po rilidhemi · të dhënat mund të jenë të vjetra"
          : lexuar
          ? "Gjendja u lexua nga serveri"
          : "Po lexojmë gjendjen…"}
      </p>
      <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        Përditësim automatik çdo 5 sekonda
      </p>
      {!lidhur ? (
        <p data-testid="veprimet-bllokuara" style={{ fontSize: "0.9rem", color: "#f0b429" }}>
          Veprimet që kërkojnë rrjet janë të bllokuara
        </p>
      ) : null}
      {mesazhi ? (
        <p role="status" style={{ marginTop: "0.5rem", fontWeight: 600 }}>
          {mesazhi}
        </p>
      ) : null}
    </section>
  );
}
