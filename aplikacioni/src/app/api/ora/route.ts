import { auth } from "@/auth";
import { ndryshoOren } from "@/lib/udhetimet";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Kontrollo sesionin
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { gabim: "Nuk je i autentikuar. Hyr me GitHub fillimisht." },
      { status: 401 }
    );
  }

  // 2. Merr GitHub login nga profile URL ose name
  const githubLogin =
    (session.user as { login?: string }).login ??
    session.user.name ??
    "";

  // 3. Valido inputin
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.ora) {
    return NextResponse.json({ gabim: "Të dhëna të gabuara." }, { status: 400 });
  }

  const oraRe: string = body.ora;
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(oraRe)) {
    return NextResponse.json({ gabim: "Format ore i gabuar (HH:MM)." }, { status: 400 });
  }

  // 4. Ndrysho me kontroll pronësie
  try {
    await ndryshoOren(body.id, oraRe, githubLogin);
    return NextResponse.json({ sukses: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "jo_pronar") {
      return NextResponse.json(
        { gabim: "Nuk ke leje. Ky udhëtim nuk i përket llogarisë sate." },
        { status: 403 }
      );
    }
    if (msg === "nuk_ekziston") {
      return NextResponse.json({ gabim: "Udhëtimi nuk u gjet." }, { status: 404 });
    }
    return NextResponse.json({ gabim: "Gabim i brendshëm." }, { status: 500 });
  }
}
