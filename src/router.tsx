import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const isServer = typeof document === 'undefined';
  console.log("[Router] getRouter starting, isServer:", isServer);

  const queryClient = new QueryClient();

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

  // Robust framework compatibility layer for TanStack Start v1
  const createMockStores = (target: any) => {
    const mockStore = (getValue: () => any) => {
      const s = {
        get: getValue,
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
      const store = mockStore(() => (getCurrentState().matches || []).find((m: any) => m.routeId === routeId));
      (store as any).get = store.get;
      return store;
    };

    const byRoute = new Map();
    // Pre-populate byRoute for better compatibility if needed
    
    return {
      ids: mockStore(() => (getCurrentState().matches || []).map((m: any) => m.routeId)),
      matchesId: mockStore(() => (getCurrentState().matches || []).map((m: any) => m.id || m.routeId)),
      byRoute: {
        get: getMatchStore
      },
      matches: mockStore(() => getCurrentState().matches || []),
      location: mockStore(() => getCurrentState().location || { pathname: '/', search: {}, hash: '', state: {} }),
      status: mockStore(() => getCurrentState().status || 'idle'),
      resolvedLocation: mockStore(() => getCurrentState().resolvedLocation || getCurrentState().location),
      __store: mockStore(() => getCurrentState()),
      getMatchStore: getMatchStore,
      setMatches: (matches: any) => {
        if (target.update) target.update({ ...target.options });
      }
    };
  };

  // Aggressively inject stores using defineProperty to handle early access by framework internals
  if (!(router as any).stores) {
    Object.defineProperty(router, 'stores', {
      get() {
        if (!this._injectedStores) {
          this._injectedStores = createMockStores(this);
        }
        return this._injectedStores;
      },
      set(v) {
        this._injectedStores = v;
      },
      configurable: true,
      enumerable: true,
    });
  }

  (router as any)._stores = (router as any).stores;
  if (router.options) {
    (router.options as any).stores = (router as any).stores;
  }
  console.log("[Router] Stores injected");

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
