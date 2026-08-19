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
    // Provide a safe default state
    const defaultState = {
      status: 'idle',
      matches: [],
      location: { pathname: '/', search: {}, hash: '', state: {} },
      redirect: null,
    };

    const getCurrentState = () => {
      try {
        // Accessing target.state might trigger store initialization which might fail
        // So we look at the raw stores if they exist, or fall back to default
        if (target._state) return target._state;
        return defaultState;
      } catch (e) {
        return defaultState;
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
      setMatches: (matches: any) => {
        if (target.update) target.update({ ...target.options });
      }
    };

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

    // Ensure target.state is always defined and stable
    Object.defineProperty(target, 'state', {
      get() { return getCurrentState(); },
      configurable: true
    });
  };

  injectStores(router);

  // Patch getMatchedRoutes to satisfy TanStack Start's handleServerRoutes destructuring
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  router.getMatchedRoutes = (pathname: string) => {
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
    (window as any).__TSR__ = { router };
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
