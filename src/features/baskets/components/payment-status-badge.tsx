import type { ComponentProps } from "react";

type PaymentStatus = "pending" | "sent" | "received" | "partial" | "mixed";

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: string }
> = {
  pending: {
    label: "En attente",
    variant: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  sent: {
    label: "Envoyé",
    variant: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  received: {
    label: "Reçu",
    variant: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  partial: {
    label: "Partiel",
    variant: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  mixed: {
    label: "Mixte",
    variant: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
};

interface PaymentStatusBadgeProps extends ComponentProps<"span"> {
  status: PaymentStatus;
}

export function PaymentStatusBadge({
  status,
  className = "",
  ...props
}: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.variant} ${className}`}
      {...props}
    >
      {config.label}
    </span>
  );
}
