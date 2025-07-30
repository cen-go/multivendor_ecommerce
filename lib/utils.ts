// cn tailwind classes utility fn
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import ColorThief from "colorthief"
// prisma & db
import { PrismaClient } from "@prisma/client";
import db from "./db";
import { UserCountry } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to extract publicId from cloudinary URL
export function getCloudinaryPublicId(url: string) {
  const parts = url.split("/");
  const fileWithExt = parts[parts.length - 1];
  const fileName = fileWithExt.split(".")[0];
  return fileName;
}

// Function to get prominent colors from an image
export const getDominantColors = (imgUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 3).map((color) => {
          // Convert RGB array to hex string
          return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
        });
        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

// Helper function to generate a unique slug
export async function generateUniqueSlug(
  baseSlug:string,
  dbModel: keyof PrismaClient,
  field:string = "slug",
  separator:string = "-",
) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingRecord = await (db[dbModel] as any).findFirst({where: {[field]: slug}});

    if (!existingRecord) {
      break;
    }

    slug = `${slug}${separator}${suffix}`;
    suffix++;
  }

  return slug;
}

// Util to format curencies to display on UI
// transforms the currency stored in db as cents to dollars to display on UI
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});
export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount/100);
}

// Helper function to get the user country
// Default country for the cases there is an issue with the service
const DEFAULT_COUNTRY: UserCountry = {
  name: "United States",
  code: "US",
};

export async function getUserCountry(): Promise<UserCountry> {
  let userCountry = DEFAULT_COUNTRY;
  try {
    const response = await fetch(
      `https://api.ipinfo.io/lite/me?token=${process.env.IPINFO_TOKEN}`
    );
    if (response.ok) {
      const data = await response.json();
      userCountry = {
        name: data.country,
        code: data.country_code,
      };
    }
  } catch (error) {
    console.error("Error fetching the user country: ", error);
  }
  return userCountry;
}

// Calculate the sipping date range based on min and max delivery
const ShippingDateTimeFormatter = new Intl.DateTimeFormat("en-US", {dateStyle: 'long'});
export function calculateShippingDateRange(
  minDays: number,
  maxDays: number
): { minDate: string; maxDate: string } {
  const currentDate = new Date();

  const minDate = new Date(currentDate);
  minDate.setDate(currentDate.getDate() + minDays);

  const maxDate = new Date(currentDate);
  maxDate.setDate(currentDate.getDate() + maxDays);

  return {
    minDate: ShippingDateTimeFormatter.format(minDate),
    maxDate: ShippingDateTimeFormatter.format(maxDate),
  };
}