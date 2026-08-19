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

  // Framework compatibility layer for TanStack Start v1
  // Injects internal stores and mocks required for early hydration/SSR
  const injectMockStores = (target: any) => {
    if (target && !target.stores) {
      const mockStore = (getValue: () => any) => {
        const s = {
          get: getValue,
          set: () => {},
          subscribe: () => () => {},
          state: getValue(),
        };
        (s as any).get = s.get;
        return s;
      };

      const getCurrentState = () => {
        try {
          return target.state || {
            status: 'idle',
            matches: [],
            location: { pathname: '/', search: {}, hash: '', state: {} },
          };
        } catch {
          return {
            status: 'idle',
            matches: [],
            location: { pathname: '/', search: {}, hash: '', state: {} },
          };
        }
      };

      const stores = {
        ids: mockStore(() => (getCurrentState().matches || []).map((m: any) => m.routeId)),
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

  // Only inject if stores are missing (prevents recursive or early access issues)
  injectMockStores(router);

  // Patch getMatchedRoutes to handle different destructuring patterns in TanStack versions
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
