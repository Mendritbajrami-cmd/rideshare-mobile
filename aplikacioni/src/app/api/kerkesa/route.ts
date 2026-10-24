import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { krijoKerkese } from "@/lib/kerkesa";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { gabim: "Nuk je i autentikuar. Hyr me GitHub fillimisht." },
      { status: 401 }
    );
  }

  const udhetariLogin =
    (session.user as { login?: string }).login ?? session.user.name ?? "";

  if (!udhetariLogin) {
    return NextResponse.json({ gabim: "Nuk mund të identifikohemi." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const udhetimiId = body?.udhetimiId || body?.id;

  if (!udhetimiId) {
    return NextResponse.json({ gabim: "Të dhëna të gabuara." }, { status: 400 });
  }

  const rez = await krijoKerkese(String(udhetimiId), udhetariLogin);
  if (!rez.ok) {
    return NextResponse.json({ gabim: rez.arsyeja }, { status: 400 });
  }

  return NextResponse.json({ sukses: true });
}
