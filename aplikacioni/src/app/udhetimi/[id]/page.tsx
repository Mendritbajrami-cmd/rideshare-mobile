import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { KerkesaButoni } from "@/components/KerkesaButoni";
import { ZgjedhVendtakimin } from "@/components/ZgjedhVendtakimin";
import { PreferimiButoni } from "@/components/PreferimiButoni";
import { authOptions } from "@/lib/auth";
import { lexoPreferimin, numriPreferimeve } from "@/lib/preferimet";

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

  const session = await getServerSession(authOptions);
  const udhetariLogin =
    (session?.user as { login?: string } | undefined)?.login ?? "";

  let ruajturNisje = false;
  let numriNisje = 0;
  if (udhetariLogin) {
    try {
      ruajturNisje = await lexoPreferimin(udhetariLogin, id);
      numriNisje = await numriPreferimeve(udhetariLogin);
    } catch {
      ruajturNisje = false;
      numriNisje = 0;
    }
  }

  return (
    <main>
      <Link href="/">← Kthehu te lista</Link>
      <h1>{udhetim.nisja} – {udhetim.destinacioni}</h1>
      <p>Ora: {udhetim.ora}</p>
      <p>Vendtakimi: {udhetim.vendtakimi}</p>
      <p>Vende të lira: {udhetim.vende}</p>
      <KerkesaButoni id={id} vende={udhetim.vende} />
      <PreferimiButoni idUdhetimi={id} ruajturNisje={ruajturNisje} numriNisje={numriNisje} />
      <hr style={{ margin: "1.5rem 0" }} />
      <ZgjedhVendtakimin />
      <hr style={{ margin: "1.5rem 0" }} />
      <Link className="action" href={`/udhetimi/${id}/ndrysho`}>
        🕐 Ndrysho orën (vetëm shoferi)
      </Link>
    </main>
  );
}
