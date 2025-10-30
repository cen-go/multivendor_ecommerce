// Clerk imports
import { clerkClient } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
// Types
import { WebhookEvent } from "@clerk/nextjs/server";
// DB client
import db from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    const eventType = evt.type;

    // When user is created or updated by Clerk
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0]?.email_address;
      if (!email) {
        return new Response("User has no email address", { status: 400 });
      }

      // create or update the user in app database
      const dbUser = await db.user.upsert({
        where: { email },
        update: {
          name: `${first_name} ${last_name}`,
          picture: image_url,
        },
        create: {
          id: id,
          name: `${first_name} ${last_name}`,
          email: email,
          picture: image_url,
        },
      });

      // Attacah user role as private metadata in clerk
      const client = await clerkClient();
      await client.users.updateUserMetadata(evt.data.id, {
        privateMetadata: { role: dbUser.role || "USER" },
      });
    }

    // when user is deleted in clerk
    if (eventType === "user.deleted") {
      if (!evt.data.id) {
        return new Response("Error occured -- user id missing", {
          status: 400,
        });
      }

      // check if the user is in app db
      const dbUser = await db.user.findUnique({ where: { id: evt.data.id } });
      // delete the user from app db
      if (dbUser) {
        await db.user.delete({ where: { id: dbUser.id } });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
