import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function HomeRedirect() {
  const { user, isLoaded, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthenticated || !user) {
      setLocation("/login");
      return;
    }

    if (user.role === "doctor") {
      setLocation("/doctor");
    } else if (user.role === "receptionist") {
      setLocation("/reception");
    } else if (user.role === "patient") {
      setLocation("/ai-agent");
    } else {
      setLocation("/login");
    }
  }, [isLoaded, isAuthenticated, user, setLocation]);

  return null;
}
