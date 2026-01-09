import { WISH_STATUS_LABELS } from "@/features/wishes/domain/wish.labels";
import { cn } from "@/lib/utils";

type WishStatus = keyof typeof WISH_STATUS_LABELS;

interface WishStatusBadgeProps {
  status: WishStatus;
  className?: string;
}

/**
 * Badge coloré pour afficher le statut d'un souhait
 */
export function WishStatusBadge({ status, className }: WishStatusBadgeProps) {
  const colorClasses: Record<WishStatus, string> = {
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    in_basket:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    validated:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    refused: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    picked_up: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[status],
        className,
      )}
    >
      {WISH_STATUS_LABELS[status]}
    </span>
  );
}
