"use client";

import {
  CheckCircle2Icon,
  Loader2Icon,
  ShoppingCartIcon,
  XCircleIcon,
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
import { Label } from "@/components/ui/label";
import { validateWishesAction } from "./validate-wishes.action";

interface WishToValidate {
  id: string;
  gameName: string;
  philibertReference: string;
  unitPrice: string | null;
  shippingShare: string | null;
  customsShare: string | null;
}

interface ValidateWishesFormProps {
  basketId: string;
  basketName: string;
  wishes: WishToValidate[];
}

type ValidationChoice = "validate" | "refuse" | null;

/**
 * Formulaire de validation des souhaits par le membre
 */
export function ValidateWishesForm({
  basketId,
  basketName,
  wishes,
}: ValidateWishesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [choices, setChoices] = useState<Record<string, ValidationChoice>>(
    () => {
      const initial: Record<string, ValidationChoice> = {};
      for (const wish of wishes) {
        initial[wish.id] = null;
      }
      return initial;
    },
  );

  // Calculer les totaux
  const wishesData = wishes.map((wish) => {
    const unitPrice = wish.unitPrice ? Number.parseFloat(wish.unitPrice) : 0;
    const shippingShare = wish.shippingShare
      ? Number.parseFloat(wish.shippingShare)
      : 0;
    const customsShare = wish.customsShare
      ? Number.parseFloat(wish.customsShare)
      : 0;
    const total = unitPrice + shippingShare + customsShare;
    return { ...wish, unitPrice, shippingShare, customsShare, total };
  });

  const validatedTotal = wishesData
    .filter((w) => choices[w.id] === "validate")
    .reduce((sum, w) => sum + w.total, 0);

  const allChoicesMade = wishes.every((w) => choices[w.id] !== null);
  const validatedCount = Object.values(choices).filter(
    (c) => c === "validate",
  ).length;
  const refusedCount = Object.values(choices).filter(
    (c) => c === "refuse",
  ).length;

  const handleChoiceChange = (wishId: string, choice: ValidationChoice) => {
    setChoices((prev) => ({ ...prev, [wishId]: choice }));
  };

  const handleValidateAll = () => {
    const newChoices: Record<string, ValidationChoice> = {};
    for (const wish of wishes) {
      newChoices[wish.id] = "validate";
    }
    setChoices(newChoices);
  };

  const handleRefuseAll = () => {
    const newChoices: Record<string, ValidationChoice> = {};
    for (const wish of wishes) {
      newChoices[wish.id] = "refuse";
    }
    setChoices(newChoices);
  };

  const handleSubmit = async () => {
    const validations = wishes.map((wish) => ({
      wishId: wish.id,
      action: choices[wish.id] as "validate" | "refuse",
    }));

    startTransition(async () => {
      const result = await validateWishesAction(basketId, validations);

      if (result.success) {
        if (validatedCount > 0) {
          toast.success(
            `${validatedCount} souhait${validatedCount > 1 ? "s" : ""} validé${validatedCount > 1 ? "s" : ""}`,
          );
          // Rediriger vers la page de paiement
          router.push(`/baskets/${basketId}/payment`);
        } else {
          // Tout a été refusé, retour aux paniers
          router.push("/my-baskets");
        }
        if (refusedCount > 0 && validatedCount > 0) {
          toast.info(
            `${refusedCount} souhait${refusedCount > 1 ? "s" : ""} refusé${refusedCount > 1 ? "s" : ""}`,
          );
        }
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions rapides */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleValidateAll}>
          <CheckCircle2Icon className="mr-2 h-4 w-4 text-green-600" />
          Tout valider
        </Button>
        <Button variant="outline" size="sm" onClick={handleRefuseAll}>
          <XCircleIcon className="mr-2 h-4 w-4 text-red-600" />
          Tout refuser
        </Button>
      </div>

      {/* Liste des souhaits */}
      <div className="space-y-4">
        {wishesData.map((wish) => (
          <Card
            key={wish.id}
            className={
              choices[wish.id] === "validate"
                ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                : choices[wish.id] === "refuse"
                  ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                  : ""
            }
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{wish.gameName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Réf: {wish.philibertReference}
                  </p>
                  <div className="text-sm">
                    <span>{wish.unitPrice.toFixed(2)} €</span>
                    <span className="text-muted-foreground">
                      {" "}
                      + {wish.shippingShare.toFixed(2)} € port
                    </span>
                    {wish.customsShare > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        + {wish.customsShare.toFixed(2)} € douane
                      </span>
                    )}
                    <span className="font-semibold ml-2">
                      = {wish.total.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={
                      choices[wish.id] === "validate" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleChoiceChange(wish.id, "validate")}
                    className={
                      choices[wish.id] === "validate"
                        ? "bg-green-600 hover:bg-green-700"
                        : "border-green-600 text-green-600 hover:bg-green-50"
                    }
                  >
                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                    Valider
                  </Button>
                  <Button
                    variant={
                      choices[wish.id] === "refuse" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleChoiceChange(wish.id, "refuse")}
                    className={
                      choices[wish.id] === "refuse"
                        ? "bg-red-600 hover:bg-red-700"
                        : "border-red-600 text-red-600 hover:bg-red-50"
                    }
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Récapitulatif et confirmation */}
      <Card className="sticky bottom-4 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Récapitulatif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600">
              ✓ {validatedCount} souhait{validatedCount !== 1 ? "s" : ""} validé
              {validatedCount !== 1 ? "s" : ""}
            </span>
            <span className="text-red-600">
              ✗ {refusedCount} souhait{refusedCount !== 1 ? "s" : ""} refusé
              {refusedCount !== 1 ? "s" : ""}
            </span>
          </div>

          {validatedCount > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium">Total à payer</span>
              <span className="text-2xl font-bold">
                {validatedTotal.toFixed(2)} €
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" asChild>
              <a href="/my-baskets">Annuler</a>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!allChoicesMade || isPending}>
                  {isPending ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  )}
                  Confirmer mes choix
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la validation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous êtes sur le point de confirmer vos choix pour le panier{" "}
                    <strong>{basketName}</strong>.
                    <br />
                    <br />
                    <strong>{validatedCount}</strong> souhait
                    {validatedCount !== 1 ? "s" : ""} validé
                    {validatedCount !== 1 ? "s" : ""} pour un total de{" "}
                    <strong>{validatedTotal.toFixed(2)} €</strong>
                    <br />
                    <strong>{refusedCount}</strong> souhait
                    {refusedCount !== 1 ? "s" : ""} refusé
                    {refusedCount !== 1 ? "s" : ""}
                    <br />
                    <br />
                    Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
