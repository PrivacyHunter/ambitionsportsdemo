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

  router.getMatchedRoutes = (pathname: string) => {
    const result = originalGetMatchedRoutes(pathname);
    
    if (Array.isArray(result)) {
      const [matchedRoutes, routeParams, foundRoute] = result;
      
      const obj = {
        matchedRoutes,
        routeParams,
        foundRoute,
        [Symbol.iterator]: function* () {
          yield matchedRoutes;
          yield routeParams;
          yield foundRoute;
        },
      };

      return obj as any;
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
