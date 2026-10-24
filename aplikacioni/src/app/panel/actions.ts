"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { lejohetNdryshimiOres } from "@/lib/lejet";

export type RezultatiOres = {
  mesazhi: string;
  sukses: boolean;
};

export async function ruajOren(formData: FormData): Promise<RezultatiOres> {
  const session = await getServerSession(authOptions);
  const login =
    (session?.user as { login?: string } | undefined)?.login ??
    session?.user?.name ??
    "";

  if (!session?.user || !login) {
    return { mesazhi: "Hyr me GitHub që të ndryshosh orën.", sukses: false };
  }

  const id = String(formData.get("id") ?? "");
  const ora = String(formData.get("ora") ?? "");
  if (!id || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(ora)) {
    return { mesazhi: "Të dhëna të gabuara.", sukses: false };
  }

  const leja = await lejohetNdryshimiOres(id, login);
  if (!leja.ok) {
    return { mesazhi: leja.arsyeja, sukses: false };
  }

  const sql = getSql();
  await sql`UPDATE udhetimet SET ora = ${ora} WHERE id = ${id}`;
  revalidatePath("/");
  revalidatePath("/panel");
  revalidatePath(`/udhetimi/${id}`);
  return { mesazhi: "Ora u ruajt me sukses", sukses: true };
}
