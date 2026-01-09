"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLinkIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  OrderStatusBadge,
  OrderTypeBadge,
} from "@/features/orders/components/order-badges";
import { deleteWish } from "@/features/wishes/use-cases/delete-wish.action";
import { WishStatusBadge } from "./wish-badges";

interface WishWithOrder {
  id: string;
  gameName: string;
  philibertReference: string;
  philibertUrl: string | null;
  status:
    | "submitted"
    | "in_basket"
    | "validated"
    | "refused"
    | "paid"
    | "picked_up";
  createdAt: Date;
  order: {
    id: string;
    type: "monthly" | "private_sale" | "special";
    targetDate: Date;
    status: "open" | "in_progress" | "completed";
  };
}

interface MyWishesTableProps {
  wishes: WishWithOrder[];
}

/**
 * Table affichant la liste des souhaits d'un membre
 */
export function MyWishesTable({ wishes }: MyWishesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (wishId: string) => {
    setDeletingId(wishId);
    try {
      const result = await deleteWish(wishId);
      if (result.success) {
        toast.success("Souhait supprimé");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setDeletingId(null);
    }
  };

  if (wishes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes souhaits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Vous n'avez pas encore émis de souhaits.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes souhaits ({wishes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Jeu</th>
                <th className="pb-3 font-medium">Référence</th>
                <th className="pb-3 font-medium">Commande</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {wishes.map((wish) => (
                <tr key={wish.id} className="group">
                  <td className="py-4 text-sm font-medium">{wish.gameName}</td>
                  <td className="py-4 text-sm">
                    {wish.philibertUrl ? (
                      <a
                        href={wish.philibertUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {wish.philibertReference}
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        {wish.philibertReference}
                      </span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <OrderTypeBadge type={wish.order.type} />
                        <OrderStatusBadge status={wish.order.status} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(wish.order.targetDate, "d MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <WishStatusBadge status={wish.status} />
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {format(wish.createdAt, "d MMM yyyy", { locale: fr })}
                  </td>
                  <td className="py-4 text-right">
                    {wish.status === "submitted" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingId === wish.id}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer ce souhait ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le souhait pour
                              "{wish.gameName}" ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(wish.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
