import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static build in production mode if exists
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Rural Development & Panchayat Raj Department - API Server Running on Port 5000');
  }
});

app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`GOVMESH SIH26129 - DEPARTMENT 3 (RURAL DEVELOPMENT) BACKEND`);
  console.log(`Legacy CSV / SFTP System Simulation Server running on http://localhost:${PORT}`);
  console.log(`============================================================`);
});
