"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

/** Inicia una sesión para el día indicado. Si ya hay una activa, la devuelve. */
export async function startSession(dayId: string | null) {
  const userId = await requireUserId();
  const existing = await prisma.workoutSession.findFirst({
    where: { userId, finishedAt: null },
  });
  if (existing) return existing;

  const session = await prisma.workoutSession.create({
    data: { userId, dayId },
  });
  revalidatePath("/workout");
  revalidatePath("/dashboard");
  return session;
}

export async function finishSession(sessionId: string, notes?: string) {
  const userId = await requireUserId();
  const s = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
  if (!s || s.userId !== userId) throw new Error("Sin permisos");
  const updated = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { finishedAt: new Date(), ...(notes ? { notes } : {}) },
  });
  revalidatePath("/workout");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  return updated;
}

export async function updateSessionNotes(sessionId: string, notes: string) {
  const userId = await requireUserId();
  const s = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
  if (!s || s.userId !== userId) throw new Error("Sin permisos");
  await prisma.workoutSession.update({ where: { id: sessionId }, data: { notes } });
}

export type LogSetInput = {
  sessionId:  string;
  exerciseId: string;
  setNumber:  number;
  weight:     number;
  reps:       number;
  rpe:        number | null;
  done:       boolean;
};

export async function logSet(input: LogSetInput) {
  const userId = await requireUserId();
  const session = await prisma.workoutSession.findUnique({
    where: { id: input.sessionId },
  });
  if (!session || session.userId !== userId) throw new Error("Sin permisos");

  const record = await prisma.setRecord.upsert({
    where: {
      sessionId_exerciseId_setNumber: {
        sessionId:  input.sessionId,
        exerciseId: input.exerciseId,
        setNumber:  input.setNumber,
      },
    },
    create: {
      sessionId:  input.sessionId,
      exerciseId: input.exerciseId,
      setNumber:  input.setNumber,
      weight:     input.weight,
      reps:       input.reps,
      rpe:        input.rpe,
      done:       input.done,
    },
    update: {
      weight: input.weight,
      reps:   input.reps,
      rpe:    input.rpe,
      done:   input.done,
    },
  });
  return record;
}

export async function deleteSet(sessionId: string, exerciseId: string, setNumber: number) {
  const userId = await requireUserId();
  const s = await prisma.workoutSession.findUnique({ where: { id: sessionId } });
  if (!s || s.userId !== userId) throw new Error("Sin permisos");
  await prisma.setRecord.deleteMany({
    where: { sessionId, exerciseId, setNumber },
  });
}
