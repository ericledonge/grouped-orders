import { AlertCircleIcon, PackageIcon, ShoppingCartIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasketStatusBadge } from "@/features/baskets/components/basket-badges";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { requireMember } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Mes paniers - Grouped Order",
  description: "Validez vos souhaits dans les paniers",
};

export default async function MyBasketsPage() {
  const session = await requireMember();
  const baskets = await basketRepository.findAwaitingValidationForUser(
    session.user.id,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes paniers</h1>
          <p className="text-muted-foreground">
            Paniers en attente de validation
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/my-wishes">Mes souhaits</Link>
        </Button>
      </div>

      {baskets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun panier en attente
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Vous n'avez pas de panier en attente de validation. Vos souhaits
              apparaîtront ici lorsqu'un administrateur les aura ajoutés à un
              panier.
            </p>
            <Button asChild className="mt-4">
              <Link href="/orders">Voir les commandes ouvertes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {baskets.map((basket) => {
            // Calculer le total pour ce panier (souhaits de l'utilisateur)
            const total = basket.wishes.reduce((sum, wish) => {
              const unitPrice = wish.unitPrice
                ? Number.parseFloat(wish.unitPrice)
                : 0;
              const shippingShare = wish.shippingShare
                ? Number.parseFloat(wish.shippingShare)
                : 0;
              const customsShare = wish.customsShare
                ? Number.parseFloat(wish.customsShare)
                : 0;
              return sum + unitPrice + shippingShare + customsShare;
            }, 0);

            return (
              <Card key={basket.id} className="relative">
                {/* Badge "Action requise" */}
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                    <AlertCircleIcon className="h-3 w-3" />
                    Action requise
                  </span>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" />
                        {basket.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {basket.order?.type &&
                          ORDER_TYPE_LABELS[basket.order.type]}{" "}
                        - {basket.order?.description || "Commande groupée"}
                      </p>
                    </div>
                    <BasketStatusBadge status={basket.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Liste des souhaits */}
                  <div className="border rounded-lg divide-y">
                    {basket.wishes.map((wish) => {
                      const unitPrice = wish.unitPrice
                        ? Number.parseFloat(wish.unitPrice)
                        : 0;
                      const shippingShare = wish.shippingShare
                        ? Number.parseFloat(wish.shippingShare)
                        : 0;
                      const customsShare = wish.customsShare
                        ? Number.parseFloat(wish.customsShare)
                        : 0;
                      const wishTotal =
                        unitPrice + shippingShare + customsShare;

                      return (
                        <div
                          key={wish.id}
                          className="flex items-center justify-between p-3"
                        >
                          <div>
                            <p className="font-medium">{wish.gameName}</p>
                            <p className="text-sm text-muted-foreground">
                              {unitPrice.toFixed(2)} € +{" "}
                              {shippingShare.toFixed(2)} € port
                              {customsShare > 0 &&
                                ` + ${customsShare.toFixed(2)} € douane`}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {wishTotal.toFixed(2)} €
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total et action */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total à payer ({basket.wishes.length} jeu
                        {basket.wishes.length > 1 ? "x" : ""})
                      </p>
                      <p className="text-2xl font-bold">{total.toFixed(2)} €</p>
                    </div>
                    <Button asChild>
                      <Link href={`/baskets/${basket.id}/validate`}>
                        Valider mes souhaits
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
