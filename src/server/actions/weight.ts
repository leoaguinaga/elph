"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function addWeightEntry({
  weight,
  date,
}: {
  weight: number;
  date?: Date;
}) {
  const userId = await requireUserId();
  const entryDate = date ?? new Date();
  // Normalize to midnight UTC so one entry per day
  const d = new Date(entryDate);
  d.setHours(0, 0, 0, 0);

  // Upsert: one entry per user per day
  const existing = await prisma.weightEntry.findFirst({
    where: { userId, date: d },
  });

  if (existing) {
    await prisma.weightEntry.update({
      where: { id: existing.id },
      data:  { weight },
    });
  } else {
    await prisma.weightEntry.create({
      data: { userId, weight, date: d },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function deleteWeightEntry(id: string) {
  const userId = await requireUserId();
  const entry = await prisma.weightEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== userId) throw new Error("Sin permisos");
  await prisma.weightEntry.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
