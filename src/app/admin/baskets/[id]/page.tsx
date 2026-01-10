import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeftIcon,
  PencilIcon,
  ExternalLinkIcon,
  PackageIcon,
  CreditCardIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { BasketStatusBadge } from "@/features/baskets/components/basket-badges";
import { WishStatusBadge } from "@/features/wishes/components/wish-badges";
import { roundToTwoDecimals } from "@/features/baskets/domain/basket.service";

export const metadata: Metadata = {
  title: "Détails du panier - Admin - Grouped Order",
  description: "Voir les détails d'un panier",
};

interface BasketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BasketDetailPage({
  params,
}: BasketDetailPageProps) {
  const { id } = await params;
  const basket = await basketRepository.findByIdWithWishes(id);

  if (!basket) {
    notFound();
  }

  // Calculer les totaux
  const totalGames = basket.wishes.reduce(
    (sum, w) => sum + (w.unitPrice ? Number.parseFloat(w.unitPrice) : 0),
    0,
  );
  const totalShipping = basket.shippingCost
    ? Number.parseFloat(basket.shippingCost)
    : 0;
  const totalCustoms = basket.customsCost
    ? Number.parseFloat(basket.customsCost)
    : 0;
  const grandTotal = basket.wishes.reduce(
    (sum, w) => sum + (w.amountDue ? Number.parseFloat(w.amountDue) : 0),
    0,
  );

  // Grouper par membre
  const memberTotals = new Map<
    string,
    { name: string; email: string; count: number; total: number }
  >();
  for (const wish of basket.wishes) {
    const existing = memberTotals.get(wish.user.id);
    const wishTotal = wish.amountDue ? Number.parseFloat(wish.amountDue) : 0;
    if (existing) {
      existing.count += 1;
      existing.total += wishTotal;
    } else {
      memberTotals.set(wish.user.id, {
        name: wish.user.name,
        email: wish.user.email,
        count: 1,
        total: wishTotal,
      });
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/orders/${basket.orderId}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Retour à la commande
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <PackageIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{basket.name}</h1>
            <BasketStatusBadge status={basket.status} />
          </div>
          <p className="text-muted-foreground">
            Créé le {format(basket.createdAt, "PPP", { locale: fr })}
          </p>
        </div>

        <div className="flex gap-2">
          {basket.status === "draft" && (
            <Button asChild>
              <Link href={`/admin/baskets/${id}/edit`}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Éditer les prix
              </Link>
            </Button>
          )}
          {basket.status === "awaiting_validation" && (
            <Button asChild variant="outline">
              <Link href={`/admin/baskets/${id}/payments`}>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Gérer les paiements
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total jeux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalGames > 0 ? `${totalGames.toFixed(2)} €` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Frais de port
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalShipping > 0 ? `${totalShipping.toFixed(2)} €` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Frais de douane
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalCustoms > 0 ? `${totalCustoms.toFixed(2)} €` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total panier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {grandTotal > 0 ? `${grandTotal.toFixed(2)} €` : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Récap par membre */}
      {memberTotals.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif par membre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from(memberTotals.entries()).map(
                ([userId, { name, email, count, total }]) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} jeu{count > 1 ? "x" : ""}
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      {total > 0 ? `${roundToTwoDecimals(total).toFixed(2)} €` : "-"}
                    </p>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des souhaits */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des souhaits ({basket.wishes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Membre</th>
                  <th className="pb-3 font-medium">Jeu</th>
                  <th className="pb-3 font-medium">Référence</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Prix</th>
                  <th className="pb-3 font-medium text-right">Port</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {basket.wishes.map((wish) => (
                  <tr key={wish.id}>
                    <td className="py-4 text-sm">
                      <div>
                        <p className="font-medium">{wish.user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {wish.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium">{wish.gameName}</td>
                    <td className="py-4 text-sm">
                      {wish.philibertUrl ? (
                        <a
                          href={wish.philibertUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          {wish.philibertReference}
                          <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                      ) : (
                        wish.philibertReference
                      )}
                    </td>
                    <td className="py-4">
                      <WishStatusBadge status={wish.status} />
                    </td>
                    <td className="py-4 text-sm text-right">
                      {wish.unitPrice
                        ? `${Number.parseFloat(wish.unitPrice).toFixed(2)} €`
                        : "-"}
                    </td>
                    <td className="py-4 text-sm text-right text-muted-foreground">
                      {wish.shippingShare
                        ? `${Number.parseFloat(wish.shippingShare).toFixed(2)} €`
                        : "-"}
                    </td>
                    <td className="py-4 text-sm text-right font-medium">
                      {wish.amountDue
                        ? `${Number.parseFloat(wish.amountDue).toFixed(2)} €`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
