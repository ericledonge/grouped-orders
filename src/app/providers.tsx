"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth/auth-clients";
import { frenchLocalization } from "@/lib/localization/fr";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthUIProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => {
          // Clear router cache (protected routes)
          router.refresh();
        }}
        Link={Link}
        localization={frenchLocalization}
        social={{
          providers: ["facebook"],
        }}
      >
        <Toaster position="top-center" />
        {children}
      </AuthUIProvider>
    </ThemeProvider>
  );
}
