/**
 * Prisma seed script.
 *
 * Idempotent: re-run safely with `pnpm db:seed`.
 *
 * Seeds:
 *  1. Catálogo de ejercicios del sistema (userId = null) — compartido para todos.
 *  2. Tips globales.
 *  3. Si existe el usuario `carlos@ejemplo.com`: plan PPL activo + preferencias
 *     + sesiones históricas con sets para que las pantallas tengan datos reales.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── 1. Ejercicios del sistema ──────────────────────────────────────────────
const SYSTEM_EXERCISES = [
  // Pecho
  { name: "Press banca con barra",          muscle: "Pecho",      equipment: "Barra"      },
  { name: "Press inclinado con mancuernas", muscle: "Pecho",      equipment: "Mancuernas" },
  { name: "Press declinado con barra",      muscle: "Pecho",      equipment: "Barra"      },
  { name: "Aperturas con mancuernas",       muscle: "Pecho",      equipment: "Mancuernas" },
  { name: "Cruces en polea",                muscle: "Pecho",      equipment: "Polea"      },

  // Espalda
  { name: "Dominadas",                      muscle: "Espalda",    equipment: "Peso corp." },
  { name: "Remo con barra",                 muscle: "Espalda",    equipment: "Barra"      },
  { name: "Remo con mancuerna",             muscle: "Espalda",    equipment: "Mancuernas" },
  { name: "Jalón al pecho",                 muscle: "Espalda",    equipment: "Polea"      },
  { name: "Peso muerto",                    muscle: "Espalda",    equipment: "Barra"      },

  // Hombros
  { name: "Press militar de pie",           muscle: "Hombros",    equipment: "Barra"      },
  { name: "Press Arnold",                   muscle: "Hombros",    equipment: "Mancuernas" },
  { name: "Elevaciones laterales",          muscle: "Hombros",    equipment: "Mancuernas" },
  { name: "Pájaros",                        muscle: "Hombros",    equipment: "Mancuernas" },
  { name: "Face pull",                      muscle: "Hombros",    equipment: "Polea"      },

  // Brazos
  { name: "Curl con barra Z",               muscle: "Bíceps",     equipment: "Barra Z"    },
  { name: "Curl martillo",                  muscle: "Bíceps",     equipment: "Mancuernas" },
  { name: "Curl en banco inclinado",        muscle: "Bíceps",     equipment: "Mancuernas" },
  { name: "Fondos en paralelas",            muscle: "Tríceps",    equipment: "Peso corp." },
  { name: "Extensiones de tríceps en polea", muscle: "Tríceps",   equipment: "Polea"      },
  { name: "Press francés",                  muscle: "Tríceps",    equipment: "Barra Z"    },

  // Pierna
  { name: "Sentadilla con barra",           muscle: "Cuádriceps", equipment: "Barra"      },
  { name: "Sentadilla frontal",             muscle: "Cuádriceps", equipment: "Barra"      },
  { name: "Prensa de pierna",               muscle: "Cuádriceps", equipment: "Máquina"    },
  { name: "Extensión de cuádriceps",        muscle: "Cuádriceps", equipment: "Máquina"    },
  { name: "Zancadas con mancuernas",        muscle: "Cuádriceps", equipment: "Mancuernas" },
  { name: "Peso muerto rumano",             muscle: "Femoral",    equipment: "Barra"      },
  { name: "Curl femoral en máquina",        muscle: "Femoral",    equipment: "Máquina"    },
  { name: "Hip thrust",                     muscle: "Glúteo",     equipment: "Barra"      },
  { name: "Patada de glúteo en polea",      muscle: "Glúteo",     equipment: "Polea"      },
  { name: "Elevación de gemelos de pie",    muscle: "Gemelos",    equipment: "Máquina"    },
];

// ── 2. Tips globales ────────────────────────────────────────────────────────
const TIPS = [
  { content: "Antes del press de banca, activa el manguito rotador con 2 series de rotaciones externas con banda. Reduce el riesgo de lesión en hombro.", muscle: "Hombros", category: "Calentamiento" },
  { content: "Si tu RPE en la primera serie ya es 9+, baja un 5% el peso para las siguientes series. Acumular fatiga en la primera serie compromete el volumen total.", category: "Programación" },
  { content: "El peso muerto pesado no debería entrenarse más de una vez por semana. La recuperación del sistema nervioso central toma 5-7 días.", muscle: "Espalda", category: "Recuperación" },
  { content: "Para hipertrofia, la mayoría de tus series deberían terminar a 1-3 reps del fallo (RPE 7-9). Ir al fallo en cada serie es contraproducente.", category: "Programación" },
  { content: "En sentadilla, mira al frente o ligeramente hacia abajo, no al techo. Extender el cuello rompe la cadena cinética.", muscle: "Cuádriceps", category: "Técnica" },
  { content: "Bebe 500ml de agua 1h antes de entrenar y 250ml cada 15-20 min durante la sesión. La deshidratación reduce fuerza hasta un 10%.", category: "Nutrición" },
  { content: "Para crecer hombro lateral, las elevaciones laterales con tempo controlado en la bajada (3s) son más efectivas que aumentar peso.", muscle: "Hombros", category: "Técnica" },
  { content: "Si llevas 3+ semanas sin progresar en un ejercicio, cambia rangos de reps o varía el ejercicio. La estancación prolongada suele ser fatiga acumulada.", category: "Programación" },
  { content: "El curl con mancuernas en banco inclinado pone más estiramiento sobre el bíceps que el curl de pie. Mayor rango = mayor crecimiento.", muscle: "Bíceps", category: "Técnica" },
  { content: "Dormir 7-9 horas no es opcional. La síntesis proteica y la consolidación neural ocurren durante el sueño profundo.", category: "Recuperación" },
];

async function main() {
  console.log("🌱 Seeding…");

  // 1. Ejercicios del sistema (upsert por nombre cuando userId = null)
  let exercisesUpserted = 0;
  for (const ex of SYSTEM_EXERCISES) {
    // Búsqueda manual porque no hay un unique combinado con userId=null + name
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, userId: null },
    });
    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: { muscle: ex.muscle, equipment: ex.equipment },
      });
    } else {
      await prisma.exercise.create({ data: { ...ex, userId: null } });
    }
    exercisesUpserted++;
  }
  console.log(`✔ ${exercisesUpserted} ejercicios del sistema`);

  // 2. Tips
  let tipsUpserted = 0;
  for (const tip of TIPS) {
    const existing = await prisma.tip.findFirst({ where: { content: tip.content } });
    if (!existing) {
      await prisma.tip.create({ data: tip });
      tipsUpserted++;
    }
  }
  console.log(`✔ ${tipsUpserted} tips nuevos (${TIPS.length} total)`);

  // 3. Datos del usuario de prueba (si existe)
  const carlos = await prisma.user.findUnique({ where: { email: "carlos@ejemplo.com" } });
  if (!carlos) {
    console.log("ℹ Usuario carlos@ejemplo.com no existe — saltando datos demo.");
    return;
  }

  // 3a. Preferencias
  await prisma.userPreferences.upsert({
    where: { userId: carlos.id },
    create: { userId: carlos.id },
    update: {},
  });

  // 3b. Plan PPL activo
  let plan = await prisma.workoutPlan.findFirst({
    where: { userId: carlos.id, name: "Push · Pull · Legs" },
    include: { days: true },
  });
  if (!plan) {
    plan = await prisma.workoutPlan.create({
      data: {
        userId: carlos.id,
        name: "Push · Pull · Legs",
        goal: "Hipertrofia",
        isActive: true,
      },
      include: { days: true },
    });
  } else {
    // Asegurar que sea el activo
    await prisma.workoutPlan.updateMany({
      where: { userId: carlos.id, NOT: { id: plan.id } },
      data: { isActive: false },
    });
    await prisma.workoutPlan.update({ where: { id: plan.id }, data: { isActive: true } });
  }

  // 3c. Días del plan
  const ex = async (name: string) => {
    const e = await prisma.exercise.findFirst({ where: { name, userId: null } });
    if (!e) throw new Error(`Falta ejercicio del sistema: ${name}`);
    return e.id;
  };

  const DAY_TEMPLATES = [
    {
      dayName: "Lunes",     sessionName: "Empuje A",  isRest: false, order: 0,
      exercises: [
        { name: "Press banca con barra",           targetSets: 4, targetReps: "6-8",   restSeconds: 120 },
        { name: "Press inclinado con mancuernas",  targetSets: 3, targetReps: "8-10",  restSeconds: 90  },
        { name: "Press militar de pie",            targetSets: 4, targetReps: "6-8",   restSeconds: 120 },
        { name: "Elevaciones laterales",           targetSets: 3, targetReps: "12-15", restSeconds: 60  },
        { name: "Fondos en paralelas",             targetSets: 3, targetReps: "AMRAP", restSeconds: 90  },
        { name: "Extensiones de tríceps en polea", targetSets: 3, targetReps: "10-12", restSeconds: 60  },
      ],
    },
    {
      dayName: "Martes",    sessionName: "Jalón A",   isRest: false, order: 1,
      exercises: [
        { name: "Dominadas",            targetSets: 4, targetReps: "6-10",  restSeconds: 120 },
        { name: "Remo con barra",       targetSets: 4, targetReps: "8-10",  restSeconds: 90  },
        { name: "Jalón al pecho",       targetSets: 3, targetReps: "10-12", restSeconds: 75  },
        { name: "Face pull",            targetSets: 3, targetReps: "12-15", restSeconds: 60  },
        { name: "Curl con barra Z",     targetSets: 3, targetReps: "8-12",  restSeconds: 60  },
        { name: "Curl martillo",        targetSets: 3, targetReps: "10-12", restSeconds: 60  },
      ],
    },
    { dayName: "Miércoles", sessionName: "Descanso",  isRest: true,  order: 2, exercises: [] },
    {
      dayName: "Jueves",    sessionName: "Pierna",    isRest: false, order: 3,
      exercises: [
        { name: "Sentadilla con barra",      targetSets: 4, targetReps: "6-8",   restSeconds: 150 },
        { name: "Peso muerto rumano",        targetSets: 3, targetReps: "8-10",  restSeconds: 120 },
        { name: "Prensa de pierna",          targetSets: 3, targetReps: "10-12", restSeconds: 90  },
        { name: "Curl femoral en máquina",   targetSets: 3, targetReps: "10-12", restSeconds: 75  },
        { name: "Hip thrust",                targetSets: 3, targetReps: "10-12", restSeconds: 90  },
        { name: "Extensión de cuádriceps",   targetSets: 3, targetReps: "12-15", restSeconds: 60  },
        { name: "Elevación de gemelos de pie", targetSets: 4, targetReps: "12-15", restSeconds: 60  },
      ],
    },
    {
      dayName: "Viernes",   sessionName: "Empuje A",  isRest: false, order: 4,
      exercises: [
        { name: "Press banca con barra",           targetSets: 4, targetReps: "6-8",   restSeconds: 120 },
        { name: "Press inclinado con mancuernas",  targetSets: 3, targetReps: "8-10",  restSeconds: 90  },
        { name: "Press militar de pie",            targetSets: 4, targetReps: "6-8",   restSeconds: 120 },
        { name: "Elevaciones laterales",           targetSets: 3, targetReps: "12-15", restSeconds: 60  },
        { name: "Fondos en paralelas",             targetSets: 3, targetReps: "AMRAP", restSeconds: 90  },
        { name: "Extensiones de tríceps en polea", targetSets: 3, targetReps: "10-12", restSeconds: 60  },
      ],
    },
    {
      dayName: "Sábado",    sessionName: "Jalón B",   isRest: false, order: 5,
      exercises: [
        { name: "Peso muerto",        targetSets: 3, targetReps: "5-6",  restSeconds: 180 },
        { name: "Dominadas",          targetSets: 4, targetReps: "6-10", restSeconds: 120 },
        { name: "Remo con mancuerna", targetSets: 3, targetReps: "10-12", restSeconds: 75 },
        { name: "Face pull",          targetSets: 3, targetReps: "12-15", restSeconds: 60 },
        { name: "Curl con barra Z",   targetSets: 3, targetReps: "8-12",  restSeconds: 60 },
        { name: "Curl en banco inclinado", targetSets: 3, targetReps: "10-12", restSeconds: 60 },
      ],
    },
    { dayName: "Domingo",   sessionName: "Descanso",  isRest: true,  order: 6, exercises: [] },
  ];

  // Borrar los días existentes y recrear
  await prisma.workoutDay.deleteMany({ where: { planId: plan.id } });
  for (const d of DAY_TEMPLATES) {
    const day = await prisma.workoutDay.create({
      data: {
        planId: plan.id,
        dayName: d.dayName,
        sessionName: d.sessionName,
        isRest: d.isRest,
        order: d.order,
      },
    });
    for (let i = 0; i < d.exercises.length; i++) {
      const e = d.exercises[i];
      await prisma.dayExercise.create({
        data: {
          dayId:       day.id,
          exerciseId:  await ex(e.name),
          order:       i,
          targetSets:  e.targetSets,
          targetReps:  e.targetReps,
          restSeconds: e.restSeconds,
        },
      });
    }
  }
  console.log("✔ Plan PPL recreado para carlos@ejemplo.com");

  // 3d. Historial: 4 semanas de sesiones con sets
  const HISTORY_WEEKS = 4;
  const now = new Date();
  // Limpiar historial previo del seed (sesiones de antes de hoy)
  await prisma.workoutSession.deleteMany({
    where: { userId: carlos.id, startedAt: { lt: now } },
  });

  const benchId = await ex("Press banca con barra");
  const squatId = await ex("Sentadilla con barra");
  const ohpId   = await ex("Press militar de pie");
  const dlId    = await ex("Peso muerto");

  // Generamos 3 sesiones por semana, 4 semanas atrás
  let sessionsCreated = 0;
  let setsCreated = 0;
  for (let w = HISTORY_WEEKS; w >= 1; w--) {
    // Lunes - Empuje
    const empujeDay = new Date(now);
    empujeDay.setDate(empujeDay.getDate() - (w * 7 + 4));
    const sEmpuje = await prisma.workoutSession.create({
      data: { userId: carlos.id, startedAt: empujeDay, finishedAt: new Date(empujeDay.getTime() + 55 * 60_000) },
    });
    const benchWeek = 77.5 + (HISTORY_WEEKS - w) * 2.5; // progresión
    const ohpWeek   = 47.5 + (HISTORY_WEEKS - w) * 2.5;
    for (let s = 1; s <= 4; s++) {
      await prisma.setRecord.create({ data: { sessionId: sEmpuje.id, exerciseId: benchId, setNumber: s, weight: benchWeek, reps: 7 - (s - 1), rpe: 7 + (s - 1) * 0.5, done: true } });
      setsCreated++;
    }
    for (let s = 1; s <= 4; s++) {
      await prisma.setRecord.create({ data: { sessionId: sEmpuje.id, exerciseId: ohpId, setNumber: s, weight: ohpWeek, reps: 7 - (s - 1), rpe: 7 + (s - 1) * 0.5, done: true } });
      setsCreated++;
    }
    sessionsCreated++;

    // Jueves - Pierna
    const piernaDay = new Date(now);
    piernaDay.setDate(piernaDay.getDate() - (w * 7 + 1));
    const sPierna = await prisma.workoutSession.create({
      data: { userId: carlos.id, startedAt: piernaDay, finishedAt: new Date(piernaDay.getTime() + 65 * 60_000) },
    });
    const squatWeek = 95 + (HISTORY_WEEKS - w) * 5;
    for (let s = 1; s <= 4; s++) {
      await prisma.setRecord.create({ data: { sessionId: sPierna.id, exerciseId: squatId, setNumber: s, weight: squatWeek, reps: 6, rpe: 7 + (s - 1) * 0.5, done: true } });
      setsCreated++;
    }
    sessionsCreated++;

    // Sábado - Jalón B (con peso muerto)
    const jalonDay = new Date(now);
    jalonDay.setDate(jalonDay.getDate() - (w * 7 - 1));
    const sJalon = await prisma.workoutSession.create({
      data: { userId: carlos.id, startedAt: jalonDay, finishedAt: new Date(jalonDay.getTime() + 50 * 60_000) },
    });
    const dlWeek = 100 + (HISTORY_WEEKS - w) * 5;
    for (let s = 1; s <= 3; s++) {
      await prisma.setRecord.create({ data: { sessionId: sJalon.id, exerciseId: dlId, setNumber: s, weight: dlWeek, reps: 5, rpe: 7.5 + (s - 1) * 0.5, done: true } });
      setsCreated++;
    }
    sessionsCreated++;
  }
  console.log(`✔ Historial: ${sessionsCreated} sesiones, ${setsCreated} sets`);

  // 3e. Entradas de peso (30 días)
  await prisma.weightEntry.deleteMany({ where: { userId: carlos.id } });
  for (let d = 30; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    // Tendencia descendente con variación
    const weight = 80.5 - (30 - d) * 0.07 + (Math.random() - 0.5) * 0.3;
    await prisma.weightEntry.create({
      data: { userId: carlos.id, weight: Math.round(weight * 10) / 10, date },
    });
  }
  console.log("✔ 31 entradas de peso");

  // 3f. Achievements de ejemplo
  await prisma.achievement.deleteMany({ where: { userId: carlos.id } });
  await prisma.achievement.createMany({
    data: [
      { userId: carlos.id, type: "PR",        title: "Press Banca · 85 kg",     subtitle: "Hace 3 días",            achievedAt: new Date(now.getTime() - 3 * 24 * 3_600_000) },
      { userId: carlos.id, type: "Streak",    title: "4 semanas consecutivas",  subtitle: "Constancia · Sept 2025", achievedAt: new Date(now.getTime() - 7 * 24 * 3_600_000) },
      { userId: carlos.id, type: "Milestone", title: "100 sesiones totales",    subtitle: "Hito alcanzado",         achievedAt: new Date(now.getTime() - 14 * 24 * 3_600_000) },
    ],
  });
  console.log("✔ 3 achievements");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
