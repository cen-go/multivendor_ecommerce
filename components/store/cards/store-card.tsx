"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, MessageSquareMoreIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Props {
  store: {
    id: string;
    url: string;
    name: string;
    logo: string;
    followersCount: number;
    isUserFollowingStore: boolean;
  };
}

export default function StoreCard({
  store: { id, name, logo, url, followersCount, isUserFollowingStore },
}: Props) {
  const [following, isFollowing] = useState<boolean>(true);

  return (
    <div className="w-full bg-[#f5f5f5] flex items-center justify-between rounded-xl py-3 px-4 mt-6">
      <div className="flex items-center">
        <Link href={`/store/${url}`}>
          <Image
            src={logo}
            alt={`${name} logo`}
            width={50}
            height={50}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>
        <div className="mx-2">
          <div className="text-xl font-bold leading-6 text-main-primary">
            <Link href={url}>{name}</Link>
          </div>
          <div className="text-sm leading-5 mt-1">
            <strong>100%</strong>
            <span> Positive Feedback</span>&nbsp;|&nbsp;
            <strong>{followersCount}</strong>
            <span> Followers</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-y-2 justify-end items-center my-4">
        <div
          className={cn(
            "flex items-center border border-orange-background text-orange-background rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4 hover:bg-orange-background hover:text-white",
            {
              "bg-orange-background text-white hover:bg-transparent hover:text-orange-background":
                following,
            }
          )}
        >
          {following ? (
            <CheckIcon className="w-5 m-1" />
          ) : (
            <PlusIcon className="w-5 me-1" />
          )}
          <span>{following ? "Following" : "Follow"}</span>
        </div>
        <div className="flex items-center border border-orange-background text-orange-background rounded-full cursor-pointer text-base font-bold h-9 mx-2 px-4 hover:bg-orange-background hover:text-white">
          <MessageSquareMoreIcon className="w-5 me-1" />
          <span>Message</span>
        </div>
      </div>
    </div>
  );
}
