const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jamb_mock';

// Helper to generate Reg Number based on YYYYMMDD + 1000 + ID + Initials
const generateRegNumber = (id, firstName, lastName) => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  const autoInc = 1000 + id;
  const init = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  
  return `${yyyy}${mm}${dd}${autoInc}${init}`;
};

// Register User
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'user'; // ensure defaults

    db.run(
      `INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, role],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const lastID = this.lastID;
        const regNumber = generateRegNumber(lastID, firstName, lastName);
        
        // Update user with their new Reg Number
        db.run(`UPDATE users SET regNumber = ? WHERE id = ?`, [regNumber, lastID], (updateErr) => {
          if (updateErr) return res.status(500).json({ error: 'Failed to generate Reg Number' });
          
          res.status(201).json({ message: 'User registered successfully', userId: lastID, regNumber });
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login User
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      // Build payload containing necessary frontend info
      const token = jwt.sign(
        { id: user.id, email: user.email, regNumber: user.regNumber, role: user.role },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({ 
        message: 'Login successful', 
        token, 
        user: { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          regNumber: user.regNumber, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

module.exports = router;
