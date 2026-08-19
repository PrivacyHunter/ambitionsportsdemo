import { createStartHandler, defaultRenderHandler } from "@tanstack/react-start/server";
import { startInstance } from "./start";

export default createStartHandler({
  createNextHandler: defaultRenderHandler,
})(startInstance);
