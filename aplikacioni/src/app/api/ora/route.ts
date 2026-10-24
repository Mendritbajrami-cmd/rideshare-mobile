import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { ndryshoOren } from "@/lib/udhetimet";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { gabim: "Nuk je i autentikuar. Hyr me GitHub fillimisht." },
      { status: 401 }
    );
  }

  const githubLogin =
    (session.user as { login?: string }).login ?? session.user.name ?? "";

  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.ora) {
    return NextResponse.json({ gabim: "Të dhëna të gabuara." }, { status: 400 });
  }

  const oraRe: string = body.ora;
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(oraRe)) {
    return NextResponse.json(
      { gabim: "Format ore i gabuar (HH:MM)." },
      { status: 400 }
    );
  }

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
      return NextResponse.json(
        { gabim: "Udhëtimi nuk u gjet." },
        { status: 404 }
      );
    }
    return NextResponse.json({ gabim: "Gabim i brendshëm." }, { status: 500 });
  }
}
