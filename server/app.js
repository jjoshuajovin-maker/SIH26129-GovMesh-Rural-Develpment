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

// URL normalization middleware for Vercel serverless and standalone Express
app.use((req, res, next) => {
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
