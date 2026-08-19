import { createStartHandler, defaultRenderHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

const handler = createStartHandler({
  handler: defaultRenderHandler,
})

export default {
  fetch: async (request: Request) => {
    try {
      const response = await handler(request);
      return response;
    } catch (err: any) {
      console.error('[SSR] Handler Error:', err);
      return new Response(JSON.stringify({ 
        error: err.message, 
        stack: err.stack,
        type: 'SSR_HANDLER_ERROR'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
