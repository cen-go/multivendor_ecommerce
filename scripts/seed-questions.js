/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const questionsPath = path.join(process.cwd(), "scripts", "questions.json");
  const raw = fs.readFileSync(questionsPath, "utf8");
  const questions = JSON.parse(raw);

  for (const q of questions) {
    // ensure parent variant exists
    const product = await db.product.findUnique({ where: { id: q.productId } });
    if (!product) {
      console.warn(`Skipping question ${q.id}: product ${q.productId} not found.`);
      continue;
    }

    await db.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        question: q.question,
        answer: q.answer,
        productId: q.productId,
      },
      update: {
        question: q.question,
        answer: q.answer,
        productId: q.productId,
      },
    });

    console.log(`Upserted question ${q.id}`);
  }
}

main()
  .then(() => {
    console.log("Questions seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });