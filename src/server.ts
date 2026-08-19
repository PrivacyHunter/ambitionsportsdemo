import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";
import { getRouter } from "./router";
import { startInstance } from "./start";
import { renderErrorPage } from "./lib/error-page";

// The createStartHandler in TanStack Start v1 expects either a handler callback
// or an options object with a `handler` property.
// It uses the router from startInstance.getOptions() which we configured in src/start.ts.
const handler = createStartHandler({
  handler: defaultRenderHandler,
});

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // getOptions is async in Start v1
      const options = await startInstance.getOptions();
      
      // We need to ensure the router is available for the handler.
      // TanStack Start handles the mapping between the request and the router 
      // internally if the startInstance is correctly configured.
      return await handler(request, { 
        ...options,
        // Pass necessary context for the handler
        request,
      });
    } catch (error) {
      console.error("SSR Error:", error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
