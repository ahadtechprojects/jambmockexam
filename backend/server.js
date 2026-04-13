const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const adminRoutes = require('./routes/admin');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('JAMB Mock CBT API is running');
});

// Delay execution to let table creation finish
setTimeout(() => {
  db.get(`SELECT * FROM users WHERE role = 'admin'`, async (err, admin) => {
    if (!admin) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(
        `INSERT INTO users (firstName, lastName, email, regNumber, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
        ['System', 'Administrator', 'admin@jamb.mock', 'ADMIN0001', hashedPassword, 'admin'],
        (err) => {
          if (!err) console.log('Created default admin: email "admin@jamb.mock", password "admin123"');
        }
      );
    }
  });
}, 1000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
