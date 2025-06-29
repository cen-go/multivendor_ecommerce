"use server"

import db from "../db"
import countries from "@/lib/data/countries.json"

export async function seedCountries() {
  try {
    for (const country of countries) {
      await db.country.upsert({
        where: {name: country.name},
        create: country,
        update: country,
      });
    }

    console.log("All countries seeded successfully.");
  } catch (error) {
    console.error("Error seeding countries: ", error);
  }
}