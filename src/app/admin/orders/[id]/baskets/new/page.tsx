import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreateBasketForm } from "@/features/baskets/use-cases/create-basket-form";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { orderRepository } from "@/features/orders/domain/order.repository";

export const metadata: Metadata = {
  title: "Créer un panier - Admin - Grouped Order",
  description: "Créer un nouveau panier pour une commande groupée",
};

interface NewBasketPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewBasketPage({ params }: NewBasketPageProps) {
  const { id } = await params;
  const order = await orderRepository.findByIdWithWishes(id);

  if (!order) {
    notFound();
  }

  // Filtrer les souhaits disponibles (status = submitted)
  const availableWishes = order.wishes.filter((w) => w.status === "submitted");

  // Construire le nom de la commande
  const orderName = `${ORDER_TYPE_LABELS[order.type]} - ${format(order.targetDate, "d MMMM yyyy", { locale: fr })}`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/orders/${id}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Retour à la commande
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Créer un panier</h1>
        <p className="text-muted-foreground">
          Sélectionnez les souhaits à inclure dans ce panier.
        </p>
      </div>

      {/* Formulaire */}
      <CreateBasketForm
        orderId={id}
        orderName={orderName}
        availableWishes={availableWishes}
      />
    </div>
  );
}
