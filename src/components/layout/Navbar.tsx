import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8" />
        <span className="font-heading text-lg font-bold text-secondary dark:text-foreground">SIA</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
