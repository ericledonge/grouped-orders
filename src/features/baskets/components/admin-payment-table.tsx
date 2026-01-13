"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  Loader2Icon,
  DollarSignIcon,
} from "lucide-react";
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
import { PaymentStatusBadge } from "./payment-status-badge";
import {
  confirmPaymentReceivedAction,
  recordPartialPaymentAction,
} from "../use-cases/confirm-payment.action";

interface MemberPayment {
  user: {
    id: string;
    name: string;
    email: string;
  };
  wishes: Array<{
    id: string;
    gameName: string;
    amountDue: string | null;
    amountPaid: string | null;
    paymentStatus: string | null;
  }>;
  totalDue: number;
  totalPaid: number;
  paymentStatus: "pending" | "sent" | "received" | "partial" | "mixed";
}

interface AdminPaymentTableProps {
  basketId: string;
  memberPayments: MemberPayment[];
}

/**
 * Table de gestion des paiements pour l'admin
 */
export function AdminPaymentTable({
  basketId,
  memberPayments,
}: AdminPaymentTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [partialDialogOpen, setPartialDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberPayment | null>(null);

  const handleConfirmPayment = async (userId: string) => {
    setProcessingUserId(userId);
    startTransition(async () => {
      const result = await confirmPaymentReceivedAction(basketId, userId);

      if (result.success) {
        toast.success("Paiement confirmé");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
      setProcessingUserId(null);
    });
  };

  const handlePartialPayment = async () => {
    if (!selectedMember) return;

    const amount = Number.parseFloat(partialAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Montant invalide");
      return;
    }

    setProcessingUserId(selectedMember.user.id);
    startTransition(async () => {
      const result = await recordPartialPaymentAction(
        basketId,
        selectedMember.user.id,
        amount,
      );

      if (result.success) {
        toast.success("Paiement partiel enregistré");
        router.refresh();
        setPartialDialogOpen(false);
        setPartialAmount("");
        setSelectedMember(null);
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
      setProcessingUserId(null);
    });
  };

  const openPartialDialog = (member: MemberPayment) => {
    setSelectedMember(member);
    setPartialAmount("");
    setPartialDialogOpen(true);
  };

  // Filtrer pour ne montrer que les membres avec paiements envoyés ou partiels
  const pendingPayments = memberPayments.filter(
    (m) => m.paymentStatus === "sent" || m.paymentStatus === "partial",
  );
  const completedPayments = memberPayments.filter(
    (m) => m.paymentStatus === "received",
  );
  const waitingPayments = memberPayments.filter(
    (m) => m.paymentStatus === "pending" || m.paymentStatus === "mixed",
  );

  return (
    <div className="space-y-6">
      {/* Paiements à traiter */}
      {pendingPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            Paiements à traiter ({pendingPayments.length})
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Membre</th>
                  <th className="text-left p-3 font-medium">Souhaits</th>
                  <th className="text-right p-3 font-medium">Montant dû</th>
                  <th className="text-right p-3 font-medium">Montant payé</th>
                  <th className="text-center p-3 font-medium">Statut</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingPayments.map((member) => (
                  <tr key={member.user.id}>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {member.wishes.length} jeu{member.wishes.length > 1 ? "x" : ""}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {member.totalDue.toFixed(2)} €
                    </td>
                    <td className="p-3 text-right">
                      {member.totalPaid.toFixed(2)} €
                    </td>
                    <td className="p-3 text-center">
                      <PaymentStatusBadge status={member.paymentStatus} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              disabled={isPending && processingUserId === member.user.id}
                            >
                              {isPending && processingUserId === member.user.id ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                              )}
                              Reçu
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmer la réception du paiement
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Vous confirmez avoir reçu{" "}
                                <strong>{member.totalDue.toFixed(2)} €</strong> de{" "}
                                <strong>{member.user.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleConfirmPayment(member.user.id)}
                              >
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPartialDialog(member)}
                          disabled={isPending}
                        >
                          <DollarSignIcon className="h-4 w-4 mr-1" />
                          Partiel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paiements reçus */}
      {completedPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            Paiements reçus ({completedPayments.length})
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Membre</th>
                  <th className="text-left p-3 font-medium">Souhaits</th>
                  <th className="text-right p-3 font-medium">Montant</th>
                  <th className="text-center p-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completedPayments.map((member) => (
                  <tr key={member.user.id}>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {member.wishes.length} jeu{member.wishes.length > 1 ? "x" : ""}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {member.totalPaid.toFixed(2)} €
                    </td>
                    <td className="p-3 text-center">
                      <PaymentStatusBadge status="received" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* En attente */}
      {waitingPayments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            En attente ({waitingPayments.length})
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Membre</th>
                  <th className="text-left p-3 font-medium">Souhaits</th>
                  <th className="text-right p-3 font-medium">Montant dû</th>
                  <th className="text-center p-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {waitingPayments.map((member) => (
                  <tr key={member.user.id} className="opacity-60">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {member.wishes.length} jeu{member.wishes.length > 1 ? "x" : ""}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {member.totalDue.toFixed(2)} €
                    </td>
                    <td className="p-3 text-center">
                      <PaymentStatusBadge status={member.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog paiement partiel */}
      {partialDialogOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Paiement partiel</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enregistrer un paiement partiel pour{" "}
              <strong>{selectedMember.user.name}</strong>.
              <br />
              Montant dû : <strong>{selectedMember.totalDue.toFixed(2)} €</strong>
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="partialAmount">Montant reçu (€)</Label>
                <Input
                  id="partialAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedMember.totalDue}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPartialDialogOpen(false);
                    setSelectedMember(null);
                    setPartialAmount("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handlePartialPayment}
                  disabled={isPending || !partialAmount}
                >
                  {isPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
