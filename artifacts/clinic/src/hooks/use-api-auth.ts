import { useEffect } from 'react';
import { getStoredToken } from '@/store/auth';

// Setup custom fetch to include token
export function useApiAuth() {
  useEffect(() => {
    // Modify custom fetch globally if needed
    // However, @workspace/api-client-react/src/custom-fetch.ts provides setAuthTokenGetter
    import('@workspace/api-client-react').then(({ setAuthTokenGetter }) => {
      setAuthTokenGetter(() => getStoredToken());
    });
  }, []);
}
