/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const reviewsPath = path.join(process.cwd(), "scripts", "reviews.json");
  const raw = fs.readFileSync(reviewsPath, "utf8");
  const reviews = JSON.parse(raw);

  for (const x of reviews) {
    // ensure parent variant exists
    const product = await db.product.findUnique({ where: { id: x.productId } });
    const user = await db.user.findUnique({ where: { id: x.userId } });
    if (!product) {
      console.warn(`Skipping review ${x.id}: product ${x.storeId} not found.`);
      continue;
    }
    if (!user) {
      console.warn(`Skipping review ${x.id}: user ${x.storeId} not found.`);
      continue;
    }

    await db.review.upsert({
      where: { id: x.id },
      create: {
        id: x.id,
        variant: x.variant,
        review: x.review,
        rating: x.rating,
        color: x.color,
        size: x.size,
        likes: x.likes,
        userId: x.userId,
        productId: x.productId,
      },
      update: {
        variant: x.variant,
        review: x.review,
        rating: x.rating,
        color: x.color,
        size: x.size,
        likes: x.likes,
        userId: x.userId,
        productId: x.productId,
      },
    });

    console.log(`Upserted review ${x.id}`);
  }
}

main()
  .then(() => {
    console.log("Reviews seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });