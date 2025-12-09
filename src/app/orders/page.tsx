import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Commandes - Grouped Order",
  description: "Voir les commandes groupées en cours",
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <p className="text-muted-foreground">
          Consultez les commandes groupées en cours et émettez vos souhaits
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center space-y-4">
        <p className="text-muted-foreground">
          Aucune commande ouverte pour le moment.
        </p>
        <p className="text-sm text-muted-foreground">
          Les administrateurs créeront bientôt de nouvelles commandes groupées.
        </p>
      </div>
    </div>
  );
}
