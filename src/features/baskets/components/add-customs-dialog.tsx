"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, ReceiptIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { addCustomsCostAction } from "../use-cases/add-customs-cost.action";

interface AddCustomsDialogProps {
  basketId: string;
  basketName: string;
  validatedWishesCount: number;
  totalGames: number;
}

/**
 * Dialog pour ajouter les frais de douane à un panier
 */
export function AddCustomsDialog({
  basketId,
  basketName,
  validatedWishesCount,
  totalGames,
}: AddCustomsDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customsCost, setCustomsCost] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async () => {
    const amount = Number.parseFloat(customsCost);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Montant invalide");
      return;
    }

    startTransition(async () => {
      const result = await addCustomsCostAction(basketId, amount);

      if (result.success) {
        toast.success("Frais de douane ajoutés et répartis");
        setIsOpen(false);
        setCustomsCost("");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    });
  };

  const handleCostChange = (value: string) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomsCost(value);
    }
  };

  // Calculer l'estimation du coût par jeu
  const costNum = Number.parseFloat(customsCost || "0") || 0;
  const avgCostPerGame = validatedWishesCount > 0 ? costNum / validatedWishesCount : 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <ReceiptIcon className="mr-2 h-4 w-4" />
          Ajouter frais de douane
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Ajouter les frais de douane</AlertDialogTitle>
          <AlertDialogDescription>
            Saisissez le montant total des frais de douane pour le panier{" "}
            <strong>{basketName}</strong>.
            <br />
            <br />
            Ces frais seront répartis au prorata du prix des jeux entre les{" "}
            <strong>{validatedWishesCount}</strong> souhaits validés.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="customsCost">Montant total des frais de douane (€)</Label>
            <Input
              id="customsCost"
              type="text"
              inputMode="decimal"
              value={customsCost}
              onChange={(e) => handleCostChange(e.target.value)}
              placeholder="0.00"
              className="mt-1"
            />
          </div>

          {costNum > 0 && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                Coût moyen par jeu :{" "}
                <span className="font-medium text-foreground">
                  ~{avgCostPerGame.toFixed(2)} €
                </span>
              </p>
              <p className="text-muted-foreground mt-1">
                Total jeux : {totalGames.toFixed(2)} € + Douane : {costNum.toFixed(2)} € ={" "}
                <span className="font-medium text-foreground">
                  {(totalGames + costNum).toFixed(2)} €
                </span>
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isPending || !customsCost || Number.parseFloat(customsCost) < 0}
          >
            {isPending ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Ajouter et répartir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
