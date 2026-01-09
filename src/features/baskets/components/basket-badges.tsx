import { BASKET_STATUS_LABELS } from "@/features/baskets/domain/basket.labels";
import { cn } from "@/lib/utils";

type BasketStatus = keyof typeof BASKET_STATUS_LABELS;

interface BasketStatusBadgeProps {
  status: BasketStatus;
  className?: string;
}

/**
 * Badge coloré pour afficher le statut d'un panier
 */
export function BasketStatusBadge({
  status,
  className,
}: BasketStatusBadgeProps) {
  const colorClasses: Record<BasketStatus, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    awaiting_validation:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    validated:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    awaiting_customs:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    awaiting_reception:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    awaiting_delivery:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    available_pickup:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[status],
        className,
      )}
    >
      {BASKET_STATUS_LABELS[status]}
    </span>
  );
}
