import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
} from "@/features/orders/domain/order.labels";
import type {
  OrderStatus,
  OrderType,
} from "@/features/orders/domain/order.types";
import { cn } from "@/lib/utils";

interface BadgeProps {
  className?: string;
}

interface OrderTypeBadgeProps extends BadgeProps {
  type: OrderType;
}

interface OrderStatusBadgeProps extends BadgeProps {
  status: OrderStatus;
}

/**
 * Badge coloré pour afficher le type de commande
 */
export function OrderTypeBadge({ type, className }: OrderTypeBadgeProps) {
  const colorClasses = {
    monthly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    private_sale:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    special:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[type],
        className,
      )}
    >
      {ORDER_TYPE_LABELS[type]}
    </span>
  );
}

/**
 * Badge coloré pour afficher le statut de commande
 */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const colorClasses = {
    open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    in_progress:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
