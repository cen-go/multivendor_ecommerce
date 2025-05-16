import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/theme-toggle";

export default function Home() {
  return (
    <div>
      <h1 className="font-bold text-4xl font-barlow">Welcome to the course</h1>
      <Button variant="success">Click Here</Button>
      <ThemeToggle />
    </div>
  );
}
