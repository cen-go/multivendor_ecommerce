// React & Next.js
import Image from "next/image";
// App logo
import LogoImg from "@/public/assets/icons/logo-1.png";
// Constants
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  width: string;
  height: string;
  sizes?: string;
  priority: boolean;
}

export default function Logo({ width, height, sizes, priority }: LogoProps) {
  return (
    <div className="z-50 relative mx-auto" style={{ width, height }}>
      <Image
        src={LogoImg}
        alt={`${APP_NAME} logo`}
        className="w-full h-full object-cover overflow-visible"
        fill
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
