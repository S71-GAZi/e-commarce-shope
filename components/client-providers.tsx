"use client";

import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { LoadingProvider } from "@/lib/loading-context";
import { GlobalLoadingIndicator } from "@/components/global-loading-indicator";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>
          <CartProvider>
            <GlobalLoadingIndicator />
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </Suspense>
    </LoadingProvider>
  );
}