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
  title: "Commandes - Grouped Order",
  description: "Voir les commandes groupées en cours",
};

export default async function OrdersPage() {
  const orders = await orderRepository.findOpenOrders();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
        <p className="text-muted-foreground">
          Consultez les commandes groupées en cours et émettez vos souhaits
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">
              Aucune commande ouverte pour le moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Les administrateurs créeront bientôt de nouvelles commandes
              groupées.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <OrderTypeBadge type={order.type} />
                  <OrderStatusBadge status={order.status} />
                </div>
                <CardTitle className="text-lg">
                  Commande du{" "}
                  {format(order.targetDate, "d MMMM yyyy", { locale: fr })}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {order.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {order.description}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <Button asChild className="w-full">
                    <Link href={`/orders/${order.id}/wishes/new`}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Ajouter un souhait
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
