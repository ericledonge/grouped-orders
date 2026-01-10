import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { requireMember } from "@/lib/auth/session";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";
import { BasketStatusBadge } from "@/features/baskets/components/basket-badges";
import { PaymentSection } from "@/features/baskets/components/payment-section";

export const metadata: Metadata = {
  title: "Paiement - Grouped Order",
  description: "Effectuez le paiement de vos souhaits validés",
};

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
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

  // Récupérer les souhaits validés de l'utilisateur
  const validatedWishes = basket.wishes?.filter((w) => w.status === "validated") || [];
  const paidWishes = basket.wishes?.filter((w) => w.paymentStatus === "sent" || w.paymentStatus === "received") || [];

  // Si aucun souhait validé et aucun souhait payé, rediriger
  if (validatedWishes.length === 0 && paidWishes.length === 0) {
    redirect("/my-baskets");
  }

  // Calculer le total à payer (souhaits validés avec payment pending)
  const wishesToPay = validatedWishes.filter((w) => w.paymentStatus === "pending" || !w.paymentStatus);
  const totalToPay = wishesToPay.reduce((sum, wish) => {
    const unitPrice = wish.unitPrice ? Number.parseFloat(wish.unitPrice) : 0;
    const shippingShare = wish.shippingShare ? Number.parseFloat(wish.shippingShare) : 0;
    const customsShare = wish.customsShare ? Number.parseFloat(wish.customsShare) : 0;
    return sum + unitPrice + shippingShare + customsShare;
  }, 0);

  const allPaid = wishesToPay.length === 0 && paidWishes.length > 0;

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

      {allPaid ? (
        <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircleIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Paiement envoyé</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Votre paiement a été marqué comme envoyé. L'administrateur le confirmera
              dès réception.
            </p>
            <Button asChild className="mt-4">
              <Link href="/my-baskets">Retour aux paniers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Récapitulatif des souhaits validés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Souhaits à payer ({wishesToPay.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg divide-y">
                {wishesToPay.map((wish) => {
                  const unitPrice = wish.unitPrice
                    ? Number.parseFloat(wish.unitPrice)
                    : 0;
                  const shippingShare = wish.shippingShare
                    ? Number.parseFloat(wish.shippingShare)
                    : 0;
                  const customsShare = wish.customsShare
                    ? Number.parseFloat(wish.customsShare)
                    : 0;
                  const wishTotal = unitPrice + shippingShare + customsShare;

                  return (
                    <div
                      key={wish.id}
                      className="flex items-center justify-between p-3"
                    >
                      <div>
                        <p className="font-medium">{wish.gameName}</p>
                        <p className="text-sm text-muted-foreground">
                          {unitPrice.toFixed(2)} € + {shippingShare.toFixed(2)} € port
                          {customsShare > 0 &&
                            ` + ${customsShare.toFixed(2)} € douane`}
                        </p>
                      </div>
                      <p className="font-semibold">{wishTotal.toFixed(2)} €</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <span className="font-medium">Total à payer</span>
                <span className="text-2xl font-bold">{totalToPay.toFixed(2)} €</span>
              </div>
            </CardContent>
          </Card>

          {/* Section paiement */}
          <PaymentSection basketId={basket.id} totalToPay={totalToPay} />
        </>
      )}
    </div>
  );
}
