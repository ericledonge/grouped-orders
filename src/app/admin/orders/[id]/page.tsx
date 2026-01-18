import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeftIcon, PencilIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasketsSection } from "@/features/baskets/components/baskets-section";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import {
  OrderStatusBadge,
  OrderTypeBadge,
} from "@/features/orders/components/order-badges";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { orderRepository } from "@/features/orders/domain/order.repository";
import { AdminCreateWishSheet } from "@/features/wishes/components/admin-create-wish-sheet";
import { WishesTableWithFilter } from "@/features/wishes/components/wishes-table-with-filter";

export const metadata: Metadata = {
  title: "Détails de la commande - Admin - Grouped Order",
  description: "Voir les détails d'une commande groupée",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await orderRepository.findByIdWithWishes(id);

  if (!order) {
    notFound();
  }

  // Récupérer les paniers de cette commande
  const baskets = await basketRepository.findByOrderIdWithWishCount(id);

  // Compter les souhaits disponibles pour un nouveau panier (status = submitted)
  const availableWishesCount = order.wishes.filter(
    (w) => w.status === "submitted",
  ).length;

  // Calculer les statistiques des souhaits par statut
  const wishStats = order.wishes.reduce(
    (acc, wish) => {
      acc[wish.status] = (acc[wish.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Retour aux commandes
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Commande {ORDER_TYPE_LABELS[order.type]}
            </h1>
            <OrderTypeBadge type={order.type} />
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground">
            Date cible : {format(order.targetDate, "PPP", { locale: fr })}
          </p>
          {order.description && (
            <p className="text-sm text-muted-foreground">{order.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {order.status === "open" && <AdminCreateWishSheet orderId={id} />}
          <Button variant="outline" asChild>
            <Link href={`/admin/orders/${id}/edit`}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Éditer
            </Link>
          </Button>
          {availableWishesCount > 0 && (
            <Button asChild>
              <Link href={`/admin/orders/${id}/baskets/new`}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Créer un panier
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
              Total souhaits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{order.wishes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Soumis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {wishStats.submitted || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Validés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {wishStats.validated || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Récupérés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">
              {wishStats.picked_up || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Paniers */}
      <BasketsSection baskets={baskets} orderId={id} />

      {/* Liste des souhaits avec filtres */}
      <WishesTableWithFilter wishes={order.wishes} orderId={id} />
    </div>
  );
}
