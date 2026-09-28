import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        const urlPath = req.url.split('?')[0];
        const fileMap = {
          '/api/auth/register': 'api/auth/register.js',
          '/api/auth/login': 'api/auth/login.js',
          '/api/auth/me': 'api/auth/me.js',
          '/api/data': 'api/data.js',
          '/api/status': 'api/status.js',
        };

        const targetFile = fileMap[urlPath];
        if (!targetFile) return next();

        try {
          const absolutePath = path.resolve(process.cwd(), targetFile);
          const fileUrl = `${pathToFileURL(absolutePath).href}?t=${Date.now()}`;
          const mod = await import(fileUrl);
          const handler = mod.default;

          if (!res.status) {
            res.status = function (code) {
              res.statusCode = code;
              return res;
            };
          }
          if (!res.json) {
            res.json = function (data) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify(data));
              return res;
            };
          }

          await handler(req, res);
        } catch (err) {
          console.error('Error in local API handler:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  base: './',
});
