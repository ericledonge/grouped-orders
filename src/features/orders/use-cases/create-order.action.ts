"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { order } from "@/lib/db/schema";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "../domain/order.validation";

export async function createOrder(input: CreateOrderInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Non authentifié",
      };
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Accès refusé : rôle admin requis",
      };
    }

    const validatedData = createOrderSchema.parse(input);

    const [newOrder] = await db
      .insert(order)
      .values({
        type: validatedData.type,
        targetDate: validatedData.targetDate,
        description: validatedData.description,
        createdBy: session.user.id,
        status: "open",
      })
      .returning({ id: order.id });

    revalidatePath("/admin/orders");

    return {
      success: true,
      orderId: newOrder.id,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la commande",
    };
  }
}
