"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BellIcon,
  CheckIcon,
  CheckCheckIcon,
  CreditCardIcon,
  HeartIcon,
  PackageCheckIcon,
  PackageIcon,
  ShoppingCartIcon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "../use-cases/notification.action";
import type { Notification, NotificationType } from "../domain/notification.types";

/**
 * Icône selon le type de notification
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "wish_submitted":
      return HeartIcon;
    case "basket_ready":
      return ShoppingCartIcon;
    case "wish_validated":
      return CheckIcon;
    case "wish_refused":
      return XCircleIcon;
    case "payment_sent":
    case "payment_received":
      return CreditCardIcon;
    case "basket_received":
      return PackageIcon;
    case "pickup_available":
    case "wish_picked_up":
      return PackageCheckIcon;
    default:
      return BellIcon;
  }
}

/**
 * Couleur de l'icône selon le type de notification
 */
function getNotificationColor(type: NotificationType) {
  switch (type) {
    case "wish_validated":
    case "payment_received":
    case "pickup_available":
      return "text-green-600";
    case "wish_refused":
      return "text-red-600";
    case "payment_sent":
      return "text-blue-600";
    default:
      return "text-primary";
  }
}

interface NotificationCenterProps {
  userId: string;
}

/**
 * Centre de notifications dans le header
 */
export function NotificationCenter({ userId }: NotificationCenterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Charger les notifications au montage et quand le dropdown s'ouvre
  useEffect(() => {
    async function loadNotifications() {
      const result = await getNotificationsAction();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    }

    loadNotifications();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // Marquer comme lue si pas déjà lu
    if (!notification.read) {
      startTransition(async () => {
        await markNotificationAsReadAction(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    }

    // Naviguer vers le lien
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="h-auto px-2 py-1 text-xs"
            >
              <CheckCheckIcon className="mr-1 h-3 w-3" />
              Tout lire
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <BellIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Aucune notification
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type as NotificationType);
              const colorClass = getNotificationColor(notification.type as NotificationType);

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex cursor-pointer gap-3 p-3 ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
