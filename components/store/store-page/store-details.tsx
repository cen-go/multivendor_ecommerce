"use client";

import { StoreDetailsType } from "@/lib/types";
import {
  CheckIcon,
  CircleCheckBig,
  MessageSquareMoreIcon,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { followStore } from "@/actions/user";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function StoreDetails({
  details,
}: {
  details: StoreDetailsType;
}) {
  const { cover, logo, name, isUserFollowingStore, id } = details;
  const [followersCount, setFollowersCount] = useState<number>(
    details._count.followers
  );
  const [isFollowing, setIsFollowing] = useState(isUserFollowingStore);
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();

  async function handleStoreFollow() {
    if (!user.isSignedIn) {
      // encode and add pathname to redirect to the same page after login
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
    const res = await followStore(id);
    if (!res.success) {
      toast.error("Something happened, try again later!");
    }

    if (res.result) {
      toast.success(res.message);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    } else {
      toast.success(res.message);
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    }
  }

  return (
    <div className="relative w-full pb-28">
      <div className="relative">
        <Image
          src={cover}
          alt={name}
          width={2000}
          height={500}
          className="w-full h-44 md:h-96 object-cover rounded-b-2xl"
        />
        <div className="absolute -bottom-[140px] left-2 flex flex-col md:flex-row md:w-[calc(100%-1rem)] md:justify-between md:items-center ">
          <div className="flex">
            <Image
              src={logo}
              alt={name}
              width={200}
              height={200}
              className="w-28 h-28 md:h-44 md:w-44 object-cover rounded-full shadow-2xl"
            />
            <div className="mt-9 md:mt-14 ml-1 space-y-2">
              <div className="flex items-center gap-x-1 mx-4">
                <h1 className="font-bold text-xl capitalize leading-5 line-clamp-1">
                  {name.toLowerCase()}
                </h1>
                <CircleCheckBig className="stroke-green-400 mt-0.5" />
              </div>
              <div className="flex items-center gap-x-1">
                <div className="text-sm leading-5 mx-4">
                  <strong>100%</strong>
                  <span> Positive Feedback</span> <br />
                  <strong>{followersCount}</strong>
                  <strong>
                    {followersCount > 1 ? " Followers" : " Follower"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-fit flex justify-end ml-5 md:ml-0">
            <div className="flex flex-wrap gap-2 justify-end items-center my-4">
              <div
                className={cn(
                  "flex items-center border text-sm border-orange-background text-orange-background rounded-full cursor-pointer sm:text-base font-bold h-9 px-3 sm:px-4 hover:bg-orange-background hover:text-white",
                  {
                    "bg-orange-background text-white hover:bg-transparent hover:text-orange-background":
                      isFollowing,
                  }
                )}
                onClick={() => handleStoreFollow()}
              >
                {isFollowing ? (
                  <CheckIcon className="w-4 sm:w-5 m-1" />
                ) : (
                  <PlusIcon className="w-4 sm:w-5 me-1" />
                )}
                <span>{isFollowing ? "Following" : "Follow"}</span>
              </div>
              <div className="flex items-center border border-orange-background text-orange-background rounded-full cursor-pointer text-sm sm:text-base font-bold h-9 px-3 sm:px-4 hover:bg-orange-background hover:text-white">
                <MessageSquareMoreIcon className="w-4 sm:w-5 me-1" />
                <span>Message</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
