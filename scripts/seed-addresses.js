/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

async function main() {
  const addressesPath = path.join(process.cwd(), "scripts", "addresses.json");
  const raw = fs.readFileSync(addressesPath, "utf8");
  const addresses = JSON.parse(raw);

  for (const s of addresses) {

    await db.shippingAddress.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        userId: s.userId,
        countryId: s.countryId,
        title: s.title,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        address1: s.address1,
        address2: s.address2,
        city: s.city,
        zip_code: s.zip_code,
        default: s.default,
      },
      update: {
        userId: s.userId,
        countryId: s.countryId,
        title: s.title,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        address1: s.address1,
        address2: s.address2,
        city: s.city,
        zip_code: s.zip_code,
        default: s.default,
      },
    });

    console.log(`Upserted address ${s.id}`);
  }
}

main()
  .then(() => {
    console.log("Addresses seeded.");
    return db.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seeding error:", err);
    await db.$disconnect();
    process.exit(1);
  });