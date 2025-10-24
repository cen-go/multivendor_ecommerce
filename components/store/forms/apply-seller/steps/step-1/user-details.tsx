import Input from "@/components/store/ui/input";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRef } from "react";
import UserImg from "@/public/assets/images/default-user.avif";

export default function UserDetails() {
  const { user } = useUser();

  const btnConatinerRef = useRef<HTMLDivElement | null>(null);

  const handleImageClick = () => {
    const userButton = btnConatinerRef.current?.querySelector("button");
    if (userButton) {
      userButton.click();
    }
  };
  return (
    <div className="w-full flex flex-col gap-y-8 pt-12 justify-center items-center">
      <div className="relative">
        {/* User Image */}
        <Image
          src={user?.imageUrl ?? UserImg}
          alt="User avatar"
          width={140}
          height={140}
          className="rounded-full cursor-pointer"
          onClick={handleImageClick}
        />
        {/* Hidden UserButton */}
        <div
          ref={btnConatinerRef}
          className="absolute inset-0 z-0 opacity-0 pointer-events-none"
        >
          <UserButton />
        </div>
      </div>
      {/* Name or email address Input */}
      <div className="w-full max-w-lg">
      <Input
        name="firstName"
        value={user?.fullName ?? user?.emailAddresses[0].emailAddress ?? ""}
        onChange={() => {}}
        type="text"
        readonly
      />

      </div>
    </div>
  );
}