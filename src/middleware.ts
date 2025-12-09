import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Middleware de protection des routes admin (Next.js 15.2.0+)
 *
 * Ce middleware fait une vérification OPTIMISTE de la session.
 * La vérification SÉCURISÉE (avec requête DB) est effectuée dans le AdminLayout.
 *
 * @see src/app/admin/layout.tsx pour la validation complète
 */
export async function middleware(request: NextRequest) {
  // Vérification optimiste de la session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Redirection rapide si pas de session
  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // Vérification optimiste du rôle admin
  if (session.user.role !== "admin") {
    const url = new URL("/", request.url);
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  // Laisser passer la requête - la validation sécurisée sera faite dans le layout
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Requis pour auth.api.getSession() (Next.js 15.2.0+)
  matcher: ["/admin/:path*"],
};
