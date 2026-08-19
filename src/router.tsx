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

  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);

  // Re-applying the patch that previously fixed the 500s in this environment
  // Ensuring it returns the exact shape expected by the framework.
  router.getMatchedRoutes = (pathname: string) => {
    const result = originalGetMatchedRoutes(pathname);
    
    if (Array.isArray(result)) {
      const [matchedRoutes, routeParams, foundRoute] = result;
      
      const obj = {
        matchedRoutes,
        routeParams,
        foundRoute,
      };

      // Add iterator support to the WHOLE object so [a, b, c] = getMatchedRoutes() works
      const iterableObj = Object.assign(obj, {
        [Symbol.iterator]: function* () {
          yield matchedRoutes;
          yield routeParams;
          yield foundRoute;
        },
      });

      // Also ensure it looks like an array to any Array.isArray checks
      // (though destructuring usually just needs the iterator)
      return iterableObj as any;
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
