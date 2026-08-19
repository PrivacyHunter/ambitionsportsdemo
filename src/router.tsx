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

  // Compatibility patch for TanStack Start v1 framework expecting router.stores
  (router as any).stores = {
    matches: {
      get: () => {
        try {
          return router.state.matches || [];
        } catch (e) {
          return [];
        }
      },
    },
  };

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
      console.error('Error in getMatchedRoutes patch:', e);
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
