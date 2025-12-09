import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";

/**
 * Layout pour les pages admin
 *
 * Ce layout effectue la validation complète de la session et du rôle admin.
 * Le middleware ne fait qu'une vérification légère de l'existence du cookie.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Validation complète de la session (pas seulement le cookie)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si pas de session valide, rediriger vers la page de connexion
  if (!session) {
    redirect("/auth/sign-in");
  }

  // Si l'utilisateur n'est pas admin, rediriger vers la page d'accueil
  if (session.user.role !== "admin") {
    redirect("/");
  }

  // L'utilisateur est authentifié ET admin, afficher le contenu
  return <>{children}</>;
}
