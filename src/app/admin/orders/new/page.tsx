import { CreateOrderForm } from "@/features/orders/use-cases/create-order-form";

export default function NewOrderPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <CreateOrderForm />
    </div>
  );
}
