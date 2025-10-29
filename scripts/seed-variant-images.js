/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const imagesPath = path.join(process.cwd(), "scripts", "variantImages.json");
  const raw = fs.readFileSync(imagesPath, "utf8");
  const images = JSON.parse(raw);

  for (const i of images) {
    // ensure parent variant exists
    const variant = await db.productVariant.findUnique({ where: { id: i.productVariantId } });
    if (!variant) {
      console.warn(`Skipping image ${i.id}: productVariant ${i.productVariantId} not found.`);
      continue;
    }

    await db.productVariantImage.upsert({
      where: { id: i.id },
      create: {
        id: i.id,
        url: i.url,
        alt: i.alt,
        productVariantId: i.productVariantId,
      },
      update: {
        url: i.url,
        alt: i.alt,
        productVariantId: i.productVariantId,
      },
    });

    console.log(`Upserted image ${i.id}`);
  }
}

main()
  .then(() => {
    console.log("Images seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });