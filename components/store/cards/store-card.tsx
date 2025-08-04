"use client";

import { followStore } from "@/actions/user";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { CheckIcon, MessageSquareMoreIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

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
  const [following, setFollowing] = useState<boolean>(isUserFollowingStore);
  const [count, setCount] = useState<number>(followersCount);
  const router = useRouter();
  // Get the current user
  const user = useUser();
  const pathname = usePathname();

  async function handleStoreFollow() {
    if (!user.isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
    const res = await followStore(id);
    if (!res.success) {
      toast.error("Something happened, try again later!");
    }

    if (res.result) {
      toast.success(res.message);
      setFollowing(true);
      setCount((prev) => prev + 1);
    } else {
      toast.success(res.message);
      setFollowing(false);
      setCount((prev) => prev - 1);
    }
  }

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
          <div className="text-lg sm:text-xl font-bold leading-6 text-main-primary">
            <Link href={url}>{name}</Link>
          </div>
          <div className="text-xs sm:text-sm leading-5 mt-1">
            <span>
              <strong>100%</strong> Positive Feedback
            </span>
            &nbsp;|&nbsp;
            <span>
              <strong>{count}</strong>&nbsp;Followers
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-end items-center my-4">
        <div
          className={cn(
            "flex items-center border text-sm border-orange-background text-orange-background rounded-full cursor-pointer sm:text-base font-bold h-9 px-3 sm:px-4 hover:bg-orange-background hover:text-white",
            {
              "bg-orange-background text-white hover:bg-transparent hover:text-orange-background":
                following,
            }
          )}
          onClick={() => handleStoreFollow()}
        >
          {following ? (
            <CheckIcon className="w-4 sm:w-5 m-1" />
          ) : (
            <PlusIcon className="w-4 sm:w-5 me-1" />
          )}
          <span>{following ? "Following" : "Follow"}</span>
        </div>
        <div className="flex items-center border border-orange-background text-orange-background rounded-full cursor-pointer text-sm sm:text-base font-bold h-9 px-3 sm:px-4 hover:bg-orange-background hover:text-white">
          <MessageSquareMoreIcon className="w-4 sm:w-5 me-1" />
          <span>Message</span>
        </div>
      </div>
    </div>
  );
}
