import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { orderRepository } from "@/features/orders/domain/order.repository";
import { CreateWishForm } from "@/features/wishes/use-cases/create-wish-form";

export const metadata: Metadata = {
  title: "Ajouter un souhait - Grouped Order",
  description: "Ajouter un jeu à vos souhaits pour cette commande",
};

interface NewWishPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function NewWishPage({ params }: NewWishPageProps) {
  const { orderId } = await params;

  // Vérifier que la commande existe
  const order = await orderRepository.findById(orderId);

  if (!order) {
    notFound();
  }

  // Vérifier que la commande est ouverte
  if (order.status !== "open") {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="rounded-lg border bg-card p-12 text-center space-y-4">
          <p className="text-muted-foreground">
            Cette commande n'accepte plus de nouveaux souhaits.
          </p>
          <Button asChild>
            <Link href="/orders">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour aux commandes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/orders" className="hover:underline">
          Commandes
        </Link>
        <span>/</span>
        <span>{ORDER_TYPE_LABELS[order.type]}</span>
        <span>/</span>
        <span>Nouveau souhait</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Ajouter un souhait
        </h1>
        <p className="text-muted-foreground">
          Commande {ORDER_TYPE_LABELS[order.type].toLowerCase()}
          {order.description && ` - ${order.description}`}
        </p>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl">
        <CreateWishForm orderId={orderId} />
      </div>
    </div>
  );
}
