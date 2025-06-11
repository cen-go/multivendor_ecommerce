import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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