import { Link } from "react-router-dom";
import { CalendarPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

/**
 * Public entry point for SIA. Root ("/") used to point straight at the
 * Reception Dashboard, which meant an unauthenticated visitor landed on an
 * internal staff screen. This page is intentionally minimal — just the two
 * actions a first-time visitor needs — and reuses existing Button/Logo
 * components rather than introducing a new design system.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <Logo className="h-16 w-16" />
        <h1 className="font-heading text-2xl font-bold text-secondary dark:text-foreground">SIA Clinic</h1>
        <p className="max-w-sm text-sm text-muted-foreground">نظام إدارة العيادة الذكي</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <Link to="/book">
            <CalendarPlus className="h-4 w-4" />
            احجز موعد
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/login">
            <LogIn className="h-4 w-4" />
            دخول الموظفين
          </Link>
        </Button>
      </div>
    </div>
  );
}
