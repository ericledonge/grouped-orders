import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { BasketStatusBadge } from "@/features/baskets/components/basket-badges";
import { EditBasketForm } from "@/features/baskets/use-cases/edit-basket-form";

export const metadata: Metadata = {
  title: "Éditer un panier - Admin - Grouped Order",
  description: "Modifier les prix d'un panier",
};

interface EditBasketPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBasketPage({ params }: EditBasketPageProps) {
  const { id } = await params;
  const basket = await basketRepository.findByIdWithWishes(id);

  if (!basket) {
    notFound();
  }

  // Rediriger si le panier n'est pas en brouillon
  if (basket.status !== "draft") {
    redirect(`/admin/baskets/${id}`);
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
            <h1 className="text-3xl font-bold tracking-tight">{basket.name}</h1>
            <BasketStatusBadge status={basket.status} />
          </div>
          <p className="text-muted-foreground">
            Saisissez les prix des jeux et les frais de port pour calculer le
            total de chaque membre.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <EditBasketForm
        basketId={id}
        basketName={basket.name}
        orderId={basket.orderId}
        shippingCost={basket.shippingCost}
        wishes={basket.wishes}
      />
    </div>
  );
}
