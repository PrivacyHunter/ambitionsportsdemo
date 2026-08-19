import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";
import { renderErrorPage } from "./lib/error-page";

const handler = createStartHandler(defaultRenderHandler);

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const response = await handler(request, env, ctx);
      return response;
    } catch (error) {
      console.error("SSR Error:", error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
