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

  // Patch getMatchedRoutes to return an object instead of an array
  // This satisfies @tanstack/start-server-core's expectation in dev mode
  router.getMatchedRoutes = (pathname: string) => {
    const [matchedRoutes, routeParams, foundRoute] = originalGetMatchedRoutes(pathname);
    
    if (typeof window === "undefined") {
      console.log(`[SSR Debug] Patched getMatchedRoutes for: ${pathname}`);
      console.log(`[SSR Debug] Found ${matchedRoutes?.length || 0} matched routes`);
    }

    // Return the object shape expected by Start's createStartHandler
    return {
      matchedRoutes,
      routeParams,
      foundRoute,
      // Also maintain array-like access if needed by other internal callers
      [Symbol.iterator]: function* () {
        yield matchedRoutes;
        yield routeParams;
        yield foundRoute;
      }
    } as any;
  };

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
