import { createStartHandler, defaultRenderHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

const handler = createStartHandler({
  createRouter: getRouter,
  handler: defaultRenderHandler,
})

export default {
  fetch: async (request: Request) => {
    try {
      // Basic check to avoid crashing on malformed requests
      if (!request || !request.url) {
        return new Response('Bad Request', { status: 400 });
      }

      const response = await handler(request);
      return response;
    } catch (err: any) {
      console.error('[SSR] Handler Error:', err);
      
      // Return a slightly more helpful error response in dev
      const errorData = {
        message: err.message || 'Internal Server Error',
        type: 'SSR_HANDLER_ERROR',
        url: request.url
      };

      return new Response(JSON.stringify(errorData), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
