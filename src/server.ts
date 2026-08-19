import { createStartHandler, defaultRenderHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

export default createStartHandler({
  handler: (request: Request) => defaultRenderHandler(request, { createRouter: getRouter })
})
