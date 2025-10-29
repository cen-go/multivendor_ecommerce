/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const couponsPath = path.join(process.cwd(), "scripts", "coupons.json");
  const raw = fs.readFileSync(couponsPath, "utf8");
  const coupons = JSON.parse(raw);

  for (const c of coupons) {
    // ensure parent variant exists
    const store = await db.store.findUnique({ where: { id: c.storeId } });
    if (!store) {
      console.warn(`Skipping coupon ${c.id}: productVariant ${c.storeId} not found.`);
      continue;
    }

    await db.coupon.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        code: c.code,
        startDate: c.startDate,
        endDate: c.endDate,
        discount: c.discount,
        storeId: c.storeId,
      },
      update: {
        code: c.code,
        startDate: c.startDate,
        endDate: c.endDate,
        discount: c.discount,
        storeId: c.storeId,
      },
    });

    console.log(`Upserted coupon ${c.id}`);
  }
}

main()
  .then(() => {
    console.log("Coupons seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });