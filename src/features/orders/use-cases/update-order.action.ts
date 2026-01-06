"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { orderRepository } from "../domain/order.repository";
import {
  type UpdateOrderInput,
  updateOrderSchema,
} from "../domain/order.validation";

export async function updateOrder(input: UpdateOrderInput) {
  try {
    await requireAdmin();

    const validatedData = updateOrderSchema.parse(input);

    // Vérifier que la commande existe
    const existingOrder = await orderRepository.findById(validatedData.id);
    if (!existingOrder) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    const updatedOrder = await orderRepository.update(validatedData.id, {
      type: validatedData.type,
      targetDate: validatedData.targetDate,
      description: validatedData.description,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${validatedData.id}`);

    return {
      success: true,
      order: updatedOrder,
    };
  } catch (error) {
    console.error("Error updating order:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Erreur lors de la mise à jour de la commande",
      ),
    };
  }
}
