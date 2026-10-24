import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Kerkesa({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ offline?: string }>;
}) {
  const { id } = await params;
  const { offline } = await searchParams;
  let udhetim;
  try {
    udhetim = await gjejUdhetimin(id);
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link href="/">← Kthehu te lista</Link>
      </main>
    );
  }
  if (!udhetim) notFound();

  const ngaOffline = offline === "1";

  return (
    <main>
      <Link href={`/udhetimi/${id}`}>← Kthehu te detajet</Link>
      {udhetim.vende > 0 ? (
        <>
          <h1>{ngaOffline ? "Në pritje (ruajtur)" : "Simulim: Në pritje"}</h1>
          {ngaOffline ? (
            <>
              <h1>Simulim: Në pritje</h1>
              <p>Kërkesa për {udhetim.nisja} nuk është dërguar te shoferi.</p>
              <p>Ruajtjen dhe konfirmimin real do t’i shtojmë më vonë.</p>
              <p role="status" style={{ marginTop: "1rem", fontWeight: 600 }}>
                Kërkesa u ruajt në pajisjen tënde. Do të dërgohet automatikisht kur të rikthehet lidhja me internet.
              </p>
            </>
          ) : (
            <>
              <p>Kërkesa për {udhetim.nisja} nuk është dërguar te shoferi.</p>
              <p>Ruajtjen dhe konfirmimin real do t’i shtojmë më vonë.</p>
            </>
          )}
        </>
      ) : (
        <h1>Nuk ka vende të lira.</h1>
      )}
    </main>
  );
}
