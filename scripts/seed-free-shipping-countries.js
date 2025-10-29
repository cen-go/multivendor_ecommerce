/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const countriesPath = path.join(process.cwd(), "scripts", "freeShippingCountries.json");
  const raw = fs.readFileSync(countriesPath, "utf8");
  const countries = JSON.parse(raw);

  for (const c of countries) {

    await db.freeShippingCountry.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        freeShippingId: c.freeShippingId,
        countryId: c.countryId,
      },
      update: {
        freeShippingId: c.freeShippingId,
        countryId: c.countryId,
      },
    });

    console.log(`Upserted free shipping country ${c.id}`);
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