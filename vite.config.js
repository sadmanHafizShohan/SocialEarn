/* global URL, Buffer, fetch, process */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function localAppsScriptProxy(env) {
  return {
    name: 'local-apps-script-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          next();
          return;
        }
        if (!env.APPS_SCRIPT_WEB_APP_URL) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: 'APPS_SCRIPT_WEB_APP_URL is not configured.' }));
          return;
        }
        if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
          res.statusCode = 405;
          res.end('Method not allowed.');
          return;
        }

        const requestUrl = new URL(req.url || '/', 'http://localhost');
        const path = requestUrl.pathname.replace(/^\/api\/?/, '');
        const token = req.headers.authorization || '';
        const upstreamUrl = new URL(env.APPS_SCRIPT_WEB_APP_URL);
        upstreamUrl.searchParams.set('path', `/${path}`);
        upstreamUrl.searchParams.set('proxySecret', env.APPS_SCRIPT_PROXY_SECRET || '');
        if (token) upstreamUrl.searchParams.set('idToken', token.replace(/^Bearer\s+/i, ''));
        requestUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));

        let body;
        if (!['GET', 'DELETE'].includes(req.method)) {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          body = Buffer.concat(chunks).toString();
        }

        try {
          const response = await fetch(upstreamUrl, {
            method: ['PATCH', 'DELETE'].includes(req.method) ? 'POST' : req.method,
            headers: { 'Content-Type': 'application/json', Authorization: token },
            body: ['PATCH', 'DELETE'].includes(req.method) ? JSON.stringify({ ...(body ? JSON.parse(body) : {}), _method: req.method }) : body
          });
          res.statusCode = response.status;
          res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
          res.end(await response.text());
        } catch (error) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: error.message || 'Backend unavailable.' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), localAppsScriptProxy(env)] };
});
