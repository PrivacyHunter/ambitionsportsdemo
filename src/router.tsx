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

  // Debugging matches
  if (typeof window === "undefined") {
    console.log("Router created in SSR");
    console.log("Route Tree keys:", Object.keys(router.routeTree.children || {}));
    const matches = router.getMatchedRoutes("/");
    console.log("Matches for '/':", matches ? Object.keys(matches) : "null");
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
