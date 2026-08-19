import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// Helper to create a store-like object that satisfies framework internals
const createStoreMock = (getValue: () => any) => {
  const store = {
    get: getValue,
    set: () => {},
    subscribe: (cb: any) => {
      const unsubscribe = () => {};
      (unsubscribe as any).unsubscribe = unsubscribe;
      return unsubscribe;
    },
    get state() { return getValue(); }
  };
  return store;
};

export function getRouter() {
  const isServer = typeof document === 'undefined';
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: isServer ? createMemoryHistory() : undefined as any,
  });

  // Compatibility Layer for TanStack Start v1 / Router v1.170+
  // The framework accesses router.stores.byRoute.get(id).get()
  const injectStores = (target: any) => {
    const getCurrentState = () => {
      try {
        return target.state || { matches: [], location: {} };
      } catch (e) {
        return { matches: [], location: {} };
      }
    };

    const getMatchStore = (routeId: string) => {
      return createStoreMock(() => 
        (getCurrentState().matches || []).find((m: any) => m.routeId === routeId)
      );
    };

    const stores: any = {
      ids: createStoreMock(() => (getCurrentState().matches || []).map((m: any) => m.routeId)),
      matchesId: createStoreMock(() => (getCurrentState().matches || []).map((m: any) => m.id || m.routeId)),
      byRoute: {
        get: (routeId: string) => getMatchStore(routeId),
      },
      matches: createStoreMock(() => getCurrentState().matches || []),
      location: createStoreMock(() => getCurrentState().location || {}),
    };

    // Use a proxy to provide fallback stores for any properties accessed by the framework
    const storesProxy = new Proxy(stores, {
      get(t: any, prop: string) {
        if (prop in t) return t[prop];
        return createStoreMock(() => undefined);
      }
    });

    target.stores = storesProxy;
    target._stores = storesProxy;
    if (target.options) {
      target.options.stores = storesProxy;
    }
  };

  injectStores(router);

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
