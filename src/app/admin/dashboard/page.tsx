import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin - Grouped Order",
  description: "Vue d'ensemble des commandes et paniers",
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité des commandes groupées
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Commandes ouvertes
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Souhaits en attente
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Paniers actifs
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Paiements en attente
          </h3>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Actions requises</h2>
        <p className="text-sm text-muted-foreground">
          Aucune action requise pour le moment.
        </p>
      </div>
    </div>
  );
}
