"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { eshteShofer, lejohetNdryshimiOres, merRolin } from "@/lib/lejet";
import { shtoUdhetim } from "@/lib/udhetimet";

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

export type RezultatiUdhetimit = {
  mesazhi: string;
  sukses: boolean;
  id?: string;
};

export async function shtoUdhetimin(
  formData: FormData
): Promise<RezultatiUdhetimit> {
  const session = await getServerSession(authOptions);
  const login =
    (session?.user as { login?: string } | undefined)?.login ??
    session?.user?.name ??
    "";

  if (!session?.user || !login) {
    return { mesazhi: "Hyr me GitHub që të shtosh udhëtim.", sukses: false };
  }

  if ((await merRolin(login)) !== "shofer") {
    return {
      mesazhi: "Vetëm llogaritë me rol shofer mund të shtojnë udhëtime.",
      sukses: false,
    };
  }

  const nisja = String(formData.get("nisja") ?? "").trim();
  const destinacioni = String(formData.get("destinacioni") ?? "").trim();
  const ora = String(formData.get("ora") ?? "").trim();
  const vendtakimi = String(formData.get("vendtakimi") ?? "").trim();
  const vende = Number(formData.get("vende"));
  const shoferi = String(formData.get("shoferi") ?? "").trim();

  if (!nisja || !destinacioni || !vendtakimi) {
    return { mesazhi: "Plotëso nisjen, destinacionin dhe vendtakimin.", sukses: false };
  }
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(ora)) {
    return { mesazhi: "Ora duhet të jetë në formatin HH:MM.", sukses: false };
  }
  if (!Number.isInteger(vende) || vende < 0 || vende > 20) {
    return { mesazhi: "Vendet duhet të jenë numër nga 0 deri në 20.", sukses: false };
  }
  // Vetëm shoferët e autorizuar pranohen; lista vjen nga profilet, jo nga klienti.
  if (!shoferi || !(await eshteShofer(shoferi))) {
    return { mesazhi: "Zgjidh një shofer të autorizuar.", sukses: false };
  }

  try {
    const id = await shtoUdhetim({ nisja, destinacioni, ora, vendtakimi, vende, shoferId: shoferi });
    revalidatePath("/");
    revalidatePath("/panel");
    revalidatePath(`/udhetimi/${id}`);
    return { mesazhi: `Udhëtimi u shtua (ID ${id}).`, sukses: true, id };
  } catch {
    return { mesazhi: "Udhëtimi nuk u shtua. Provo përsëri.", sukses: false };
  }
}
