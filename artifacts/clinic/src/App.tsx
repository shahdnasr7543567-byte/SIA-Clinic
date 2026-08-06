import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { useApiAuth } from '@/hooks/use-api-auth';
import { Shell } from '@/components/shell';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NotFound from '@/pages/not-found';

import HomeRedirect from '@/pages/home';
import Login from '@/pages/login';
import Register from '@/pages/register';
import ReceptionDashboard from '@/pages/reception';
import AddPatient from '@/pages/reception/add-patient';
import QueueManagement from '@/pages/reception/queue';
import DoctorDashboard from '@/pages/doctor';
import ActivePatient from '@/pages/doctor/patient';
import PatientsList from '@/pages/patients';
import PatientProfile from '@/pages/patients/profile';
import Pharmacy from '@/pages/pharmacy';
import AiAgent from '@/pages/ai-agent';

const queryClient = new QueryClient();

function AppRoutes() {
  useApiAuth(); 

  return (
    <Shell>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Reception Routes */}
        <ProtectedRoute path="/reception" component={ReceptionDashboard} allowedRoles={['admin', 'receptionist']} />
        <ProtectedRoute path="/reception/add-patient" component={AddPatient} allowedRoles={['admin', 'receptionist']} />
        <ProtectedRoute path="/reception/queue" component={QueueManagement} allowedRoles={['admin', 'receptionist']} />
        
        {/* Doctor Routes */}
        <ProtectedRoute path="/doctor" component={DoctorDashboard} allowedRoles={['admin', 'doctor']} />
        <ProtectedRoute path="/doctor/patient/:id" component={ActivePatient} allowedRoles={['admin', 'doctor']} />
        
        {/* Shared Routes */}
        <ProtectedRoute path="/patients" component={PatientsList} allowedRoles={['admin', 'doctor', 'receptionist']} />
        <ProtectedRoute path="/patients/:id" component={PatientProfile} allowedRoles={['admin', 'doctor', 'receptionist']} />
        <ProtectedRoute path="/pharmacy" component={Pharmacy} allowedRoles={['admin', 'doctor', 'receptionist']} />
        
        {/* All Auth Routes */}
        <ProtectedRoute path="/ai-agent" component={AiAgent} />
        
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
