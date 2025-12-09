import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Page d'accueil - Redirection contextuelle selon le rôle
 *
 * - Non authentifié -> /auth/sign-in
 * - Admin -> /admin/dashboard
 * - Membre -> /orders
 */
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si pas de session, rediriger vers la page de connexion
  if (!session) {
    redirect("/auth/sign-in");
  }

  // Rediriger selon le rôle de l'utilisateur
  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Par défaut (membre ou autre rôle), rediriger vers les commandes
  redirect("/orders");
}
