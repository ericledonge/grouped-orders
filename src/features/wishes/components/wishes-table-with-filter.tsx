"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLinkIcon, FilterIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WISH_STATUS_LABELS } from "../domain/wish.labels";
import { WishStatusBadge } from "./wish-badges";

type WishStatus =
  | "submitted"
  | "in_basket"
  | "validated"
  | "refused"
  | "paid"
  | "picked_up";

interface WishWithUser {
  id: string;
  gameName: string;
  philibertReference: string;
  philibertUrl: string | null;
  status: WishStatus;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface WishesTableWithFilterProps {
  wishes: WishWithUser[];
  orderId?: string;
}

const ALL_STATUSES = "all";

/**
 * Table affichant la liste des souhaits d'une commande avec filtres par statut
 */
export function WishesTableWithFilter({ wishes }: WishesTableWithFilterProps) {
  const [statusFilter, setStatusFilter] = useState<WishStatus | typeof ALL_STATUSES>(ALL_STATUSES);

  // Filter wishes based on selected status
  const filteredWishes = useMemo(() => {
    if (statusFilter === ALL_STATUSES) {
      return wishes;
    }
    return wishes.filter((wish) => wish.status === statusFilter);
  }, [wishes, statusFilter]);

  // Get unique statuses from wishes for the filter dropdown
  const availableStatuses = useMemo(() => {
    const statuses = new Set(wishes.map((wish) => wish.status));
    return Array.from(statuses) as WishStatus[];
  }, [wishes]);

  const handleClearFilter = () => {
    setStatusFilter(ALL_STATUSES);
  };

  if (wishes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Souhaits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun souhait pour cette commande.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Souhaits ({filteredWishes.length}/{wishes.length})</CardTitle>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as WishStatus | typeof ALL_STATUSES)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>Tous les statuts</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {WISH_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusFilter !== ALL_STATUSES && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="text-muted-foreground"
              >
                Effacer
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredWishes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun souhait avec le statut "{WISH_STATUS_LABELS[statusFilter as WishStatus]}".
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Membre</th>
                  <th className="pb-3 font-medium">Jeu</th>
                  <th className="pb-3 font-medium">Référence</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredWishes.map((wish) => (
                  <tr key={wish.id} className="group">
                    <td className="py-4 text-sm">
                      <div>
                        <p className="font-medium">{wish.user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {wish.user.email}
                        </p>
                      </div>
                    </td>
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
                      <WishStatusBadge status={wish.status} />
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
  );
}
