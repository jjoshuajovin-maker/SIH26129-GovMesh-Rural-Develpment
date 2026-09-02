import app from './app.js';

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`GOVMESH SIH26129 - DEPARTMENT 3 (RURAL DEVELOPMENT) BACKEND`);
  console.log(`Legacy CSV / SFTP System Simulation Server running on http://localhost:${PORT}`);
  console.log(`============================================================`);
});
