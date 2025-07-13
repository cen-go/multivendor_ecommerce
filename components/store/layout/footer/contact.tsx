import { HeadsetIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Contact() {
  return (
    <div className="flex flex-col gap-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-x-4">
          <HeadsetIcon className="h-10 w-10 stroke-slate-400" />
          <div className="flex flex-col">
            <p className="text-[#59645f] text-sm">
              Got Questions ? Call us 24/7!
            </p>
            <p className="text-xl">(800) 9213-6472 , (800) 7324-1859</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <b>Contact Info</b>
        <p className="text-sm">
          1357 Maple Grove Avenue, Springfield, IL 62704, USA
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="">
          <Image
            src="/assets/social-media-icons/instagram_icon.png"
            alt="instagram icon"
            width={128}
            height={128}
            className="w-6 h-6"
          />
        </Link>
        <Link href="">
          <Image
            src="/assets/social-media-icons/facebook_icon.png"
            alt="facebook icon"
            width={128}
            height={128}
            className="w-6 h-6"
          />
        </Link>
        <Link href="">
          <Image
            src="/assets/social-media-icons/youtube_icon.png"
            alt="youtube icon"
            width={128}
            height={128}
            className="w-6 h-6"
          />
        </Link>
        <Link href="">
          <Image
            src="/assets/social-media-icons/tiktok_icon.png"
            alt="tiktok icon"
            width={128}
            height={128}
            className="w-6 h-6"
          />
        </Link>
        <Link href="">
          <Image
            src="/assets/social-media-icons/x_icon.png"
            alt="x icon"
            width={128}
            height={128}
            className="w-6 h-6 scale-80"
          />
        </Link>
        <Link href="">
          <Image
            src="/assets/social-media-icons/telegram_icon.png"
            alt="telegram icon"
            width={128}
            height={128}
            className="w-6 h-6"
          />
        </Link>
      </div>
    </div>
  );
}
