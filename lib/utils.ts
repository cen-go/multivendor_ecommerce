// cn tailwind classes utility fn
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import ColorThief from "colorthief"
// prisma & db
import { PrismaClient } from "@prisma/client";
import db from "./db";
import { CartProductType, UserCountry } from "./types";
import { differenceInDays, differenceInHours } from "date-fns";

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
  maxDays: number,
  date?: Date,
): { minDate: string; maxDate: string } {
  const currentDate = date ? date : new Date();

  const minDate = new Date(currentDate);
  minDate.setDate(currentDate.getDate() + minDays);

  const maxDate = new Date(currentDate);
  maxDate.setDate(currentDate.getDate() + maxDays);

  return {
    minDate: ShippingDateTimeFormatter.format(minDate),
    maxDate: ShippingDateTimeFormatter.format(maxDate),
  };
}


// Function to validate product data before adding it to the cart
export function isProductValidToAdd(product:CartProductType): boolean {
  const {
    deliveryTimeMax,
    deliveryTimeMin,
    image,
    name,
    price,
    productId,
    productSlug,
    quantity,
    shippingMethod,
    size,
    sizeId,
    stock,
    variantId,
    variantImage,
    variantName,
    variantSlug,
  } = product;

  // Ensure all necessary fields have values
  if (
    !productId ||
    !variantId ||
    !productSlug ||
    !variantSlug ||
    !name ||
    !variantName ||
    !image ||
    !variantImage ||
    !shippingMethod ||
    quantity <=0 ||
    price <= 0 ||
    !sizeId ||
    !size ||
    stock <= 0 ||
    deliveryTimeMin < 0 ||
    deliveryTimeMax <0
  ) {
    return false;
  }

  return true;
}

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Function to sensor names
export function censorName(firstName:string, lastName:string,): string {
  const censor = (name: string) => {
    const firstChar = name[0];
    return `${firstChar}${"*".repeat(name.length - 1)}`;
  }
  return `${censor(firstName)} ${censor(lastName)}`.toUpperCase();
}

export function getTimeLeft(targetDate:string): {days: number; hours: number} {
  const target = new Date(targetDate);
  const now = new Date();

  // check if the target date expired
  if (target <= now) return {days: 0, hours: 0};

  // calculate the days and hours left
  const daysLeft = differenceInDays(target,now);
  const hoursLeft = differenceInHours(target, now) % 24;

  return {days: daysLeft, hours: hoursLeft};
}