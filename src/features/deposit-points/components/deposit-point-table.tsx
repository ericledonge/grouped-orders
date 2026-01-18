"use client";

import {
  Loader2Icon,
  MapPinIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DepositPoint } from "../domain/deposit-point.types";
import {
  deleteDepositPointAction,
  setDefaultDepositPointAction,
  updateDepositPointAction,
} from "../use-cases/deposit-point.action";

interface DepositPointTableProps {
  depositPoints: DepositPoint[];
}

/**
 * Table de gestion des points de dépôt
 */
export function DepositPointTable({ depositPoints }: DepositPointTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<DepositPoint | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const handleSetDefault = async (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const result = await setDefaultDepositPointAction(id);
      if (result.success) {
        toast.success("Point de dépôt défini par défaut");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
      setProcessingId(null);
    });
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const result = await deleteDepositPointAction(id);
      if (result.success) {
        toast.success("Point de dépôt supprimé");
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
      setProcessingId(null);
    });
  };

  const openEditDialog = (point: DepositPoint) => {
    setEditingPoint(point);
    setEditName(point.name);
    setEditAddress(point.address);
  };

  const handleUpdate = async () => {
    if (!editingPoint) return;

    const formData = new FormData();
    formData.set("name", editName);
    formData.set("address", editAddress);

    setProcessingId(editingPoint.id);
    startTransition(async () => {
      const result = await updateDepositPointAction(
        editingPoint.id,
        { success: false },
        formData,
      );
      if (result.success) {
        toast.success("Point de dépôt mis à jour");
        setEditingPoint(null);
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
      setProcessingId(null);
    });
  };

  if (depositPoints.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Aucun point de dépôt configuré</p>
        <p className="text-sm">Créez votre premier point de dépôt ci-dessus</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Nom</th>
              <th className="text-left p-3 font-medium">Adresse</th>
              <th className="text-center p-3 font-medium">Par défaut</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {depositPoints.map((point) => (
              <tr key={point.id}>
                <td className="p-3 font-medium">{point.name}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {point.address}
                </td>
                <td className="p-3 text-center">
                  {point.isDefault ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <StarIcon className="h-3 w-3" />
                      Par défaut
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(point.id)}
                      disabled={isPending}
                    >
                      {isPending && processingId === point.id ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        "Définir par défaut"
                      )}
                    </Button>
                  )}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(point)}
                      disabled={isPending}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending || point.isDefault}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer ce point de dépôt ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            <strong>{point.name}</strong> ?
                            <br />
                            Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(point.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog d'édition */}
      {editingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Modifier le point de dépôt
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Nom</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editAddress">Adresse</Label>
                <Input
                  id="editAddress"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingPoint(null)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isPending || !editName || !editAddress}
                >
                  {isPending && processingId === editingPoint.id ? (
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
