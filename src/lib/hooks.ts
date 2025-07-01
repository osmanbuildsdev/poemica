"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useAuthStatus() {
  const { data: session, status } = useSession();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    console.log("Auth Status:", {
      status,
      session,
      isAuthenticated: status === "authenticated" && session?.user?.email != null
    });
    
    if (status !== "loading") {
      setIsReady(true);
    }
  }, [session, status]);
  
  return {
    session,
    status,
    isAuthenticated: status === "authenticated" && session?.user?.email != null,
    isReady
  };
}
