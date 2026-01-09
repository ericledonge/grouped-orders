import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { orderRepository } from "@/features/orders/domain/order.repository";
import { EditOrderForm } from "@/features/orders/use-cases/edit-order-form";

export const metadata: Metadata = {
  title: "Modifier la commande - Admin - Grouped Order",
  description: "Modifier une commande groupée",
};

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
  const order = await orderRepository.findById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/orders/${id}`}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
      </div>

      <EditOrderForm order={order} />
    </div>
  );
}
