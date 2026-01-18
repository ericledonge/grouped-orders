"use client";

import {
  CheckCircle2Icon,
  Loader2Icon,
  MapPinIcon,
  PackageCheckIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { markWishAsPickedUpAction } from "@/features/wishes/use-cases/mark-picked-up.action";
import { BasketStatusBadge } from "./basket-badges";

interface WishWithDepositPoint {
  id: string;
  gameName: string;
  status: string;
  depositPoint: {
    id: string;
    name: string;
    address: string;
  } | null;
}

interface PickupCardProps {
  basketId: string;
  basketName: string;
  status: string;
  orderDescription: string | null;
  wishes: WishWithDepositPoint[];
}

/**
 * Card pour un panier disponible au retrait
 */
export function PickupCard({
  basketId,
  basketName,
  status,
  orderDescription,
  wishes,
}: PickupCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingWishId, setProcessingWishId] = useState<string | null>(null);

  const handlePickup = async (wishId: string) => {
    setProcessingWishId(wishId);
    startTransition(async () => {
      const result = await markWishAsPickedUpAction(wishId);

      if (result.success) {
        toast.success("Jeu marqué comme récupéré !");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
      setProcessingWishId(null);
    });
  };

  // Grouper par point de dépôt
  const wishesByDepositPoint = new Map<
    string,
    { name: string; address: string; wishes: WishWithDepositPoint[] }
  >();

  for (const wish of wishes) {
    const key = wish.depositPoint?.id || "default";
    const existing = wishesByDepositPoint.get(key);

    if (existing) {
      existing.wishes.push(wish);
    } else {
      wishesByDepositPoint.set(key, {
        name: wish.depositPoint?.name || "Point de dépôt par défaut",
        address: wish.depositPoint?.address || "",
        wishes: [wish],
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <PackageCheckIcon className="h-5 w-5 text-green-600" />
              {basketName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {orderDescription || "Commande groupée"}
            </p>
          </div>
          <BasketStatusBadge status={status as any} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {Array.from(wishesByDepositPoint.entries()).map(
          ([key, { name, address, wishes: groupWishes }]) => (
            <div key={key} className="space-y-3">
              {/* Point de dépôt */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <MapPinIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {name}
                  </p>
                  {address && (
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {address}
                    </p>
                  )}
                </div>
              </div>

              {/* Liste des jeux */}
              <div className="border rounded-lg divide-y">
                {groupWishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="flex items-center justify-between p-3"
                  >
                    <div>
                      <p className="font-medium">{wish.gameName}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          disabled={isPending && processingWishId === wish.id}
                        >
                          {isPending && processingWishId === wish.id ? (
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2Icon className="mr-2 h-4 w-4" />
                          )}
                          Récupéré
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmer la récupération
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Vous confirmez avoir récupéré{" "}
                            <strong>{wish.gameName}</strong> ?
                            <br />
                            <br />
                            Cette action clôturera ce souhait.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handlePickup(wish.id)}
                          >
                            Confirmer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </CardContent>
    </Card>
  );
}
