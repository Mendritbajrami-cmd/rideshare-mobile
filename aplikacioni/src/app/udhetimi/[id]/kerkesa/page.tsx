import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { merrKerkesatPerUdhetarin } from "@/lib/kerkesa";

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
  const session = await getServerSession(authOptions);
  const udhetariLogin =
    (session?.user as { login?: string } | undefined)?.login ?? session?.user?.name ?? "";

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

  let kerkesaStatus: string | null = null;
  if (session?.user && udhetariLogin) {
    try {
      const lista = await merrKerkesatPerUdhetarin(udhetariLogin);
      const gjetur = lista.find((k) => k.udhetimi_id === id);
      if (gjetur) kerkesaStatus = gjetur.status;
    } catch {
      kerkesaStatus = null;
    }
  }

  return (
    <main>
      <Link href={`/udhetimi/${id}`}>← Kthehu te detajet</Link>
      {udhetim.vende > 0 ? (
        <>
          {kerkesaStatus === "pranuar" ? (
            <>
              <h1>Kërkesa u pranua</h1>
              <p>Kërkesa jote për {udhetim.nisja} → {udhetim.destinacioni} u pranua nga shoferi.</p>
              <p>Kontakto shoferin për detaje shtesë.</p>
            </>
          ) : kerkesaStatus === "refuzuar" ? (
            <>
              <h1>Kërkesa u refuzua</h1>
              <p>Kërkesa jote për {udhetim.nisja} → {udhetim.destinacioni} u refuzua nga shoferi.</p>
              <p>Mund të zgjedhësh një udhëtim tjetër nga lista.</p>
            </>
          ) : kerkesaStatus === "ne_pritje" ? (
            <>
              <h1>Simulim: Në pritje</h1>
              <p>Kërkesa për {udhetim.nisja} nuk është dërguar te shoferi.</p>
              <p>Ruajtjen dhe konfirmimin real do t’i shtojmë më vonë.</p>
              <p role="status" style={{ marginTop: "1rem", fontWeight: 600 }}>
                Kërkesa është dërguar dhe po pret përgjigjen e shoferit.
              </p>
            </>
          ) : ngaOffline ? (
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
              <h1>Simulim: Në pritje</h1>
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
