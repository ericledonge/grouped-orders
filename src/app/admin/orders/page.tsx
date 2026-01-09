import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OrderStatusBadge,
  OrderTypeBadge,
} from "@/features/orders/components/order-badges";
import { orderRepository } from "@/features/orders/domain/order.repository";

export const metadata: Metadata = {
  title: "Commandes - Admin - Grouped Order",
  description: "Gérer les commandes groupées",
};

export default async function AdminOrdersPage() {
  const orders = await orderRepository.findAllWithWishCount();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            Gérez les commandes groupées et leurs souhaits
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouvelle commande
          </Link>
        </Button>
      </div>

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Aucune commande pour le moment.
            </p>
            <Button asChild>
              <Link href="/admin/orders/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Créer une commande
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Date cible</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium text-center">Souhaits</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="group">
                      <td className="py-4">
                        <OrderTypeBadge type={order.type} />
                      </td>
                      <td className="py-4 text-sm">
                        {format(order.targetDate, "PPP", { locale: fr })}
                      </td>
                      <td className="py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-4 text-center text-sm">
                        {order.wishCount}
                      </td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            Voir détails
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
