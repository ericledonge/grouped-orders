"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, UserIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { listActiveUsers } from "@/features/users/use-cases/list-users.action";
import {
  type AdminCreateWishInput,
  adminCreateWishSchema,
} from "../domain/wish.validation";
import { adminCreateWish } from "../use-cases/admin-create-wish.action";

interface AdminCreateWishSheetProps {
  orderId: string;
}

type ActiveUser = {
  id: string;
  name: string;
  email: string;
};

export function AdminCreateWishSheet({ orderId }: AdminCreateWishSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const form = useForm<AdminCreateWishInput>({
    resolver: zodResolver(adminCreateWishSchema),
    defaultValues: {
      orderId,
      ownerType: "user",
      userId: "",
      guestName: "",
      gameName: "",
      philibertReference: "",
      philibertUrl: "",
    },
  });

  const ownerType = form.watch("ownerType");

  useEffect(() => {
    if (open && users.length === 0) {
      setIsLoadingUsers(true);
      listActiveUsers()
        .then(setUsers)
        .finally(() => setIsLoadingUsers(false));
    }
  }, [open, users.length]);

  // Reset userId/guestName quand on change de type
  useEffect(() => {
    if (ownerType === "user") {
      form.setValue("guestName", "");
    } else {
      form.setValue("userId", "");
    }
  }, [ownerType, form]);

  const onSubmit = async (data: AdminCreateWishInput) => {
    setIsSubmitting(true);
    try {
      const result = await adminCreateWish(data);

      if (result.success) {
        toast.success("Souhait cree avec succes");
        setOpen(false);
        form.reset({
          orderId,
          ownerType: "user",
          userId: "",
          guestName: "",
          gameName: "",
          philibertReference: "",
          philibertUrl: "",
        });
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          Ajouter un souhait
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ajouter un souhait</SheetTitle>
          <SheetDescription>
            Creer un souhait pour un membre inscrit ou un invite
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            {/* Type de demandeur */}
            <FormField
              control={form.control}
              name="ownerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de demandeur</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>Membre inscrit</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="guest">
                        <div className="flex items-center gap-2">
                          <UserPlusIcon className="h-4 w-4" />
                          <span>Invite (non inscrit)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selection du membre */}
            {ownerType === "user" && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingUsers
                                ? "Chargement..."
                                : "Selectionner un membre"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Le membre pour qui vous creez ce souhait
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Nom de l'invite */}
            {ownerType === "guest" && (
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'invite</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jean Dupont" {...field} />
                    </FormControl>
                    <FormDescription>
                      Le nom de la personne (pourra etre lie a un compte plus
                      tard)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Nom du jeu */}
            <FormField
              control={form.control}
              name="gameName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du jeu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Wingspan, Azul, 7 Wonders..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Philibert */}
            <FormField
              control={form.control}
              name="philibertReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Philibert</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PH3456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL Philibert */}
            <FormField
              control={form.control}
              name="philibertUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Philibert (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://www.philibert.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Boutons */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creation..." : "Creer le souhait"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
