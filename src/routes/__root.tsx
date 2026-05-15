import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "@/providers/ThemeProvider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="neo-surface max-w-md p-10 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page does not exist.</p>
        <Link to="/" className="mt-6 inline-block text-primary underline">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="neo-surface max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="neo-pressable mt-6 inline-flex rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HeadContent />
        <Outlet />
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
