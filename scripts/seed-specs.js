/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const specsPath = path.join(process.cwd(), "scripts", "specs.json");
  const raw = fs.readFileSync(specsPath, "utf8");
  const specs = JSON.parse(raw);

  for (const s of specs) {

    await db.spec.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        name: s.name,
        value: s.value,
        variantId: s.variantId,
        productId: s.productId,
      },
      update: {
        name: s.name,
        value: s.value,
        variantId: s.variantId,
        productId: s.productId,
      },
    });

    console.log(`Upserted spec ${s.id}`);
  }
}

main()
  .then(() => {
    console.log("Specs seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });