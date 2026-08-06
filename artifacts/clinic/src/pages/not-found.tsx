import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center" dir="rtl">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
      <h1 className="text-4xl font-bold font-heading text-primary mb-2">404</h1>
      <p className="text-xl font-medium mb-6">الصفحة غير موجودة</p>
      <p className="text-muted-foreground max-w-md mb-8">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Button asChild>
        <Link href="/">العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
