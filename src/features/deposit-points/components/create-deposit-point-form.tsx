"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createDepositPointAction,
  type DepositPointActionState,
} from "../use-cases/deposit-point.action";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlusIcon className="mr-2 h-4 w-4" />
      )}
      Ajouter
    </Button>
  );
}

interface CreateDepositPointFormProps {
  hasExistingPoints: boolean;
}

/**
 * Formulaire de création d'un point de dépôt
 */
export function CreateDepositPointForm({
  hasExistingPoints,
}: CreateDepositPointFormProps) {
  const router = useRouter();
  const initialState: DepositPointActionState = { success: false };
  const [state, formAction] = useActionState(
    createDepositPointAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Point de dépôt créé");
      // Réinitialiser le formulaire
      const form = document.getElementById("create-deposit-point-form") as HTMLFormElement;
      form?.reset();
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un point de dépôt</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="create-deposit-point-form"
          action={formAction}
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Maison de Jean"
              required
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              placeholder="Ex: 123 rue du Jeu, Montréal"
              required
              className="mt-1"
            />
          </div>
          {!hasExistingPoints && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="text-sm">
                Par défaut
              </Label>
            </div>
          )}
          <SubmitButton />
        </form>

        {state.error && (
          <p className="mt-2 text-sm text-destructive">{state.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
