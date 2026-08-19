import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";

const handler = createStartHandler(defaultRenderHandler);

export default {
  fetch: handler,
};
