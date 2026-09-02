import app from '../server/app.js';

export default function handler(req, res) {
  // Guarantee req.url retains the /api prefix for Express routing
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
