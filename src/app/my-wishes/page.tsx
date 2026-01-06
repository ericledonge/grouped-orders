import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MyWishesTable } from "@/features/wishes/components/my-wishes-table";
import { wishRepository } from "@/features/wishes/domain/wish.repository";
import { requireMember } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Mes souhaits - Grouped Order",
  description: "Suivez vos souhaits de jeux",
};

export default async function MyWishesPage() {
  const session = await requireMember();
  const wishes = await wishRepository.findByUserIdWithOrder(session.user.id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes souhaits</h1>
          <p className="text-muted-foreground">
            Suivez l'avancement de vos souhaits de jeux
          </p>
        </div>
        <Button asChild>
          <Link href="/orders">Voir les commandes</Link>
        </Button>
      </div>

      <MyWishesTable wishes={wishes} />
    </div>
  );
}
