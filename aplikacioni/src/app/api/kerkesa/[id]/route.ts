import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { pergjigjuKerkeses } from "@/lib/kerkesa";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ gabim: "Nuk je i autentikuar." }, { status: 401 });
  }

  const shoferLogin =
    (session.user as { login?: string }).login ?? session.user.name ?? "";

  if (!shoferLogin) {
    return NextResponse.json({ gabim: "Nuk mund të identifikohemi." }, { status: 400 });
  }

  const { id } = await params;
  const kerkesaId = Number(id);

  const body = await req.json().catch(() => null);
  const vendim = body?.vendim;

  if (vendim !== "pranuar" && vendim !== "refuzuar") {
    return NextResponse.json({ gabim: "Vendim i pavlefshëm." }, { status: 400 });
  }

  const rez = await pergjigjuKerkeses(kerkesaId, shoferLogin, vendim);
  if (!rez.ok) {
    return NextResponse.json({ gabim: rez.arsyeja }, { status: 400 });
  }

  return NextResponse.json({ sukses: true, vendim });
}
