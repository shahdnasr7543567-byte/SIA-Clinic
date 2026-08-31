import logoSrc from "@/assets/logo.jpeg";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  rounded?: boolean;
}

export function Logo({ className, rounded = true }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="SIA Clinic"
      className={cn("h-9 w-9 object-cover", rounded && "rounded-lg", className)}
    />
  );
}
