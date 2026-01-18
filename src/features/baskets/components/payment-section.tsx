"use client";

import { InfoIcon, Loader2Icon, SendIcon } from "lucide-react";
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
import { markPaymentSentAction } from "../use-cases/mark-payment-sent.action";

interface PaymentSectionProps {
  basketId: string;
  totalToPay: number;
}

/**
 * Section pour marquer le paiement comme envoyé
 */
export function PaymentSection({ basketId, totalToPay }: PaymentSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkPaymentSent = async () => {
    startTransition(async () => {
      const result = await markPaymentSentAction(basketId);

      if (result.success) {
        toast.success("Paiement marqué comme envoyé");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SendIcon className="h-5 w-5" />
          Envoyer le paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-2">Instructions de paiement :</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Envoyez le montant de{" "}
                  <strong>{totalToPay.toFixed(2)} €</strong> via Interac
                </li>
                <li>
                  Une fois le virement effectué, cliquez sur le bouton
                  ci-dessous
                </li>
                <li>
                  L'administrateur confirmera la réception de votre paiement
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isPending}>
                {isPending ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="mr-2 h-4 w-4" />
                )}
                J'ai envoyé le paiement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirmer l'envoi du paiement
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Vous confirmez avoir envoyé un paiement de{" "}
                  <strong>{totalToPay.toFixed(2)} €</strong> pour vos souhaits
                  validés.
                  <br />
                  <br />
                  L'administrateur sera notifié et confirmera la réception.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleMarkPaymentSent}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
