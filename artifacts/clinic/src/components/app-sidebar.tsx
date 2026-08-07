import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Pill,
  MessageSquare,
  LogOut,
  UserPlus,
  ListOrdered,
  ActivitySquare
} from "lucide-react";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const routes = [
    {
      title: "لوحة الاستقبال",
      url: "/reception",
      icon: LayoutDashboard,
      roles: ["admin", "receptionist"],
    },
    {
      title: "إضافة مريض",
      url: "/reception/add-patient",
      icon: UserPlus,
      roles: ["admin", "receptionist"],
    },
    {
      title: "إدارة الطابور",
      url: "/reception/queue",
      icon: ListOrdered,
      roles: ["admin", "receptionist"],
    },
    {
      title: "لوحة الطبيب",
      url: "/doctor",
      icon: ActivitySquare,
      roles: ["admin", "doctor"],
    },
    {
      title: "المرضى",
      url: "/patients",
      icon: Users,
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      title: "الصيدلية",
      url: "/pharmacy",
      icon: Pill,
      roles: ["admin", "doctor", "receptionist"],
    },
    {
      title: "المساعد الذكي",
      url: "/ai-agent",
      icon: MessageSquare,
      roles: ["admin", "doctor", "receptionist", "patient"],
    },
  ];

  const visibleRoutes = routes.filter((r) => r.roles.includes(user.role));

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ActivitySquare className="size-5" />
          </div>
          <div className="grid flex-1 text-right text-sm leading-tight">
            <span className="truncate font-semibold font-heading text-xl">سِيَا</span>
            <span className="truncate text-xs text-muted-foreground">عيادتك الذكية</span>
          </div>
        </div>
        <ThemeToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleRoutes.map((route) => (
                <SidebarMenuItem key={route.url}>
                  <SidebarMenuButton asChild isActive={location === route.url || location.startsWith(route.url + "/")}>
                    <Link href={route.url}>
                      <route.icon />
                      <span>{route.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="py-6 px-4 flex justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.role === "doctor" ? "طبيب" : user.role === "receptionist" ? "استقبال" : "مدير"}
                  </span>
                </div>
              </div>
              <button onClick={logout} className="text-muted-foreground hover:text-destructive shrink-0">
                <LogOut className="h-5 w-5" />
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
