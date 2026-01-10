"use client";

import { useActionState, useState, useMemo, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ExternalLinkIcon,
  Loader2Icon,
  SaveIcon,
  SendIcon,
  CalculatorIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  updateBasketPricesAction,
  submitBasketForValidationAction,
  type UpdateBasketPricesState,
} from "./update-basket-prices.action";
import { removeWishFromBasketAction } from "./remove-wish-from-basket.action";
import { deleteBasketAction } from "./delete-basket.action";
import {
  calculateProrataShares,
  calculateAmountDue,
  roundToTwoDecimals,
} from "../domain/basket.service";

interface WishWithUser {
  id: string;
  gameName: string;
  philibertReference: string;
  philibertUrl: string | null;
  unitPrice: string | null;
  shippingShare: string | null;
  amountDue: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface EditBasketFormProps {
  basketId: string;
  basketName: string;
  orderId: string;
  shippingCost: string | null;
  wishes: WishWithUser[];
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <SaveIcon className="mr-2 h-4 w-4" />
      )}
      Enregistrer
    </Button>
  );
}

/**
 * Formulaire d'édition d'un panier
 * Permet de saisir les prix unitaires et les frais de port
 */
export function EditBasketForm({
  basketId,
  basketName,
  orderId,
  shippingCost: initialShippingCost,
  wishes,
}: EditBasketFormProps) {
  const router = useRouter();
  const initialState: UpdateBasketPricesState = { success: false };
  const [state, formAction] = useActionState(
    updateBasketPricesAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  // État local pour les prix
  const [prices, setPrices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const wish of wishes) {
      initial[wish.id] = wish.unitPrice || "";
    }
    return initial;
  });

  const [shippingCost, setShippingCost] = useState(initialShippingCost || "");
  const [removingWishId, setRemovingWishId] = useState<string | null>(null);
  const [isDeletingBasket, setIsDeletingBasket] = useState(false);

  // Calculs en temps réel
  const calculations = useMemo(() => {
    const items = wishes
      .map((w) => ({
        id: w.id,
        price: Number.parseFloat(prices[w.id] || "0") || 0,
      }))
      .filter((item) => item.price > 0);

    const shippingNum = Number.parseFloat(shippingCost || "0") || 0;
    const shares = calculateProrataShares(items, shippingNum);
    const sharesMap = new Map(shares.map((s) => [s.id, s.share]));

    const wishTotals = wishes.map((w) => {
      const unitPrice = Number.parseFloat(prices[w.id] || "0") || 0;
      const shippingShare = sharesMap.get(w.id) || 0;
      const total = calculateAmountDue(unitPrice, shippingShare);

      return {
        id: w.id,
        unitPrice,
        shippingShare,
        total,
      };
    });

    const totalGames = wishTotals.reduce((sum, w) => sum + w.unitPrice, 0);
    const totalShipping = shippingNum;
    const grandTotal = wishTotals.reduce((sum, w) => sum + w.total, 0);

    return {
      wishTotals,
      totalGames,
      totalShipping,
      grandTotal,
    };
  }, [wishes, prices, shippingCost]);

  // Afficher un toast après sauvegarde
  useEffect(() => {
    if (state.success) {
      toast.success("Panier enregistré avec succès");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handlePriceChange = (wishId: string, value: string) => {
    // Accepter seulement les nombres avec max 2 décimales
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setPrices((prev) => ({ ...prev, [wishId]: value }));
    }
  };

  const handleShippingChange = (value: string) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setShippingCost(value);
    }
  };

  const handleSubmitForValidation = async () => {
    startTransition(async () => {
      const result = await submitBasketForValidationAction(basketId);
      if (result.success) {
        toast.success("Panier soumis pour validation");
        router.push(`/admin/baskets/${basketId}`);
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    });
  };

  const handleRemoveWish = async (wishId: string) => {
    setRemovingWishId(wishId);
    try {
      const result = await removeWishFromBasketAction(wishId, basketId);
      if (result.success) {
        toast.success("Souhait retiré du panier");
        // Retirer le souhait de l'état local
        setPrices((prev) => {
          const newPrices = { ...prev };
          delete newPrices[wishId];
          return newPrices;
        });
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } finally {
      setRemovingWishId(null);
    }
  };

  const handleDeleteBasket = async () => {
    setIsDeletingBasket(true);
    try {
      const result = await deleteBasketAction(basketId);
      if (result.success) {
        toast.success("Panier supprimé");
        router.push(`/admin/orders/${result.orderId}`);
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } finally {
      setIsDeletingBasket(false);
    }
  };

  // Vérifier si tous les prix sont renseignés
  const allPricesFilled = wishes.every(
    (w) => prices[w.id] && Number.parseFloat(prices[w.id]) > 0,
  );
  const shippingFilled =
    shippingCost !== "" && Number.parseFloat(shippingCost) >= 0;
  const canSubmit = allPricesFilled && shippingFilled;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="basketId" value={basketId} />

        {/* Erreur globale */}
        {state.error && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            {state.error}
          </div>
        )}

        {/* Frais de port */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5" />
              Frais de port
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="shippingCost">Frais de port totaux (€)</Label>
                <Input
                  id="shippingCost"
                  name="shippingCost"
                  type="text"
                  inputMode="decimal"
                  value={shippingCost}
                  onChange={(e) => handleShippingChange(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <p className="text-sm text-muted-foreground pt-6">
                Sera réparti au prorata des prix des jeux
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Prix des jeux */}
        <Card>
          <CardHeader>
            <CardTitle>Prix des jeux ({wishes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Membre</th>
                    <th className="pb-3 font-medium">Jeu</th>
                    <th className="pb-3 font-medium">Référence</th>
                    <th className="pb-3 font-medium w-32">Prix (€)</th>
                    <th className="pb-3 font-medium w-28 text-right">
                      Port (€)
                    </th>
                    <th className="pb-3 font-medium w-28 text-right">
                      Total (€)
                    </th>
                    <th className="pb-3 font-medium w-20 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {wishes.map((wish) => {
                    const calc = calculations.wishTotals.find(
                      (c) => c.id === wish.id,
                    );
                    return (
                      <tr key={wish.id}>
                        <td className="py-4 text-sm">
                          <div>
                            <p className="font-medium">{wish.user.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {wish.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-medium">
                          {wish.gameName}
                        </td>
                        <td className="py-4 text-sm">
                          {wish.philibertUrl ? (
                            <a
                              href={wish.philibertUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              {wish.philibertReference}
                              <ExternalLinkIcon className="h-3 w-3" />
                            </a>
                          ) : (
                            wish.philibertReference
                          )}
                        </td>
                        <td className="py-4">
                          <Input
                            type="text"
                            inputMode="decimal"
                            name={`wishPrice_${wish.id}`}
                            value={prices[wish.id]}
                            onChange={(e) =>
                              handlePriceChange(wish.id, e.target.value)
                            }
                            placeholder="0.00"
                            className="w-28"
                          />
                        </td>
                        <td className="py-4 text-sm text-right text-muted-foreground">
                          {calc && calc.shippingShare > 0
                            ? roundToTwoDecimals(calc.shippingShare).toFixed(2)
                            : "-"}
                        </td>
                        <td className="py-4 text-sm text-right font-medium">
                          {calc && calc.total > 0
                            ? roundToTwoDecimals(calc.total).toFixed(2)
                            : "-"}
                        </td>
                        <td className="py-4 text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={removingWishId === wish.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {removingWishId === wish.id ? (
                                  <Loader2Icon className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2Icon className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Retirer ce souhait du panier ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir retirer{" "}
                                  <strong>{wish.gameName}</strong> du panier ?
                                  <br />
                                  <br />
                                  Le souhait repassera en attente d&apos;affectation
                                  et les frais de port seront recalculés.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveWish(wish.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Retirer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-medium">
                    <td colSpan={3} className="py-4 text-right">
                      Totaux :
                    </td>
                    <td className="py-4 text-sm">
                      {calculations.totalGames > 0
                        ? `${calculations.totalGames.toFixed(2)} €`
                        : "-"}
                    </td>
                    <td className="py-4 text-sm text-right">
                      {calculations.totalShipping > 0
                        ? `${calculations.totalShipping.toFixed(2)} €`
                        : "-"}
                    </td>
                    <td className="py-4 text-sm text-right text-lg">
                      {calculations.grandTotal > 0
                        ? `${calculations.grandTotal.toFixed(2)} €`
                        : "-"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between gap-4">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" asChild>
              <a href={`/admin/orders/${orderId}`}>Retour à la commande</a>
            </Button>

            {/* Supprimer le panier */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeletingBasket}
                >
                  {isDeletingBasket ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2Icon className="mr-2 h-4 w-4" />
                  )}
                  Supprimer le panier
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Supprimer ce panier ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer le panier{" "}
                    <strong>{basketName}</strong> ?
                    <br />
                    <br />
                    ⚠️ Cette action est irréversible. Tous les souhaits
                    ({wishes.length}) seront remis en attente d&apos;affectation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteBasket}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex gap-2">
            <SaveButton />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" disabled={!canSubmit || isPending}>
                  {isPending ? (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="mr-2 h-4 w-4" />
                  )}
                  Soumettre pour validation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la soumission</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir soumettre ce panier pour validation
                    ?
                    <br />
                    <br />
                    <strong>Récapitulatif :</strong>
                    <br />• {wishes.length} jeux pour un total de{" "}
                    {calculations.grandTotal.toFixed(2)} €<br />• Frais de port
                    : {calculations.totalShipping.toFixed(2)} €
                    <br />
                    <br />
                    Les membres seront invités à valider leurs souhaits.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmitForValidation}>
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </div>
  );
}
