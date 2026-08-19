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

  if (isServer) {
    try {
      router.update({ ...router.options });
    } catch (e) {}
  }

  // Robust framework compatibility layer
  if (!(router as any).stores) {
    const mockStore = (getValue: () => any) => {
      const s = {
        get: getValue,
        set: () => {},
        subscribe: () => () => {},
        state: getValue(), // Support direct .state access if used by internal stores
      };
      return s;
    };

    const initialState = {
      status: 'idle',
      matches: [],
      location: (router as any).latestLocation || { pathname: '/', search: {}, hash: '', state: {} },
    };

    // Safely define the state property to avoid 'undefined' reads during hydration
    if (!Object.getOwnPropertyDescriptor(router, 'state')) {
      Object.defineProperty(router, 'state', {
        get: () => (router as any)._state || (router as any).state || initialState,
        configurable: true,
        enumerable: true,
      });
    }

    const stores = {
      ids: mockStore(() => (router.state?.matches || []).map((m: any) => m.routeId)),
      byRoute: {
        get: (routeId: string) => {
           const store = mockStore(() => (router.state?.matches || []).find((m: any) => m.routeId === routeId));
           // Framework internals might call store.get() on the result of byRoute.get(routeId)
           (store as any).get = store.get;
           return store;
        }
      },
      matches: mockStore(() => router.state?.matches || []),
      __store: mockStore(() => router.state),
    };

    (router as any).stores = stores;
    (router as any)._stores = stores;
    (router as any).options.stores = stores;
  }

  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  router.getMatchedRoutes = (pathname: string) => {
    try {
      const result = originalGetMatchedRoutes(pathname) as any;
      let matchedRoutes = [], routeParams = {}, foundRoute = null;
      if (Array.isArray(result)) [matchedRoutes, routeParams, foundRoute] = result;
      else if (result && typeof result === 'object') {
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
