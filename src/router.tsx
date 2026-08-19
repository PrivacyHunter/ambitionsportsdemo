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

  // Initialize router state for SSR
  if (isServer) {
    try {
      router.update({
        ...router.options,
      });
    } catch (e) {
      // Ignore initial update errors
    }
  }

  // Ensure 'stores' exist for framework compatibility
  if (!(router as any).stores) {
    const mockStore = (getValue: () => any) => ({
      get: getValue,
      set: () => {},
      subscribe: () => () => {},
    });

    const initialState = {
      status: 'idle',
      matches: [],
      location: (router as any).latestLocation || { pathname: '/', search: {}, hash: '', state: {} },
    };

    if (!Object.getOwnPropertyDescriptor(router, 'state')) {
      Object.defineProperty(router, 'state', {
        get: () => (router as any)._state || initialState,
        configurable: true,
        enumerable: true,
      });
    }

    const stores = {
      ids: mockStore(() => (router.state?.matches || []).map((m: any) => m.routeId)),
      byRoute: {
        get: (routeId: string) => mockStore(() => (router.state?.matches || []).find((m: any) => m.routeId === routeId))
      },
      matches: mockStore(() => router.state?.matches || []),
      __store: mockStore(() => router.state),
    };
    (router as any).stores = stores;
    (router as any)._stores = stores;
  }

  // Framework compatibility patch for getMatchedRoutes
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);

  router.getMatchedRoutes = (pathname: string) => {
    try {
      const result = originalGetMatchedRoutes(pathname) as any;
      
      let matchedRoutes: any[] = [];
      let routeParams: Record<string, any> = {};
      let foundRoute: any = null;

      if (Array.isArray(result)) {
        [matchedRoutes, routeParams, foundRoute] = result;
      } else if (result && typeof result === 'object') {
        matchedRoutes = result.matchedRoutes || [];
        routeParams = result.routeParams || {};
        foundRoute = result.foundRoute || null;
      }

      const patched = {
        matchedRoutes: matchedRoutes || [],
        routeParams: routeParams || {},
        foundRoute: foundRoute || null,
        [Symbol.iterator]: function* () {
          yield matchedRoutes || [];
          yield routeParams || {};
          yield foundRoute || null;
        },
      };
      
      return patched as any;
    } catch (e) {
      return {
        matchedRoutes: [],
        routeParams: {},
        foundRoute: null,
        [Symbol.iterator]: function* () {
          yield [];
          yield {};
          yield null;
        }
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
