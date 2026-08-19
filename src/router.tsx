import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const isServer = typeof document === 'undefined';
  console.log("[Router] getRouter starting, isServer:", isServer);

  const queryClient = new QueryClient();

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

  const createMockStores = (target: any) => {
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

  // We define the stores on the PROTOTYPE of the router core instance
  // because the framework components might be accessing properties that aren't on the instance yet.
  const routerProto = (createTanStackRouter as any).prototype || {};
  
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
  console.log("[Router] instance created");

  const stores = createMockStores(router);
  
  // Inject into all possible locations
  (router as any).stores = stores;
  (router as any)._stores = stores;
  if (router.options) (router.options as any).stores = stores;

  // Final measure: intercept property access on the router itself
  const proxyRouter = new Proxy(router, {
    get(target, prop, receiver) {
      if (prop === 'stores' || prop === '_stores') return stores;
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === 'function') return val.bind(target);
      return val;
    }
  });

  // Patch getMatchedRoutes on the proxy
  const originalGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  (proxyRouter as any).getMatchedRoutes = (pathname: string) => {
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
    (window as any).__TSR__ = { router: proxyRouter };
  }

  return proxyRouter;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
