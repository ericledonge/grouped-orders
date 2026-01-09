"use client";

import { useActionState, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLinkIcon, Loader2Icon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBasketAction,
  type CreateBasketState,
} from "./create-basket.action";

interface WishWithUser {
  id: string;
  gameName: string;
  philibertReference: string;
  philibertUrl: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateBasketFormProps {
  orderId: string;
  orderName: string;
  availableWishes: WishWithUser[];
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
      Créer le panier
    </Button>
  );
}

/**
 * Formulaire de création d'un nouveau panier
 */
export function CreateBasketForm({
  orderId,
  orderName,
  availableWishes,
}: CreateBasketFormProps) {
  const initialState: CreateBasketState = { success: false };
  const [state, formAction] = useActionState(createBasketAction, initialState);

  const [selectedWishes, setSelectedWishes] = useState<Set<string>>(new Set());
  const [basketName, setBasketName] = useState(
    `Panier ${format(new Date(), "MMMM yyyy", { locale: fr })}`,
  );

  // Calculer le nombre de souhaits sélectionnés par membre
  const memberStats = useMemo(() => {
    const stats = new Map<string, { name: string; count: number }>();
    for (const wishId of selectedWishes) {
      const wish = availableWishes.find((w) => w.id === wishId);
      if (wish) {
        const existing = stats.get(wish.user.id);
        if (existing) {
          existing.count += 1;
        } else {
          stats.set(wish.user.id, { name: wish.user.name, count: 1 });
        }
      }
    }
    return stats;
  }, [selectedWishes, availableWishes]);

  const toggleWish = (wishId: string) => {
    setSelectedWishes((prev) => {
      const next = new Set(prev);
      if (next.has(wishId)) {
        next.delete(wishId);
      } else {
        next.add(wishId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedWishes(new Set(availableWishes.map((w) => w.id)));
  };

  const clearAll = () => {
    setSelectedWishes(new Set());
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="orderId" value={orderId} />

      {/* Erreur globale */}
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
          {state.error}
        </div>
      )}

      {/* Nom du panier */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du panier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du panier</Label>
            <Input
              id="name"
              name="name"
              value={basketName}
              onChange={(e) => setBasketName(e.target.value)}
              placeholder="Ex: Panier Janvier 2026"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Commande: <span className="font-medium">{orderName}</span>
          </p>
        </CardContent>
      </Card>

      {/* Sélection des souhaits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            Souhaits disponibles ({selectedWishes.size}/{availableWishes.length}{" "}
            sélectionnés)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Tout sélectionner
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={selectedWishes.size === 0}
            >
              Effacer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {availableWishes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun souhait disponible pour créer un panier.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium w-10" />
                    <th className="pb-3 font-medium">Membre</th>
                    <th className="pb-3 font-medium">Jeu</th>
                    <th className="pb-3 font-medium">Référence</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {availableWishes.map((wish) => (
                    <tr
                      key={wish.id}
                      className={`group cursor-pointer transition-colors ${
                        selectedWishes.has(wish.id)
                          ? "bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleWish(wish.id)}
                    >
                      <td className="py-4">
                        <input
                          type="checkbox"
                          name="wishIds"
                          value={wish.id}
                          checked={selectedWishes.has(wish.id)}
                          onChange={() => toggleWish(wish.id)}
                          className="h-4 w-4 rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            {wish.philibertReference}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        ) : (
                          wish.philibertReference
                        )}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {format(wish.createdAt, "d MMM yyyy", { locale: fr })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé de la sélection */}
      {selectedWishes.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé de la sélection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(memberStats.entries()).map(([userId, { name, count }]) => (
                <div
                  key={userId}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                >
                  <CheckIcon className="h-3 w-3 text-green-600" />
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">
                    ({count} jeu{count > 1 ? "x" : ""})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <a href={`/admin/orders/${orderId}`}>Annuler</a>
        </Button>
        <SubmitButton disabled={selectedWishes.size === 0 || !basketName} />
      </div>
    </form>
  );
}
