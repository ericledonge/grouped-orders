"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type CreateWishInput,
  createWishSchema,
} from "@/features/wishes/domain/wish.validation";
import { createWish } from "@/features/wishes/use-cases/create-wish.action";

interface CreateWishFormProps {
  /** ID de la commande sur laquelle créer le souhait */
  orderId: string;
}

export function CreateWishForm({ orderId }: CreateWishFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateWishInput>({
    resolver: zodResolver(createWishSchema),
    defaultValues: {
      orderId,
      gameName: "",
      philibertReference: "",
      philibertUrl: "",
    },
  });

  const onSubmit = async (data: CreateWishInput) => {
    setIsSubmitting(true);
    try {
      const result = await createWish(data);

      if (result.success) {
        toast.success("Souhait ajouté avec succès");
        router.push("/orders");
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
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un souhait</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormDescription>
                    Le nom exact du jeu de société que vous souhaitez commander
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Référence Philibert */}
            <FormField
              control={form.control}
              name="philibertReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence Philibert</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PH3456789" {...field} />
                  </FormControl>
                  <FormDescription>
                    La référence du produit sur le site Philibert (visible dans
                    l'URL ou la fiche produit)
                  </FormDescription>
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
                  <FormDescription>
                    Le lien direct vers la page du jeu sur Philibert
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Boutons */}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/orders")}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ajout en cours..." : "Ajouter le souhait"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
