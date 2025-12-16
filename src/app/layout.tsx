import { SignedIn } from "@daveyplate/better-auth-ui";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "@/styles/globals.css";

import { Header } from "@/components/header";
import { auth } from "@/lib/auth";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grouped Order - Commandes groupées Philibert",
  description:
    "Application de gestion de commandes groupées de jeux de société",
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Récupérer la session pour connaître le rôle de l'utilisateur
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-svh flex flex-col`}
      >
        <Providers>
          <SignedIn>
            <Header userRole={session?.user.role} user={session?.user} />
          </SignedIn>
          {children}
        </Providers>
      </body>
    </html>
  );
}
