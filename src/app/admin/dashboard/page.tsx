import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ClipboardListIcon,
  ExternalLinkIcon,
  PackageIcon,
  ShoppingCartIcon,
  WalletIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderRepository } from "@/features/orders/domain/order.repository";
import { WishStatusBadge } from "@/features/wishes/components/wish-badges";
import { wishRepository } from "@/features/wishes/domain/wish.repository";

export const metadata: Metadata = {
  title: "Dashboard Admin - Grouped Order",
  description: "Vue d'ensemble des commandes et paniers",
};

export default async function AdminDashboardPage() {
  // Fetch statistics in parallel
  const [openOrdersCount, submittedWishesCount, recentWishes] =
    await Promise.all([
      orderRepository.countOpenOrders(),
      wishRepository.countSubmittedWishes(),
      wishRepository.findRecentSubmittedWithDetails(5),
    ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité des commandes groupées
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commandes ouvertes
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{openOrdersCount}</p>
            <Link
              href="/admin/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Voir les commandes →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Souhaits en attente
            </CardTitle>
            <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {submittedWishesCount}
            </p>
            <p className="text-xs text-muted-foreground">
              À traiter et ajouter aux paniers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paniers actifs
            </CardTitle>
            <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">-</p>
            <p className="text-xs text-muted-foreground">
              Fonctionnalité à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paiements en attente
            </CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">-</p>
            <p className="text-xs text-muted-foreground">
              Fonctionnalité à venir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Wishes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Derniers souhaits soumis</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Souhaits en attente d'affectation à un panier
            </p>
          </div>
          {recentWishes.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">Voir toutes les commandes</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentWishes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun souhait en attente pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Membre</th>
                    <th className="pb-3 font-medium">Jeu</th>
                    <th className="pb-3 font-medium">Référence</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentWishes.map((wish) => (
                    <tr key={wish.id} className="group">
                      <td className="py-3 text-sm">
                        <div>
                          {wish.user ? (
                            <>
                              <p className="font-medium">{wish.user.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {wish.user.email}
                              </p>
                            </>
                          ) : wish.guestName ? (
                            <>
                              <p className="font-medium">{wish.guestName}</p>
                              <p className="text-muted-foreground text-xs italic">
                                Invite
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-sm font-medium">
                        {wish.gameName}
                      </td>
                      <td className="py-3 text-sm">
                        {wish.philibertUrl ? (
                          <a
                            href={wish.philibertUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {wish.philibertReference}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">
                            {wish.philibertReference}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <WishStatusBadge status={wish.status} />
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {format(wish.createdAt, "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${wish.orderId}`}>
                            Voir commande
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
