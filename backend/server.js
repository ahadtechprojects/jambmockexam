const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const adminRoutes = require('./routes/admin');
const db = require('./db');
const { collection, getDocs, query, where, addDoc } = require('firebase/firestore');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('JAMB Mock CBT API is running with Firebase!');
});

// Delay execution to let Firebase initialize
setTimeout(async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await addDoc(collection(db, 'users'), {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@jamb.mock',
        regNumber: 'ADMIN0001',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Created default admin: email "admin@jamb.mock", password "admin123"');
    }
  } catch (error) {
    console.error('Error ensuring default admin:', error);
  }
}, 3000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
