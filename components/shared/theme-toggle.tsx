"use client";

import { useTheme } from "next-themes";
// Shadcn components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
//icons
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

export default function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full"
        >
          <SunIcon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-120 transition-all dark:rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-120" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon />Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon />Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <SunMoonIcon />System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
