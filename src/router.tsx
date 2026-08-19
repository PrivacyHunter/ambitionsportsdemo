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

  // Force initialization of stores and internal state if missing
  if (!(router as any).stores) {
    try {
      router.update(router.options);
    } catch (e) {
      console.error('[Router] Failed to force update:', e);
    }
  }

  // Double-check and provide a fallback if still missing (compatibility with some Start versions)
  if (!(router as any).stores) {
    console.warn('[Router Patch] router.stores is STILL missing after update, initializing manual fallback...');
    
    const mockStore = (getValue: () => any) => ({
      get: getValue,
      set: () => {},
      subscribe: () => () => {},
    });

    // Provide a minimal state that doesn't rely on stores to avoid recursion
    const initialState = {
      status: 'idle',
      matches: [],
      location: (router as any).latestLocation || { pathname: '/', search: {}, hash: '', state: {} },
    };

    // Override the state getter to prevent recursion while initializing stores
    Object.defineProperty(router, 'state', {
      get: () => initialState,
      configurable: true,
      enumerable: true,
    });

    (router as any).stores = {
      ids: mockStore(() => (router.state?.matches || []).map((m: any) => m.routeId)),
      byRoute: {
        get: (routeId: string) => mockStore(() => (router.state?.matches || []).find((m: any) => m.routeId === routeId))
      },
      matches: mockStore(() => router.state?.matches || []),
      __store: mockStore(() => router.state),
    };
  }

  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);

  router.getMatchedRoutes = (pathname: string) => {
    try {
      const result = originalGetMatchedRoutes(pathname);
      
      if (Array.isArray(result)) {
        const [matchedRoutes, routeParams, foundRoute] = result;
        
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
      }

      if (result && typeof result === 'object') {
         if (!(Symbol.iterator in result)) {
           (result as any)[Symbol.iterator] = function* () {
              yield (result as any).matchedRoutes || [];
              yield (result as any).routeParams || {};
              yield (result as any).foundRoute || null;
           };
         }
         return result;
      }

      return result;
    } catch (e) {
      const emptyResult = {
        matchedRoutes: [],
        routeParams: {},
        foundRoute: null,
        [Symbol.iterator]: function* () {
          yield [];
          yield {};
          yield null;
        }
      };
      return emptyResult as any;
    }
  };

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
