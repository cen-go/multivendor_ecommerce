// Clerk imports
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { clerkClient } from '@clerk/nextjs/server';
// Types
import { NextRequest } from 'next/server'
import { User } from '@prisma/client';
// DB client
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    const eventType = evt.type;

    // When user is created or updated by Clerk
    if (eventType === "user.created" || eventType === "user.updated") {
      const user:Partial<User> = {
        id: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name} ${evt.data.last_name}`,
        picture: evt.data.image_url
      };
      if(!user) return;

      // create or update the user in app database
      const dbUser = await db.user.upsert({
        where: {email: user.email},
        update: user,
        create: {
          id: user.id,
          name: user.name!,
          email: user.email!,
          picture: user.picture!,

        }
      });

      // Attacah user role as private metadata in clerk
      const client = await clerkClient();
      await client.users.updateUserMetadata(evt.data.id, {
        privateMetadata: {role: dbUser.role || "USER"}
      })
    }

    // when user is deleted in clerk
    if (eventType === "user.deleted") {
      // check if the user is in app db
      const dbUser = await db.user.findFirst({where: {id: evt.data.id}});
      // delete the user from app db
      if (dbUser) {
        await db.user.delete({where: {id: dbUser.id}});
      } else {
        return
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (error) {
    console.error('Error verifying webhook:', error)
    return new Response('Error verifying webhook', { status: 400 })
  }
}