"use client";

import { Loader2Icon, MapPinIcon, PackageCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
import type { BasketStatus } from "../domain/basket.types";
import {
  markBasketAsAvailableAction,
  markBasketAsReceivedAction,
} from "../use-cases/basket-status.action";

interface BasketStatusActionsProps {
  basketId: string;
  basketName: string;
  status: BasketStatus;
}

/**
 * Actions de changement de statut pour un panier
 */
export function BasketStatusActions({
  basketId,
  basketName,
  status,
}: BasketStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkAsReceived = async () => {
    startTransition(async () => {
      const result = await markBasketAsReceivedAction(basketId);

      if (result.success) {
        toast.success("Panier marqué comme réceptionné");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    });
  };

  const handleMarkAsAvailable = async () => {
    startTransition(async () => {
      const result = await markBasketAsAvailableAction(basketId);

      if (result.success) {
        toast.success("Panier marqué comme disponible au retrait");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    });
  };

  if (status === "awaiting_reception") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PackageCheckIcon className="mr-2 h-4 w-4" />
            )}
            Marquer comme réceptionné
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la réception</AlertDialogTitle>
            <AlertDialogDescription>
              Vous confirmez avoir réceptionné le panier{" "}
              <strong>{basketName}</strong>.
              <br />
              <br />
              Le panier passera en statut "En attente de livraison".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsReceived}>
              Confirmer la réception
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === "awaiting_delivery") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPinIcon className="mr-2 h-4 w-4" />
            )}
            Disponible au retrait
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer comme disponible</AlertDialogTitle>
            <AlertDialogDescription>
              Vous confirmez que le panier <strong>{basketName}</strong> est
              maintenant disponible au retrait.
              <br />
              <br />
              Les membres seront notifiés que leurs jeux sont prêts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsAvailable}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
