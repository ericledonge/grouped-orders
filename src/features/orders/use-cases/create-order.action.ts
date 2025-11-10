"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { orderRepository } from "../domain/order.repository";
import {
  type CreateOrderInput,
  createOrderSchema,
} from "../domain/order.validation";

export async function createOrder(input: CreateOrderInput) {
  try {
    const session = await requireAdmin();

    const validatedData = createOrderSchema.parse(input);

    const orderId = await orderRepository.create({
      type: validatedData.type,
      targetDate: validatedData.targetDate,
      description: validatedData.description,
      createdBy: session.user.id,
    });

    revalidatePath("/admin/orders");

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    console.error("Error creating order:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Erreur lors de la création de la commande",
      ),
    };
  }
}
