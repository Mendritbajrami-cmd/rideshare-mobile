import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { lexoGjendjenEUdhetimit } from "@/lib/kerkesa";

// Lexim vetëm: kthen gjendjen që ky sesion ka të drejtë të shohë.
// Nuk ndryshon asnjë të dhënë; pranimi bëhet te /api/kerkesa/[id].
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { gabim: "Nuk je i autentikuar." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const login =
    (session.user as { login?: string }).login ?? session.user.name ?? "";
  if (!login) {
    return NextResponse.json(
      { gabim: "Nuk mund të identifikohemi." },
      { status: 400 }
    );
  }

  const { id } = await params;
  let gjendja;
  try {
    gjendja = await lexoGjendjenEUdhetimit(id, login);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { gabim: "Nuk u lexua dot gjendja." },
      { status: 500 }
    );
  }

  if (!gjendja) {
    return NextResponse.json({ gabim: "Udhëtimi nuk u gjet." }, { status: 404 });
  }

  return NextResponse.json(gjendja, {
    headers: { "Cache-Control": "no-store" },
  });
}
