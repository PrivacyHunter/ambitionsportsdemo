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

  // Only patch if we are in a server/dev environment where the framework expectation mismatch occurs
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);

  router.getMatchedRoutes = (pathname: string) => {
    const result = originalGetMatchedRoutes(pathname);
    
    // If it's already an array, check if we need to wrap it for destructuring compatibility
    if (Array.isArray(result)) {
      const [matchedRoutes, routeParams, foundRoute] = result;
      
      const obj = {
        matchedRoutes,
        routeParams,
        foundRoute,
      };

      // Add iterator support to the object so [a, b, c] = getMatchedRoutes() works
      return Object.assign(obj, {
        [Symbol.iterator]: function* () {
          yield matchedRoutes;
          yield routeParams;
          yield foundRoute;
        },
      }) as any;
    }

    return result;
  };

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
