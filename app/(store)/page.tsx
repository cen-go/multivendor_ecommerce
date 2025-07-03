import ThemeToggle from "@/components/shared/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default function Home() {

  return (
    <div className="p-4">
      <div className="flex items-center gap-6 justify-end">
        <UserButton />
        <ThemeToggle />
      </div>
        <h1 className="font-bold text-4xl font-barlow">
          Home Page
        </h1>
    </div>
  );
}
