import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { basketRepository } from "@/features/baskets/domain/basket.repository";
import { BasketStatusBadge } from "@/features/baskets/components/basket-badges";
import { AdminPaymentTable } from "@/features/baskets/components/admin-payment-table";
import { requireAdmin } from "@/lib/auth/session";
import { ORDER_TYPE_LABELS } from "@/features/orders/domain/order.labels";

export const metadata: Metadata = {
  title: "Gestion des paiements - Admin",
  description: "Gérer les paiements d'un panier",
};

interface AdminPaymentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPaymentsPage({
  params,
}: AdminPaymentsPageProps) {
  await requireAdmin();
  const { id } = await params;

  const basket = await basketRepository.findByIdWithWishesGroupedByMember(id);

  if (!basket) {
    notFound();
  }

  // Calculer les totaux
  const totalDue = basket.memberPayments.reduce((sum, m) => sum + m.totalDue, 0);
  const totalReceived = basket.memberPayments.reduce(
    (sum, m) => sum + m.totalPaid,
    0,
  );
  const pendingCount = basket.memberPayments.filter(
    (m) => m.paymentStatus === "sent",
  ).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/baskets/${id}`}>
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

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total à recevoir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDue.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total reçu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totalReceived.toFixed(2)} €
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paiements en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Paiements par membre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminPaymentTable
            basketId={basket.id}
            memberPayments={basket.memberPayments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
