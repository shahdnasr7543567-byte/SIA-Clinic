
import { NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, CalendarPlus, FileText, LogOut } from "lucide-react";

import { usePatientAuthStore } from "@/store/patientAuthStore";

const links = [
  { to: "/patient/bookings", label: "حجوزاتي", icon: CalendarDays },
  { to: "/patient/book", label: "احجز موعد", icon: CalendarPlus },
  { to: "/patient/prescriptions", label: "روشتاتي", icon: FileText },
];

export function PatientNavBar() {
  const navigate = useNavigate();
  const logout = usePatientAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/patient/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج</span>
        </button>
      </div>
    </nav>
  );
} 

