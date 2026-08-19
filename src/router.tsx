import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();
  const isServer = typeof document === 'undefined';

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

  // Robust framework compatibility layer for TanStack Start v1
  const injectMockStores = (target: any) => {
    if (!target) return;
    
    // Define a safe state getter that provides structure before the framework initializes its stores
    const getCurrentState = () => {
      try {
        const s = (target as any)._state || (target as any).state;
        if (s) return s;
      } catch (e) {}
      
      return {
        status: 'idle',
        matches: [],
        location: (target as any).latestLocation || { pathname: '/', search: {}, hash: '', state: {} },
      };
    };

    if (!target.stores) {
      const mockStore = (getValue: () => any) => {
        const s = {
          get: getValue,
          set: () => {},
          subscribe: () => () => {},
          // Define as a getter to ensure it always returns fresh state
          get state() { return getValue(); }
        };
        // Framework internals often call store.get() directly
        (s as any).get = s.get;
        return s;
      };

      const stores: any = {
        ids: mockStore(() => (getCurrentState().matches || []).map((m: any) => m.routeId)),
        matchesId: mockStore(() => (getCurrentState().matches || []).map((m: any) => m.id || m.routeId)),
        byRoute: {
          get: (routeId: string) => {
            const store = mockStore(() => (getCurrentState().matches || []).find((m: any) => m.routeId === routeId));
            (store as any).get = store.get;
            return store;
          }
        },
        matches: mockStore(() => getCurrentState().matches || []),
        location: mockStore(() => getCurrentState().location || { pathname: '/', search: {}, hash: '', state: {} }),
        status: mockStore(() => getCurrentState().status || 'idle'),
        __store: mockStore(() => getCurrentState()),
      };

      target.stores = stores;
      target._stores = stores;
      if (target.options) {
        target.options.stores = stores;
      }
    }
  };

  injectMockStores(router);

  // Patch getMatchedRoutes to satisfy TanStack Start's internal destructuring requirements
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  router.getMatchedRoutes = (pathname: string) => {
    try {
      const result = originalGetMatchedRoutes(pathname) as any;
      let matchedRoutes = [], routeParams = {}, foundRoute = null;
      
      if (Array.isArray(result)) {
        [matchedRoutes, routeParams, foundRoute] = result;
      } else if (result && typeof result === 'object') {
        ({ matchedRoutes = [], routeParams = {}, foundRoute = null } = result);
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
    } catch (e) {
      return {
        matchedRoutes: [], routeParams: {}, foundRoute: null,
        [Symbol.iterator]: function* () { yield []; yield {}; yield null; }
      } as any;
    }
  };

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
