"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import PageLoader from "@/components/ui/PageLoader";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PageLoader />
      {children}
    </SessionProvider>
  );
}
