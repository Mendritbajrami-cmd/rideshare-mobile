import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { merRolin } from "@/lib/lejet";
import { lexoUdhetimet, type Udhetim } from "@/lib/udhetimet";

// Force fresh database read on every request without caching.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const session = await getServerSession(authOptions);
  const login =
    (session?.user as { login?: string } | undefined)?.login ??
    session?.user?.name ??
    "";

  // Butoni i panelit shfaqet vetëm për llogaritë me rol shofer.
  let eshteShofer = false;
  if (session?.user && login) {
    try {
      eshteShofer = (await merRolin(login)) === "shofer";
    } catch {
      eshteShofer = false;
    }
  }

  let udhetimet: Udhetim[];
  try {
    udhetimet = await lexoUdhetimet();
  } catch {
    return (
      <main>
        <h1>RideShare</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <a className="action" href="/">Provo përsëri</a>
      </main>
    );
  }

  return (
    <main>
      <h1>RideShare · Udhëtimet për AAB</h1>
      <p>Burimi: Neon · të dhëna fiktive për ushtrime</p>
      {eshteShofer ? (
        <p>
          <a className="action" href="/panel">
            Paneli i shoferit
          </a>
        </p>
      ) : null}
      {udhetimet.length === 0 ? (
        <p>Nuk ka udhëtime për momentin.</p>
      ) : (
        <div className="trip-list">
          {udhetimet.map((udhetim) => (
            <KartaUdhetimi key={udhetim.id} udhetim={udhetim} />
          ))}
        </div>
      )}
    </main>
  );
}