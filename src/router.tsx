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
      unsubscribe.unsubscribe = unsubscribe;
      return unsubscribe;
    },
    get state() { return getValue(); }
  };
  // Explicitly assign for destructuring or late-binding environments
  (store as any).get = store.get;
  return store;
};

export function getRouter() {
  const isServer = typeof document === 'undefined';
  console.log("[Router] getRouter starting, isServer:", isServer);

  const queryClient = new QueryClient();

  const routerOptions: any = {
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  };

  if (isServer) {
    routerOptions.history = createMemoryHistory();
  }

  const router = createTanStackRouter(routerOptions);
  console.log("[Router] instance created");

  // Compatibility Layer for TanStack Start v1 / Router v1.170+
  const injectStores = (target: any) => {
    const getCurrentState = () => {
      try {
        const s = target.state;
        if (s) return s;
      } catch (e) {}
      return {
        status: 'idle',
        matches: [],
        location: target.latestLocation || { pathname: '/', search: {}, hash: '', state: {} },
      };
    };

    const getMatchStore = (routeId: string) => {
      const matchStore = createStoreMock(() => 
        (getCurrentState().matches || []).find((m: any) => m.routeId === routeId)
      );
      return matchStore;
    };

    const stores = {
      ids: createStoreMock(() => (getCurrentState().matches || []).map((m: any) => m.routeId)),
      matchesId: createStoreMock(() => (getCurrentState().matches || []).map((m: any) => m.id || m.routeId)),
      byRoute: {
        get: (routeId: string) => getMatchStore(routeId),
      },
      matches: createStoreMock(() => getCurrentState().matches || []),
      location: createStoreMock(() => getCurrentState().location || { pathname: '/', search: {}, hash: '', state: {} }),
      status: createStoreMock(() => getCurrentState().status || 'idle'),
      resolvedLocation: createStoreMock(() => getCurrentState().resolvedLocation || getCurrentState().location),
      __store: createStoreMock(() => getCurrentState()),
      getMatchStore: (routeId: string) => getMatchStore(routeId),
      setMatches: (matches: any) => {
        if (target.update) target.update({ ...target.options });
      }
    };

    // Use a trap to provide fallback stores for any properties accessed by future framework versions
    const storesProxy = new Proxy(stores, {
      get(t: any, prop: string) {
        if (prop in t) return t[prop];
        console.warn(`[Router] Accessing missing store: ${prop}`);
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

  // Patch getMatchedRoutes to return both array and object shapes
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  router.getMatchedRoutes = (pathname: string) => {
    try {
      const result = originalGetMatchedRoutes(pathname) as any;
      let matchedRoutes = [], routeParams = {}, foundRoute = null;
      if (Array.isArray(result)) [matchedRoutes, routeParams, foundRoute] = result;
      else if (result && typeof result === 'object') ({ matchedRoutes, routeParams, foundRoute } = result);
      
      const matched = matchedRoutes || [];
      const params = routeParams || {};
      const found = foundRoute || null;
      
      const hybridResult = {
        matchedRoutes: matched,
        routeParams: params,
        foundRoute: found,
        [Symbol.iterator]: function* () {
          yield matched; yield params; yield found;
        },
      } as any;
      
      return hybridResult;
    } catch (e) {
      return {
        matchedRoutes: [], routeParams: {}, foundRoute: null,
        [Symbol.iterator]: function* () { yield []; yield {}; yield null; }
      } as any;
    }
  };

  if (!isServer) {
    console.log("[Router] Attaching to window.__TSR__");
    (window as any).__TSR__ = { router };
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
