"use client"

// React & Next.js
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
// Clerk authentication
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
// Icons
import { ChevronDownIcon, UserIcon } from "lucide-react";
import { MessageIcon, OrderIcon, WishlistIcon } from "@/components/store/icons";
// Utils
import { cn } from "@/lib/utils";
// UI components
import { Button } from "@/components/store/ui/button";
import { Button as DefaultButton } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function UserMenu() {
  // Get Current user with Clerk client side hook
  const { user, isSignedIn} = useUser();
  // State for openig and closing the user menu content
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => {
          setOpen((v) => !v);
        }}
        onMouseEnter={() => {
          setOpen(true);
        }}
        aria-label="User menu button"
      >
        {user && isSignedIn ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName ?? "User"}
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
          />
        ) : (
          <div className="flex h-11 items-center py-0 cursor-pointer">
            <span className="text-2xl">
              <UserIcon />
            </span>
            <div className="ml-1">
              <b className="text-xs text-white leading-4 flex items-center gap-1">
                <span>Sign in / Register</span>
                <span>
                  <ChevronDownIcon size={20} />
                </span>
              </b>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0  z-30 bg-black/10"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div
            onMouseLeave={() => setOpen(false)}
            onClick={e => e.stopPropagation()}
            className={cn("absolute z-40 top-9 -left-38", {
              "-left-[260px] lg:-left-[240px]": isSignedIn,
            })}
          >
            <div className="relative left-2 right-auto bottom-auto pt-2.5 p-0 text-sm z-40">
              {/* Triangle */}
              <div className="w-0 h-0 absolute left-[262px] lg:left-[244px] top-1 right-24 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[var(--card)]"></div>
              {/* Menu */}
              <div className="rounded-3xl bg-[var(--card)] shadow-lg">
                <div className="w-[300px]">
                  <div className="pt-5 px-6 pb-0">
                    {user ? (
                      <div className="user-avatar flex flex-col items-center justify-center">
                        <UserButton />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Button asChild variant="default">
                          <Link href="/sign-in">Sign in</Link>
                        </Button>
                        <Link
                          href="/sign-up"
                          className="h-10 text-sm text-primary hover:underline flex items-center justify-center cursor-pointer"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                    {user && (
                      <div className="text-center">
                        <DefaultButton
                          asChild
                          variant="ghost"
                          className="my-3 text-center text-sm !text-accent-foreground !cursor-pointer"
                        >
                          <SignOutButton />
                        </DefaultButton>
                      </div>
                    )}
                    <Separator />
                  </div>
                  <div>
                    {/* Links */}
                    <div className="max-w-[calc(100vh-180px)] text-secondary-foreground overflow-y-auto overflow-x-hidden pt-0 px-2 pb-4">
                      <ul className="grid grid-cols-2 gap-2 py-2.5 px-4 w-full">
                        {links.map((item) => (
                          <li
                            key={item.title}
                            className="grid place-items-center"
                          >
                            <Link href={item.link} className="space-y-2">
                              <div className="w-14 h-14 rounded-full p-2 grid place-items-center bg-gray-100 hover:bg-gray-200">
                                <span className="text-gray-500">
                                  {item.icon}
                                </span>
                              </div>
                              <span className="block text-xs text-accent-foreground">
                                {item.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Separator className="!max-w-[257px] mx-auto" />
                      <ul className="pt-2.5 pr-4 pb-1 pl-4 w-[288px]">
                        {extraLinks.map((item, i) => (
                          <li key={i}>
                            <Link href={item.link}>
                              <span className="block text-sm py-1.5 hover:underline">
                                {item.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


const links = [
  {
    icon: <OrderIcon />,
    title: "My Orders",
    link: "/profile/orders",
  },
  {
    icon: <MessageIcon />,
    title: "Messages",
    link: "/profile/messages",
  },
  {
    icon: <WishlistIcon />,
    title: "WishList",
    link: "/profile/wishlist",
  },
];
const extraLinks = [
  {
    title: "Profile",
    link: "/profile",
  },
  {
    title: "Settings",
    link: "/",
  },
  {
    title: "Become a Seller",
    link: "/become-seller",
  },
  {
    title: "Help Center",
    link: "",
  },
  {
    title: "Return & Refund Policy",
    link: "/",
  },
  {
    title: "Legal & Privacy",
    link: "",
  },
  {
    title: "Discounts & Offers",
    link: "",
  },
  {
    title: "Order Dispute Resolution",
    link: "",
  },
  {
    title: "Report a Problem",
    link: "",
  },
];