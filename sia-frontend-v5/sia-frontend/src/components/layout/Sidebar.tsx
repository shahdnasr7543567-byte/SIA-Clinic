import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Bot, LogOut, ListOrdered, Stethoscope, ShieldCheck, ClipboardPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  /** Omit to show the item to every authenticated role. */
  roles?: readonly string[];
}

const navItems: NavItem[] = [
  { to: "/admin", labelKey: "nav.adminDashboard", icon: ShieldCheck, roles: ["admin"] },
  { to: "/reception", labelKey: "nav.dashboard", icon: LayoutDashboard, roles: ["admin", "receptionist"] },
  { to: "/reception/add-patient", labelKey: "nav.addPatient", icon: ClipboardPlus, roles: ["admin", "receptionist"] },
  { to: "/reception/queue", labelKey: "nav.queue", icon: ListOrdered, roles: ["admin", "receptionist"] },
  { to: "/doctor", labelKey: "nav.doctorDashboard", icon: Stethoscope, roles: ["admin", "doctor"] },
  { to: "/doctor/queue", labelKey: "nav.doctorQueue", icon: ListOrdered, roles: ["admin", "doctor"] },
  { to: "/patients/search", labelKey: "nav.patients", icon: Users, roles: ["doctor", "admin"] },
  { to: "/ai-agent", labelKey: "nav.aiAgent", icon: Bot, roles: ["doctor", "admin"] },
];

export function Sidebar() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 py-5">
        <Logo className="h-9 w-9" />
        <div>
          <p className="font-heading text-lg font-bold leading-none">سيا</p>
          <p className="text-xs text-sidebar-foreground/60">SIA Clinic</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role ?? ""))
          .map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin" || to === "/reception" || to === "/doctor"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </NavLink>
          ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        {user && (
          <div className="mb-3 flex items-center gap-2 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
