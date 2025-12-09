# Design System - Grouped Order

## Vue d'ensemble

Ce design system suit l'approche **Atomic Design** pour créer une UI modulaire et réutilisable. Il s'appuie sur **Shadcn UI** pour les composants de base et **Tailwind CSS 4** pour le styling.

### Principes de design

1. **Simplicité** : Interface claire et intuitive
2. **Cohérence** : Utilisation uniforme des composants
3. **Accessibilité** : Composants ARIA-compliant
4. **Responsive** : Mobile-first design
5. **Dark mode** : Support natif du thème sombre

---

## Atomic Design - Hiérarchie

```
Atoms (Composants de base)
  └─> Molecules (Combinaisons simples)
       └─> Organisms (Sections complexes)
            └─> Templates (Layouts de pages)
                 └─> Pages (Instances complètes)
```

---

## Palette de couleurs

### Couleurs principales

```css
/* Light mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 221.2 83.2% 53.3%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 221.2 83.2% 53.3%;
--radius: 0.5rem;

/* Dark mode */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 217.2 91.2% 59.8%;
--primary-foreground: 222.2 47.4% 11.2%;
--secondary: 217.2 32.6% 17.5%;
--secondary-foreground: 210 40% 98%;
--muted: 217.2 32.6% 17.5%;
--muted-foreground: 215 20.2% 65.1%;
--accent: 217.2 32.6% 17.5%;
--accent-foreground: 210 40% 98%;
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 210 40% 98%;
--border: 217.2 32.6% 17.5%;
--input: 217.2 32.6% 17.5%;
--ring: 224.3 76.3% 48%;
```

### Couleurs de statut

```typescript
// Statuts de commandes
const orderStatusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

// Statuts de paniers
const basketStatusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  awaiting_validation: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  validated: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  awaiting_customs: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  awaiting_reception: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  awaiting_delivery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  available_pickup: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
};

// Statuts de souhaits
const wishStatusColors = {
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_basket: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  validated: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  refused: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  picked_up: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

// Types de commandes
const orderTypeColors = {
  monthly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  private_sale: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  special: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};
```

---

## Atoms (Composants de base)

### Installation des composants Shadcn

```bash
# Composants de base nécessaires
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add toast
npx shadcn@latest add avatar
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
```

### Composants custom - Atoms

#### PriceDisplay

```typescript
// src/components/atoms/price-display.tsx

import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number | string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showCurrency?: boolean;
}

export function PriceDisplay({
  amount,
  className,
  size = "md",
  showCurrency = true,
}: PriceDisplayProps) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = value.toFixed(2);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  };

  return (
    <span className={cn("font-mono", sizeClasses[size], className)}>
      {formatted}
      {showCurrency && " $"}
    </span>
  );
}
```

#### UserAvatar

```typescript
// src/components/atoms/user-avatar.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ name, image, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={sizeClasses[size]}>
      {image && <AvatarImage src={image} alt={name} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
```

---

## Molecules (Combinaisons de composants)

### StatusBadge

```typescript
// src/components/molecules/status-badge.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EntityType = "order" | "basket" | "wish" | "payment";
type Status = string;

interface StatusBadgeProps {
  type: EntityType;
  status: Status;
  className?: string;
}

const statusConfig = {
  order: {
    open: {
      label: "Ouverte",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    in_progress: {
      label: "En cours",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    completed: {
      label: "Terminée",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
  },
  basket: {
    draft: {
      label: "Brouillon",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    awaiting_validation: {
      label: "Attente validation",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    },
    validated: {
      label: "Validé",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    awaiting_customs: {
      label: "Attente douane",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    awaiting_reception: {
      label: "Attente réception",
      className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    },
    awaiting_delivery: {
      label: "Attente livraison",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    available_pickup: {
      label: "Disponible",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    },
  },
  wish: {
    submitted: {
      label: "Émis",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    in_basket: {
      label: "Dans panier",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    validated: {
      label: "Validé",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    refused: {
      label: "Refusé",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    paid: {
      label: "Payé",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    },
    picked_up: {
      label: "Retiré",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
  },
  payment: {
    pending: {
      label: "En attente",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    sent: {
      label: "Envoyé",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    received: {
      label: "Reçu",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    partial: {
      label: "Partiel",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    },
  },
};

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className={cn(config.className, "border-0", className)}
      data-testid="status-badge"
    >
      {config.label}
    </Badge>
  );
}
```

---

### OrderTypeChip

```typescript
// src/components/molecules/order-type-chip.tsx

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OrderType = "monthly" | "private_sale" | "special";

interface OrderTypeChipProps {
  type: OrderType;
  className?: string;
}

const typeConfig = {
  monthly: {
    label: "Mensuelle",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  private_sale: {
    label: "Vente privée",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  special: {
    label: "Spéciale",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
};

export function OrderTypeChip({ type, className }: OrderTypeChipProps) {
  const config = typeConfig[type];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, "border-0", className)}
      data-testid="order-type-chip"
    >
      {config.label}
    </Badge>
  );
}
```

---

### FormField

```typescript
// src/components/molecules/form-field.tsx

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface BaseFormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type?: "text" | "email" | "password" | "number" | "date" | "url";
  inputProps?: ComponentProps<typeof Input>;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  textareaProps?: ComponentProps<typeof Textarea>;
}

type FormFieldProps =
  | ({ as: "input" } & InputFormFieldProps)
  | ({ as: "textarea" } & TextareaFormFieldProps);

export function FormField(props: FormFieldProps) {
  const { label, error, required, className } = props;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {props.as === "input" ? (
        <Input
          type={props.type || "text"}
          {...props.inputProps}
          className={cn(error && "border-destructive", props.inputProps?.className)}
        />
      ) : (
        <Textarea
          {...props.textareaProps}
          className={cn(error && "border-destructive", props.textareaProps?.className)}
        />
      )}

      {error && <p className="text-sm text-destructive error-message">{error}</p>}
    </div>
  );
}
```

---

### DataTable (réutilisable)

```typescript
// src/components/molecules/data-table.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = "Aucune donnée disponible",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column, index) => (
              <TableCell key={index} className={column.className}>
                {column.cell
                  ? column.cell(item)
                  : column.accessorKey
                  ? String(item[column.accessorKey])
                  : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Organisms (Composants complexes)

### Header

```typescript
// src/components/organisms/header.tsx

import Link from "next/link";
import { UserDropdown } from "./user-dropdown";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "@/features/notifications/use-cases/notification-bell";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const isAdmin = user.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Grouped Order</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Commandes
              </Link>
              <Link
                href="/admin/baskets"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Paniers
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/orders"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Commandes
              </Link>
              <Link
                href="/my-wishes"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Mes souhaits
              </Link>
              <Link
                href="/my-baskets"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Mes paniers
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <ThemeToggle />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
```

---

### UserDropdown

```typescript
// src/components/organisms/user-dropdown.tsx

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/atoms/user-avatar";
import { signOut } from "@/lib/auth/auth-client";
import { LogOut, User } from "lucide-react";

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2">
          <UserAvatar name={user.name} image={user.image} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/account/profile">
            <User className="mr-2 h-4 w-4" />
            Mon compte
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### ThemeToggle

```typescript
// src/components/organisms/theme-toggle.tsx

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Clair</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Sombre</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Système</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Templates (Layouts de pages)

### AdminLayout

```typescript
// src/components/templates/admin-layout.tsx

import { Header } from "@/components/organisms/header";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminLayout({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="container py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>

          <Separator className="mb-6" />

          {/* Page content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
```

---

### MemberLayout

```typescript
// src/components/templates/member-layout.tsx

import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

interface MemberLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function MemberLayout({ children, title, description }: MemberLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="container py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Page content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
```

---

## Exemples d'utilisation

### Page Admin - Liste des commandes

```typescript
// src/app/admin/orders/page.tsx

import { AdminLayout } from "@/components/templates/admin-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { OrderList } from "@/features/orders/use-cases/order-list";

export default function OrdersPage() {
  return (
    <AdminLayout
      title="Commandes"
      description="Gérer les commandes groupées"
      actions={
        <Button asChild>
          <Link href="/admin/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle commande
          </Link>
        </Button>
      }
    >
      <OrderList />
    </AdminLayout>
  );
}
```

---

### Composant OrderList avec DataTable

```typescript
// src/features/orders/use-cases/order-list.tsx

"use client";

import { DataTable } from "@/components/molecules/data-table";
import { StatusBadge } from "@/components/molecules/status-badge";
import { OrderTypeChip } from "@/components/molecules/order-type-chip";
import { Button } from "@/components/ui/button";
import { useOrders } from "../domain/order.repository";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format-date";

export function OrderList() {
  const { data: orders, isLoading } = useOrders();

  return (
    <DataTable
      data={orders || []}
      isLoading={isLoading}
      columns={[
        {
          header: "Type",
          cell: (order) => <OrderTypeChip type={order.type} />,
        },
        {
          header: "Description",
          accessorKey: "description",
        },
        {
          header: "Date cible",
          cell: (order) => formatDate(order.targetDate),
        },
        {
          header: "Statut",
          cell: (order) => <StatusBadge type="order" status={order.status} />,
        },
        {
          header: "Souhaits",
          cell: (order) => order.wishCount,
        },
        {
          header: "Actions",
          cell: (order) => (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/orders/${order.id}`}>Voir</Link>
            </Button>
          ),
        },
      ]}
    />
  );
}
```

---

## Responsive Design

### Breakpoints Tailwind

```typescript
// Breakpoints par défaut de Tailwind CSS
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};
```

### Exemple de composant responsive

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 colonne, Tablet: 2 colonnes, Desktop: 3 colonnes */}
</div>
```

---

## Accessibilité

### Checklist

- [ ] Utiliser des éléments sémantiques HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Ajouter des attributs ARIA quand nécessaire (`aria-label`, `aria-describedby`)
- [ ] Assurer un contraste de couleurs suffisant (WCAG AA)
- [ ] Support clavier complet (navigation, focus visible)
- [ ] Messages d'erreur associés aux inputs (`aria-invalid`, `aria-describedby`)
- [ ] Textes alternatifs pour les images
- [ ] Labels pour tous les inputs de formulaire

---

## Animations et transitions

### Classes Tailwind utiles

```css
/* Transitions douces */
.transition-all
.transition-colors
.duration-200
.ease-in-out

/* Hover states */
.hover:bg-accent
.hover:text-accent-foreground

/* Focus states */
.focus:outline-none
.focus:ring-2
.focus:ring-ring
.focus:ring-offset-2
```

---

## Icônes

### Lucide React

```bash
npm install lucide-react
```

### Icônes utilisées

```typescript
import {
  Plus,
  Edit,
  Trash,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Calendar,
  User,
  LogOut,
  Bell,
  Menu,
  Sun,
  Moon,
  Package,
  ShoppingCart,
  DollarSign,
  MapPin,
  Home,
} from "lucide-react";
```

---

## Prochaines étapes

Consulter les autres fichiers de documentation :
- [BACKLOG.md](./BACKLOG.md) - User stories et planning
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- [DOMAIN.md](./DOMAIN.md) - Règles métier
- [TESTING.md](./TESTING.md) - Stratégie de tests
