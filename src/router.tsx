import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Critical fix: matchRoutesLightweight in @tanstack/router-core crashes if router.stores is missing.
  // It is initialized in this.update(), but HMR/SSR entry points often bypass the full lifecycle.
  if (!(router as any).stores) {
    const isServer = typeof document === 'undefined';
    
    // Minimal mock of the store structure required by matchRoutesLightweight
    const mockStore = (getValue: () => any) => ({
      get: getValue,
      set: () => {},
      subscribe: () => () => {},
    });

    (router as any).stores = {
      ids: mockStore(() => (router.state?.matches || []).map((m: any) => m.routeId)),
      byRoute: {
        get: (routeId: string) => mockStore(() => (router.state?.matches || []).find((m: any) => m.routeId === routeId))
      },
      matches: mockStore(() => router.state?.matches || []),
    };
  }

  // Compatibility patch for TanStack Start v1 framework expecting router.getMatchedRoutes 
  // to be destructurable as an object but iterable as an array.
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
