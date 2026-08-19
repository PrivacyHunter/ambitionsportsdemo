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
      status: createStoreMock(() => getCurrentState().status || 'idle'),
      resolvedLocation: createStoreMock(() => getCurrentState().resolvedLocation || getCurrentState().location || {}),
      __store: createStoreMock(() => getCurrentState()),
      // Crucial: setMatches is expected by loadServerRoute and loadClientRoute
      setMatches: (matches: any) => {
        // Many framework internals expect this to update the underlying state
        if (target.update) target.update({ ...target.options });
      }
    };

    // Use a proxy to provide fallback stores for any properties accessed by the framework
    const storesProxy = new Proxy(stores, {
      get(t: any, prop: string) {
        if (prop in t) return t[prop];
        return createStoreMock(() => undefined);
      }
    });

    // Inject into all locations the framework looks
    target.stores = storesProxy;
    target._stores = storesProxy;
    if (target.options) {
      target.options.stores = storesProxy;
    }
  };

  injectStores(router);

  // Wrap the entire router in a Proxy to ensure 'stores' always points to our patch
  const routerProxy = new Proxy(router, {
    get(target: any, prop: string, receiver: any) {
      if (prop === 'stores' || prop === '_stores') {
        return target.stores;
      }
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
  });

  // Patch getMatchedRoutes to satisfy TanStack Start's handleServerRoutes destructuring
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  routerProxy.getMatchedRoutes = (pathname: string) => {
    const result = originalGetMatchedRoutes(pathname) as any;
    
    let matchedRoutes = [], routeParams = {}, foundRoute = null;
    if (Array.isArray(result)) {
      [matchedRoutes, routeParams, foundRoute] = result;
    } else if (result && typeof result === 'object') {
      ({ matchedRoutes, routeParams, foundRoute } = result);
    }
    
    const matched = matchedRoutes || [];
    const params = routeParams || {};
    const found = foundRoute || null;
    
    return {
      matchedRoutes: matched,
      routeParams: params,
      foundRoute: found,
      [Symbol.iterator]: function* () {
        yield matched;
        yield params;
        yield found;
      },
    } as any;
  };

  if (!isServer) {
    (window as any).__TSR__ = { router: routerProxy };
  }

  return routerProxy;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
