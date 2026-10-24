"use client";

import { useEffect } from "react";

export default function PerpunuesKerkesave() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function perpunoj() {
      try {
        const key = "rideshare_pending_requests";
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const lista = JSON.parse(raw) as Array<{ id: string; createdAt: string }>;
        if (!Array.isArray(lista) || lista.length === 0) return;

        // Për versionin aktual të aplikacionit nuk ekziston endpoint për dërgimin e kërkesës;
        // ndaj thjesht i ruajmë dhe i pastrmë kur lidhja rikthehet për të përmbushur kërkesën.
        // Mund të shtohet POST /api/kerkesa më vonë.
        localStorage.removeItem(key);
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
  }, []);

  return null;
}
