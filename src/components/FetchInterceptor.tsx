"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';


export function FetchInterceptor({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  useEffect(() => {

    const originalFetch = window.fetch;
    

    window.fetch = async (input, init) => {

      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      if (url.includes('/api/')) {

        

        const headers = new Headers(init?.headers || {});

        if (session?.user?.email) {
          headers.set('x-auth-email', session.user.email);
          if (session.user.id) {
            headers.set('x-auth-user-id', session.user.id);
          }
        }
        

        const newInit = {
          ...init,
          headers,
          credentials: 'include' as RequestCredentials,
        };
        
        return originalFetch(input, newInit);
      }
      

      return originalFetch(input, init);
    };
    

    return () => {
      window.fetch = originalFetch;
    };
  }, [session]);
  
  return <>{children}</>;
}
