import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BasketStatusBadge } from "@/features/baskets/components/basket-badges";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { ValidateWishesForm } from "@/features/baskets/use-cases/validate-wishes-form";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { requireMember } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Valider mes souhaits - Grouped Order",
  description: "Validez ou refusez vos souhaits dans ce panier",
};

interface ValidateBasketPageProps {
  params: Promise<{ id: string }>;
}

export default async function ValidateBasketPage({
  params,
}: ValidateBasketPageProps) {
  const session = await requireMember();
  const { id } = await params;

  // Récupérer le panier avec les souhaits de l'utilisateur
  const basket = await basketRepository.findByIdWithUserWishes(
    id,
    session.user.id,
  );

  if (!basket) {
    notFound();
  }

  // Vérifier que le panier est en attente de validation
  if (basket.status !== "awaiting_validation") {
    redirect("/my-baskets");
  }

  // Vérifier que l'utilisateur a des souhaits dans ce panier
  if (!basket.wishes || basket.wishes.length === 0) {
    redirect("/my-baskets");
  }

  // Filtrer les souhaits qui sont en status "in_basket" (pas encore validés/refusés)
  const wishesToValidate = basket.wishes.filter(
    (w) => w.status === "in_basket",
  );

  if (wishesToValidate.length === 0) {
    // Tous les souhaits ont déjà été validés/refusés
    redirect("/my-baskets");
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/my-baskets">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{basket.name}</h1>
            <BasketStatusBadge status={basket.status} />
          </div>
          <p className="text-muted-foreground">
            {basket.order?.type && ORDER_TYPE_LABELS[basket.order.type]} -{" "}
            {basket.order?.description || "Commande groupée"}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Action requise :</strong> Veuillez valider ou refuser chacun
          de vos souhaits ci-dessous. Une fois validés, vous devrez procéder au
          paiement.
        </p>
      </div>

      <ValidateWishesForm
        basketId={basket.id}
        basketName={basket.name}
        wishes={wishesToValidate.map((w) => ({
          id: w.id,
          gameName: w.gameName,
          philibertReference: w.philibertReference,
          unitPrice: w.unitPrice,
          shippingShare: w.shippingShare,
          customsShare: w.customsShare,
        }))}
      />
    </div>
  );
}
