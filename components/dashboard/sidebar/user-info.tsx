import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { User } from '@clerk/nextjs/server'
import { AvatarFallback } from '@radix-ui/react-avatar';
import React from 'react'

export default function UserInfo({user}: {user: User}) {
  const userRole = user.privateMetadata.role?.toString().toLocaleLowerCase();

  return (
    <div>
      <div>
        <Button
          className="w-full mt-5 mb-4 flex items-center justify-between py-10 overflow-hidden ps-0"
          variant="ghost"
        >
          <div className="flex items-center text-left gap-2">
            <Avatar className="w-15 h-15">
              <AvatarImage src={user?.imageUrl} alt="user avatar" />
              <AvatarFallback className='bg-indigo-600 text-white'>
                {user?.firstName?.charAt(0) ||
                  user.emailAddresses[0].emailAddress.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col gap-y-1'>
              {user.firstName && <p>{user.firstName} {user.lastName}</p>}
              <p className='text-muted-foreground'>{user.emailAddresses[0].emailAddress}</p>
              {userRole && (
                <Badge variant="secondary" className='capitalize'>
                  {userRole} Dashboard
                </Badge>
              )}
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
