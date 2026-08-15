import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown when an authenticated staff member's role doesn't allow a route
 * (e.g. a receptionist typing /doctor/prescription/new manually). Kept
 * intentionally tiny — this is an access-control message, not a page that
 * needs its own design pass.
 */
export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <ShieldAlert className="h-10 w-10 text-danger" />
      <h1 className="font-heading text-xl font-bold">مفيش صلاحية للوصول للصفحة دي</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        حسابك الحالي مش مسموحله يفتح الصفحة دي. لو ده غلط، كلمي الأدمن.
      </p>
      <Button asChild>
        <Link to="/">الرجوع للرئيسية</Link>
      </Button>
    </div>
  );
}
