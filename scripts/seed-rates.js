/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const ratesPath = path.join(process.cwd(), "scripts", "shippingRates.json");
  const raw = fs.readFileSync(ratesPath, "utf8");
  const rates = JSON.parse(raw);

  for (const s of rates) {

    await db.shippingRate.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        returnPolicy: s.returnPolicy,
        shippingService: s.shippingService,
        shippingFeePerAdditionalItem: s.shippingFeePerAdditionalItem,
        shippingFeePerItem: s.shippingFeePerItem,
        shippingFeePerKg: s.shippingFeePerKg,
        shippingFeeFixed: s.shippingFeeFixed,
        deliveryTimeMin: s.deliveryTimeMin,
        deliveryTimeMax: s.deliveryTimeMax,
        countryId: s.countryId,
        storeId: s.storeId,
      },
      update: {
        returnPolicy: s.returnPolicy,
        shippingService: s.shippingService,
        shippingFeePerAdditionalItem: s.shippingFeePerAdditionalItem,
        shippingFeePerItem: s.shippingFeePerItem,
        shippingFeePerKg: s.shippingFeePerKg,
        shippingFeeFixed: s.shippingFeeFixed,
        deliveryTimeMin: s.deliveryTimeMin,
        deliveryTimeMax: s.deliveryTimeMax,
        countryId: s.countryId,
        storeId: s.storeId,
      },
    });

    console.log(`Upserted rates ${s.id}`);
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