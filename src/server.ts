import { createStartHandler, defaultRenderHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

const handler = createStartHandler({
  handler: defaultRenderHandler,
})

export default {
  fetch: (request: Request) => handler(request)
}
