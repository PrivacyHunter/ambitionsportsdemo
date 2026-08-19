import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";
import { getRouterInstance } from "@tanstack/react-start";
import { createRouter } from "./router";

/**
 * In TanStack Start v1, the server entry point uses createStartHandler.
 * The router is typically provided by overriding the default behavior or
 * by Start finding the src/router.ts file.
 */
export default createStartHandler(defaultRenderHandler);
