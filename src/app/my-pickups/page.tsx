import { CheckCircleIcon, PackageCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PickupCard } from "@/features/baskets/components/pickup-card";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { requireMember } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Mes retraits - Grouped Order",
  description: "Récupérez vos jeux disponibles",
};

export default async function MyPickupsPage() {
  const session = await requireMember();
  const baskets = await basketRepository.findAvailableForPickupByUser(
    session.user.id,
  );

  // Compter le total de jeux à récupérer
  const totalGames = baskets.reduce((sum, b) => sum + b.wishes.length, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes retraits</h1>
          <p className="text-muted-foreground">Jeux disponibles au retrait</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/my-wishes">Mes souhaits</Link>
        </Button>
      </div>

      {baskets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun jeu à récupérer
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Vous n'avez pas de jeu en attente de retrait. Vos jeux
              apparaîtront ici lorsqu'ils seront disponibles.
            </p>
            <Button asChild className="mt-4">
              <Link href="/orders">Voir les commandes ouvertes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Bandeau récapitulatif */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <PackageCheckIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  {totalGames} jeu{totalGames > 1 ? "x" : ""} disponible
                  {totalGames > 1 ? "s" : ""} au retrait !
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Rendez-vous aux points de dépôt indiqués pour récupérer vos
                  jeux
                </p>
              </div>
            </div>
          </div>

          {/* Liste des paniers */}
          <div className="grid gap-4">
            {baskets.map((basket) => (
              <PickupCard
                key={basket.id}
                basketId={basket.id}
                basketName={basket.name}
                status={basket.status}
                orderDescription={basket.order?.description || null}
                wishes={basket.wishes.map((w) => ({
                  id: w.id,
                  gameName: w.gameName,
                  status: w.status,
                  depositPoint: w.depositPoint || null,
                }))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
