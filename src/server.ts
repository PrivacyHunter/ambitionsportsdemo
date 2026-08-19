import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";
import { getRouter } from "./router";

export default createStartHandler({
  handler: defaultRenderHandler,
})((request: Request) => {
  const router = getRouter();
  return router;
} as any);
