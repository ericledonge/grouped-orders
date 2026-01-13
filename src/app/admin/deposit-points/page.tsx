import type { Metadata } from "next";
import { MapPinIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { depositPointRepository } from "@/features/deposit-points/domain/deposit-point.repository";
import { CreateDepositPointForm } from "@/features/deposit-points/components/create-deposit-point-form";
import { DepositPointTable } from "@/features/deposit-points/components/deposit-point-table";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Points de dépôt - Admin - Grouped Order",
  description: "Gérer les points de dépôt",
};

export default async function DepositPointsPage() {
  await requireAdmin();

  const depositPoints = await depositPointRepository.findAll();

  // Trier par défaut en premier, puis par nom
  const sortedPoints = [...depositPoints].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Points de dépôt</h1>
        <p className="text-muted-foreground">
          Gérez les lieux de retrait des jeux
        </p>
      </div>

      {/* Formulaire de création */}
      <CreateDepositPointForm hasExistingPoints={depositPoints.length > 0} />

      {/* Liste des points de dépôt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            Points de dépôt ({depositPoints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DepositPointTable depositPoints={sortedPoints} />
        </CardContent>
      </Card>
    </div>
  );
}
