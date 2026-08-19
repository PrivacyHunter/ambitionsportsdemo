import { createStartHandler, defaultRenderHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

const handler = createStartHandler({
  createRouter: getRouter,
  handler: defaultRenderHandler,
})

export default {
  fetch: (request: Request) => {
    console.log(`[SSR] Handling request: ${request.url}`);
    return handler(request).catch(err => {
      console.error('[SSR] Handler Error:', err);
      return new Response(JSON.stringify({ 
        error: err.message, 
        stack: err.stack,
        type: 'SSR_HANDLER_ERROR'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }
}
