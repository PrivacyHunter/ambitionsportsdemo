import { createStart } from "@tanstack/react-start";
import { getRouter } from "./router";

export const startInstance = createStart(() => ({
  // The current version expects options directly or a function returning them
  // but 'createRouter' is often handled by the framework's internal plugin
  // if not explicitly defined in the type.
}) as any);
