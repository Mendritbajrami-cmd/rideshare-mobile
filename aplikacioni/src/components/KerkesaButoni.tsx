"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function KerkesaButoni({ id, vende }: { id: string; vende: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [online, setOnline] = useState(true);
  const [mesazhi, setMesazhi] = useState("");
  const [dukeDerguar, setDukeDerguar] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    function onOnline() {
      setOnline(true);
    }
    function onOffline() {
      setOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function kerkoVend() {
    if (vende <= 0) return;
    setMesazhi("");
    setDukeDerguar(true);

    if (!session?.user) {
      setMesazhi("Hyr me GitHub që të dërgosh kërkesë për vend.");
      setDukeDerguar(false);
      setTimeout(() => router.push(`/udhetimi/${id}/kerkesa`), 800);
      return;
    }

    if (online) {
      try {
        const res = await fetch("/api/kerkesa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ udhetimiId: id }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.sukses) {
          setMesazhi("Kërkesa u dërgua me sukses.");
          setTimeout(() => router.push(`/udhetimi/${id}/kerkesa`), 700);
          return;
        }
        setMesazhi(data.gabim || "Nuk u dërgua dot kërkesa.");
        setTimeout(() => router.push(`/udhetimi/${id}/kerkesa`), 900);
        return;
      } catch {
        setMesazhi("Kërkesa do të dërgohet automatikisht kur të rikthehet lidhja me internet.");
        try {
          const key = "rideshare_pending_requests";
          const existing = JSON.parse(localStorage.getItem(key) || "[]") as Array<{ id: string; createdAt: string }>;
          const already = existing.some((x) => x.id === id);
          if (!already) {
            existing.push({ id, createdAt: new Date().toISOString() });
            localStorage.setItem(key, JSON.stringify(existing));
          }
        } catch {}
        setTimeout(() => router.push(`/udhetimi/${id}/kerkesa?offline=1`), 900);
        return;
      } finally {
        setDukeDerguar(false);
      }
    }

    try {
      const key = "rideshare_pending_requests";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as Array<{ id: string; createdAt: string }>;
      const already = existing.some((x) => x.id === id);
      if (!already) {
        existing.push({ id, createdAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(existing));
      }
      setMesazhi("Kërkesa do të dërgohet automatikisht kur të rikthehet lidhja me internet.");
      setTimeout(() => {
        router.push(`/udhetimi/${id}/kerkesa?offline=1`);
      }, 900);
    } catch {
      setMesazhi("Kërkesa do të dërgohet automatikisht kur të rikthehet lidhja me internet.");
      setTimeout(() => {
        router.push(`/udhetimi/${id}/kerkesa?offline=1`);
      }, 900);
    } finally {
      setDukeDerguar(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {vende > 0 ? (
        <button className="action" type="button" onClick={kerkoVend} disabled={dukeDerguar}>
          {dukeDerguar ? "Duke dërguar..." : online ? "Kërko vend" : "Kërko vend (pa internet)"}
        </button>
      ) : (
        <button className="action" disabled>
          Nuk ka vende të lira
        </button>
      )}
      {mesazhi && (
        <p role="status" style={{ marginTop: "0.75rem", fontWeight: "600" }}>
          {mesazhi}
        </p>
      )}
      {!online && vende > 0 && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.8 }}>
          Je pa internet. Klikimi ruan kërkesën dhe do të dërgohet kur të kthehet lidhja.
        </p>
      )}
    </div>
  );
}
