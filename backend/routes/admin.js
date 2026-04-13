const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to verify Admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jamb_mock';
  
  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized!' });
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Require Admin Role!' });
    next();
  });
};

// Get All Users (Detailed)
router.get('/users', verifyAdmin, (req, res) => {
  // Query users and count their total exams
  const query = `
    SELECT 
      users.id, 
      users.firstName, 
      users.lastName, 
      users.email, 
      users.regNumber, 
      count(results.id) as examsTaken
    FROM users
    LEFT JOIN results ON users.id = results.user_id
    WHERE users.role != 'admin'
    GROUP BY users.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get All Results
router.get('/results', verifyAdmin, (req, res) => {
  const query = `
    SELECT 
      results.id, 
      results.score, 
      results.total, 
      results.timestamp, 
      users.firstName, 
      users.lastName, 
      users.regNumber
    FROM results
    JOIN users ON results.user_id = users.id
    ORDER BY results.timestamp DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

module.exports = router;
