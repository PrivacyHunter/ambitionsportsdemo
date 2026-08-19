import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const isServer = typeof document === 'undefined';
  console.log("[Router] getRouter starting, isServer:", isServer);

  const queryClient = new QueryClient();

  // Robust framework compatibility layer for TanStack Start v1
  const createMockStores = (target: any) => {
    const mockStore = (name: string, getValue: () => any) => {
      const s = {
        get: () => getValue(),
        set: () => {},
        subscribe: (cb: any) => {
          const unsub = () => {};
          (unsub as any).unsubscribe = unsub;
          return unsub as any;
        },
        get state() { return getValue(); }
      };
      (s as any).get = s.get;
      return s;
    };

    const getCurrentState = () => {
      try {
        const s = target._state || target.state;
        if (s) return s;
      } catch (e) {}
      return {
        status: 'idle',
        matches: [],
        location: target.latestLocation || { pathname: '/', search: {}, hash: '', state: {} },
      };
    };

    const getMatchStore = (routeId: string) => {
      const store = mockStore(`match.${routeId}`, () => (getCurrentState().matches || []).find((m: any) => m.routeId === routeId));
      return store;
    };

    const stores = {
      ids: mockStore('ids', () => (getCurrentState().matches || []).map((m: any) => m.routeId)),
      matchesId: mockStore('matchesId', () => (getCurrentState().matches || []).map((m: any) => m.id || m.routeId)),
      byRoute: {
        get: (routeId: string) => getMatchStore(routeId)
      },
      matches: mockStore('matches', () => getCurrentState().matches || []),
      location: mockStore('location', () => getCurrentState().location || { pathname: '/', search: {}, hash: '', state: {} }),
      status: mockStore('status', () => getCurrentState().status || 'idle'),
      resolvedLocation: mockStore('resolvedLocation', () => getCurrentState().resolvedLocation || getCurrentState().location),
      __store: mockStore('__store', () => getCurrentState()),
      getMatchStore: (routeId: string) => getMatchStore(routeId),
      setMatches: (matches: any) => {
        if (target.update) target.update({ ...target.options });
      }
    };

    return new Proxy(stores, {
      get(targetObj: any, prop: string) {
        if (prop in targetObj) return targetObj[prop];
        return mockStore(prop, () => undefined);
      }
    });
  };

  const storesPlaceholder: any = {};
  
  const routerOptions: any = {
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    stores: storesPlaceholder,
  };

  if (isServer) {
    routerOptions.history = createMemoryHistory();
  }

  const router = createTanStackRouter(routerOptions);
  console.log("[Router] instance created");

  // Initialize the placeholder with the real mock stores
  const realStores = createMockStores(router);
  Object.assign(storesPlaceholder, realStores);
  
  // Ensure the router instance also has them directly
  (router as any).stores = storesPlaceholder;
  (router as any)._stores = storesPlaceholder;

  // Patch getMatchedRoutes
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  router.getMatchedRoutes = (pathname: string) => {
    try {
      const result = originalGetMatchedRoutes(pathname) as any;
      let matchedRoutes = [], routeParams = {}, foundRoute = null;
      if (Array.isArray(result)) [matchedRoutes, routeParams, foundRoute] = result;
      else if (result && typeof result === 'object') ({ matchedRoutes, routeParams, foundRoute } = result);
      
      const matched = matchedRoutes || [];
      const params = routeParams || {};
      const found = foundRoute || null;
      
      return {
        matchedRoutes: matched,
        routeParams: params,
        foundRoute: found,
        [Symbol.iterator]: function* () {
          yield matched; yield params; yield found;
        },
      } as any;
    } catch (e) {
      return {
        matchedRoutes: [], routeParams: {}, foundRoute: null,
        [Symbol.iterator]: function* () { yield []; yield {}; yield null; }
      } as any;
    }
  };

  if (!isServer) {
    console.log("[Router] Attaching to window.__TSR__");
    (window as any).__TSR__ = { router };
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
