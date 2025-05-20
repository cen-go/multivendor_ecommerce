import ThemeToggle from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <div className="p-4 fixed z-[20] left-0 top-0 right-0 md:left-[300px] bg-background/80 backdrop-blur-md flex gap-4 items-center border-b">
      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <UserButton afterSwitchSessionUrl="/" />
      </div>
    </div>
  );
}
