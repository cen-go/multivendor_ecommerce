/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const colorsPath = path.join(process.cwd(), "scripts", "colors.json");
  const raw = fs.readFileSync(colorsPath, "utf8");
  const colors = JSON.parse(raw);

  for (const c of colors) {
    // ensure parent variant exists
    const variant = await db.productVariant.findUnique({ where: { id: c.productVariantId } });
    if (!variant) {
      console.warn(`Skipping color ${c.id}: productVariant ${c.productVariantId} not found.`);
      continue;
    }

    await db.color.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        name: c.name,
        productVariantId: c.productVariantId,
      },
      update: {
        name: c.name,
        productVariantId: c.productVariantId,
      },
    });

    console.log(`Upserted color ${c.id}`);
  }
}

main()
  .then(() => {
    console.log("Colors seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });