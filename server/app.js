import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes/api.js';

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-GovMesh-App-ID', 'X-GovMesh-Request-Hash', 'X-GovMesh-Sent-At'],
  exposedHeaders: ['X-Correlation-ID', 'X-GovMesh-App-ID', 'X-GovMesh-Request-Hash', 'X-GovMesh-Sent-At']
}));
app.use(express.json());

// Ingress logging middleware
app.use((req, res, next) => {
  if (req.url.includes('rural') || req.url.includes('health') || req.url.includes('address-update') || req.url.startsWith('/api')) {
    const appId = req.body?.applicationId || req.body?.citizen?.applicationId || 'N/A';
    const corrId = req.headers['x-correlation-id'] || req.headers['x-govmesh-correlation-id'] || 'N/A';
    console.log(`[RURAL-INBOUND] Request received`);
    console.log(`[RURAL-INBOUND] Method: ${req.method}`);
    console.log(`[RURAL-INBOUND] Path: ${req.url}`);
    console.log(`[RURAL-INBOUND] applicationId: ${appId}`);
    console.log(`[RURAL-INBOUND] correlationId: ${corrId}`);
  }
  next();
});

// URL normalization middleware for Vercel serverless and standalone Express
app.use((req, res, next) => {
  // Normalize double /api/api/ prefixes if present
  while (req.url.startsWith('/api/api/')) {
    req.url = req.url.substring(4);
  }
  if (req.url.startsWith('/api/')) {
    req.url = req.url.substring(4);
  } else if (req.url === '/api') {
    req.url = '/';
  }
  next();
});

app.use('/', apiRouter);

// Serve static frontend build if dist folder exists
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Rural Development & Panchayat Raj Department - API Active');
  }
});

export default app;
