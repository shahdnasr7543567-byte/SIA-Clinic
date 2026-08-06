import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  allowedRoles?: string[];
}

export function ProtectedRoute({ component: Component, path, allowedRoles }: ProtectedRouteProps) {
  const { isLoaded, isAuthenticated, user } = useAuth();

  if (!isLoaded) {
    return <Route path={path}>{() => null}</Route>; // Or a loading spinner
  }

  if (!isAuthenticated || !user) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if role not allowed
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
