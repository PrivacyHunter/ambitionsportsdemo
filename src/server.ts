import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";
import { getRouter } from "./router";
import { startInstance } from "./start";
import { renderErrorPage } from "./lib/error-page";

const handler = createStartHandler({
  createRouter: getRouter,
  getOptions: () => startInstance.getOptions(),
})(defaultRenderHandler);

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      return await handler(request, env, ctx);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
