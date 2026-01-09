import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WishStatusBadge } from "./wish-badges";

interface WishWithUser {
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
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface WishesTableProps {
  wishes: WishWithUser[];
}

/**
 * Table affichant la liste des souhaits d'une commande
 */
export function WishesTable({ wishes }: WishesTableProps) {
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
        <CardTitle>Souhaits ({wishes.length})</CardTitle>
      </CardHeader>
      <CardContent>
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
              {wishes.map((wish) => (
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
      </CardContent>
    </Card>
  );
}
