"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function PerpunuesKerkesave() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!session?.user) return;

    async function perpunoj() {
      try {
        const key = "rideshare_pending_requests";
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const lista = JSON.parse(raw) as Array<{ id: string; createdAt: string }>;
        if (!Array.isArray(lista) || lista.length === 0) return;

        const teMbetura: Array<{ id: string; createdAt: string }> = [];
        for (const kerkese of lista) {
          try {
            const res = await fetch("/api/kerkesa", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ udhetimiId: kerkese.id }),
            });
            if (!res.ok) {
              teMbetura.push(kerkese);
            }
            // nëse ok, fshihet
          } catch {
            teMbetura.push(kerkese);
          }
        }
        if (teMbetura.length === 0) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(teMbetura));
        }
      } catch {
        // injoro
      }
    }

    if (navigator.onLine) {
      perpunoj();
    }
    function onOnline() {
      perpunoj();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [session]);

  return null;
}
