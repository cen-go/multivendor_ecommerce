"use server";

import db from "../db";

export async function updateVariantImage() {
  try {
    const variants = await db.productVariant.findMany({
      include: { images: true },
    });

    for (const variant of variants) {
      if (variant.images.length > 0) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: { variantImage: variant.images[0].url },
        });
      }
      console.log(`updated variant image of the ${variant.variantName}`);
    }

  } catch (error) {
    console.error("Migration error ---> ", error);
  }
}
