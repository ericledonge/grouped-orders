import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { orderRepository } from "@/features/orders/domain/order.repository";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await orderRepository.findById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Commande {ORDER_TYPE_LABELS[order.type]}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Type
              </dt>
              <dd className="text-base">{ORDER_TYPE_LABELS[order.type]}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Date cible
              </dt>
              <dd className="text-base">
                {format(order.targetDate, "PPP", { locale: fr })}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Statut
              </dt>
              <dd className="text-base">{order.status}</dd>
            </div>

            {order.description && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Description
                </dt>
                <dd className="text-base">{order.description}</dd>
              </div>
            )}
          </dl>

          <p className="mt-6 text-sm text-muted-foreground italic">
            Page de détail en cours de développement
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
