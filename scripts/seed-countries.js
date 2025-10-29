/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const countriesPath = path.join(process.cwd(), "scripts", "allCountries.json");
  const raw = fs.readFileSync(countriesPath, "utf8");
  const countries = JSON.parse(raw);

  for (const c of countries) {

    await db.country.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        name: c.name,
        code: c.code,
      },
      update: {
        name: c.name,
        code: c.code,
      },
    });

    console.log(`Upserted country ${c.id}`);
  }
}

main()
  .then(() => {
    console.log("Country seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });