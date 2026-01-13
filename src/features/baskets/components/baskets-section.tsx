import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EyeIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasketStatusBadge } from "./basket-badges";
import type { Basket } from "../domain/basket.types";

interface BasketWithCount extends Basket {
  wishCount: number;
  totalEstimated: number;
}

interface BasketsSectionProps {
  baskets: BasketWithCount[];
  orderId: string;
}

/**
 * Section affichant les paniers d'une commande
 */
export function BasketsSection({ baskets, orderId }: BasketsSectionProps) {
  if (baskets.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Paniers</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/admin/orders/${orderId}/baskets/new`}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Créer un panier
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun panier créé pour cette commande.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Paniers ({baskets.length})</CardTitle>
        <Button size="sm" asChild>
          <Link href={`/admin/orders/${orderId}/baskets/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouveau panier
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Nom</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Souhaits</th>
                <th className="pb-3 font-medium">Total estimé</th>
                <th className="pb-3 font-medium">Créé le</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {baskets.map((basket) => (
                <tr key={basket.id} className="group">
                  <td className="py-4 text-sm font-medium">{basket.name}</td>
                  <td className="py-4">
                    <BasketStatusBadge status={basket.status} />
                  </td>
                  <td className="py-4 text-sm">{basket.wishCount}</td>
                  <td className="py-4 text-sm">
                    {basket.totalEstimated > 0
                      ? `${basket.totalEstimated.toFixed(2)} €`
                      : "-"}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {format(basket.createdAt, "d MMM yyyy", { locale: fr })}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/baskets/${basket.id}`}>
                          <EyeIcon className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Link>
                      </Button>
                      {basket.status === "draft" && (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/baskets/${basket.id}/edit`}>
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Éditer</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
