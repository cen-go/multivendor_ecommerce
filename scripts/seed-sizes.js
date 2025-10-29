/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const sizesPath = path.join(process.cwd(), "scripts", "sizes.json");
  const raw = fs.readFileSync(sizesPath, "utf8");
  const sizes = JSON.parse(raw);

  for (const s of sizes) {
    // ensure parent variant exists
    const variant = await db.productVariant.findUnique({ where: { id: s.productVariantId } });
    if (!variant) {
      console.warn(`Skipping size ${s.id}: productVariant ${s.productVariantId} not found.`);
      continue;
    }

    await db.size.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        size: s.size,
        quantity: s.quantity,
        price: s.price,
        discount: s.discount ?? 0,
        productVariantId: s.productVariantId,
      },
      update: {
        size: s.size,
        quantity: s.quantity,
        price: s.price,
        discount: s.discount ?? 0,
        productVariantId: s.productVariantId,
      },
    });

    console.log(`Upserted size ${s.id}`);
  }
}

main()
  .then(() => {
    console.log("Sizes seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });