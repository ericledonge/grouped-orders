import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container mx-auto p-6 flex grow flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Grouped Order</h1>
        <p className="mt-2 text-muted-foreground">
          Commandes groupées Philibert
        </p>
      </div>
      <AuthView
        path={path}
        classNames={{
          base: "w-full max-w-md",
        }}
      />
    </main>
  );
}
