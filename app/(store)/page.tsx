import ThemeToggle from "@/components/shared/theme-toggle";

export default function Home() {

  return (
    <div className="p-4">
      <div className="flex items-center gap-6">
        <ThemeToggle />
      </div>
    </div>
  );
}
