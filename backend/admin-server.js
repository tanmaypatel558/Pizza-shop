const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve admin dashboard static files
app.use('/admin', express.static(path.join(__dirname, '../build')));

// For direct navigation to /admin routes (React Router)
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Serve admin dashboard at root as well
app.use('/', express.static(path.join(__dirname, '../build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.ADMIN_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Admin Dashboard running on port ${PORT}`);
  console.log(`Access admin at: http://localhost:${PORT}/admin`);
});