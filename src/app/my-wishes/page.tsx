import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mes souhaits - Grouped Order",
  description: "Suivez vos souhaits de jeux",
};

export default async function MyWishesPage() {
  const _session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes souhaits</h1>
        <p className="text-muted-foreground">
          Suivez l'avancement de vos souhaits de jeux
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center space-y-4">
        <p className="text-muted-foreground">
          Vous n'avez pas encore émis de souhaits.
        </p>
        <p className="text-sm text-muted-foreground">
          Consultez les commandes ouvertes pour ajouter vos jeux favoris.
        </p>
      </div>
    </div>
  );
}
