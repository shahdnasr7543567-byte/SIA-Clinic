import { useAuth } from '@/hooks/use-auth';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export function Shell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isAuthenticated) {
    return <main className="min-h-screen bg-background text-foreground" dir="rtl">{children}</main>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground" dir="rtl">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6 lg:hidden">
            <SidebarTrigger />
            <div className="w-full flex justify-between items-center">
              <span className="font-heading font-semibold text-lg">سِيَا</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
