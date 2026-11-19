"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INTERVALI_MS = 5000;

// Rifreskon përmbajtjen e serverit çdo 5 sekonda. Të dhënat (përfshirë
// kufirin e kërkesave) llogariten nga serveri, ndaj ora e klientit nuk
// ndikon në përmbajtje. Kur nuk ka lidhje, rifreskimi pauzohet dhe nis
// menjëherë pas rikthimit.
export function RifreskimiAutomatik({
  etiketa = "Përditësim automatik çdo 5 sekonda",
}: {
  etiketa?: string;
}) {
  const router = useRouter();
  const [lidhur, setLindhur] = useState(true);
  const [rifreskuar, setRifreskuar] = useState(false);

  useEffect(() => {
    let aktiv = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function planifiko() {
      if (!aktiv) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(tik, INTERVALI_MS);
    }

    function tik() {
      if (!aktiv) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setLindhur(false);
        planifiko();
        return;
      }
      setLindhur(true);
      router.refresh();
      setRifreskuar(true);
      planifiko();
    }

    function kurKthehetLidhja() {
      setLindhur(true);
      if (timer) clearTimeout(timer);
      tik();
    }

    function kurHumbLidhja() {
      setLindhur(false);
    }

    planifiko();
    window.addEventListener("online", kurKthehetLidhja);
    window.addEventListener("offline", kurHumbLidhja);

    return () => {
      aktiv = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", kurKthehetLidhja);
      window.removeEventListener("offline", kurHumbLidhja);
    };
  }, [router]);

  return (
    <p
      data-testid="rifreskimi"
      aria-live="polite"
      style={{
        marginTop: "0.75rem",
        fontSize: "0.9rem",
        fontWeight: 600,
        color: lidhur ? "#7bd88f" : "#f0b429",
      }}
    >
      {!lidhur
        ? "Nuk ka lidhje · po presim rikthimin"
        : rifreskuar
        ? `${etiketa} · u përditësua`
        : etiketa}
    </p>
  );
}
