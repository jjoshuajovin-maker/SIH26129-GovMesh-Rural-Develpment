import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes/api.js';

const app = express();

app.use(cors());
app.use(express.json());

// Mount API Router on both / and /api for full serverless compatibility
app.use(['/', '/api'], apiRouter);

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
