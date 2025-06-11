"use server"

import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function: deleteCloudinaryImage
// Description:  deletes a specific image from cloudinary
// Permission Level: Admin or Seller
// Parameters:
//   - publicId: File name of the image stored in cloudinary
// Returns: success or error message
export async function deleteCloudinaryImage(publicId: string) {
  try {
    const user = await currentUser();
    if (!user) return {success: false, message: "Not authenticated!"}
    if (user.privateMetadata.role === Role.USER) {
      return {success: false, message: "You don't have permission for this"};
    }
    const response = await cloudinary.uploader.destroy(publicId);
    return {success: response.result === "ok", message: response.result};
  } catch (error) {
    console.error(error);
    return {success: false, message: "Failed to delete image"};
  }
}