"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export type PreferencesInput = {
  units?:              string;
  defaultRestSeconds?: number;
  notifications?:      boolean;
  theme?:              string;
  language?:           string;
};

export async function updatePreferences(data: PreferencesInput) {
  const userId = await requireUserId();

  await prisma.userPreferences.upsert({
    where:  { userId },
    create: {
      userId,
      units:              data.units              ?? "kg",
      defaultRestSeconds: data.defaultRestSeconds ?? 90,
      notifications:      data.notifications      ?? true,
      theme:              data.theme              ?? "dark",
      language:           data.language           ?? "es",
    },
    update: {
      ...(data.units              !== undefined && { units:              data.units              }),
      ...(data.defaultRestSeconds !== undefined && { defaultRestSeconds: data.defaultRestSeconds }),
      ...(data.notifications      !== undefined && { notifications:      data.notifications      }),
      ...(data.theme              !== undefined && { theme:              data.theme              }),
      ...(data.language           !== undefined && { language:           data.language           }),
    },
  });

  revalidatePath("/profile");
}
