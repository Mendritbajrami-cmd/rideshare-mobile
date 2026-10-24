import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { KerkesaButoni } from "@/components/KerkesaButoni";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Detajet({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  return (
    <main>
      <Link href="/">← Kthehu te lista</Link>
      <h1>{udhetim.nisja} – {udhetim.destinacioni}</h1>
      <p>Ora: {udhetim.ora}</p>
      <p>Vendtakimi: {udhetim.vendtakimi}</p>
      <p>Vende të lira: {udhetim.vende}</p>
      <KerkesaButoni id={id} vende={udhetim.vende} />
      <hr style={{ margin: "1.5rem 0" }} />
      <Link className="action" href={`/udhetimi/${id}/ndrysho`}>
        🕐 Ndrysho orën (vetëm shoferi)
      </Link>
    </main>
  );
}
