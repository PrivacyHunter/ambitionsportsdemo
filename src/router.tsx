import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

// Monkey-patch to fix potential undefined errors in SSR/HMR
if (typeof window === 'undefined') {
  // @ts-ignore
  globalThis.__TSR__ = globalThis.__TSR__ || {};
}

export function getRouter() {
  const isServer = typeof document === 'undefined';
  
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: isServer ? createMemoryHistory() : undefined as any,
  });

  // Ensure router stores are initialized
  if (!router.stores) {
    (router as any).stores = {
      state: {
        subscribe: () => () => {},
        get: () => ({
          status: 'idle',
          resolvedData: {},
          error: null,
          isFetching: false,
          isLoading: false,
        })
      }
    };
  }

  if (!isServer) {
    (window as any).__TSR__ = { router };
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
