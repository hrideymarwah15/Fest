"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import PageLoader from "@/components/ui/PageLoader";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <PageLoader />
      {children}
    </AuthProvider>
  );
}
