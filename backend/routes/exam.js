const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to verify token for results submission
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jamb_mock';
  
  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized!' });
    req.userId = decoded.id;
    next();
  });
};

// Submit Exam Result
router.post('/results', verifyToken, (req, res) => {
  const { score, total } = req.body;

  if (score === undefined || total === undefined) {
    return res.status(400).json({ error: 'Score and total are required' });
  }

  db.run(`INSERT INTO results (user_id, score, total) VALUES (?, ?, ?)`, [req.userId, score, total], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Result saved successfully', resultId: this.lastID });
  });
});

// Get User's Latest Result
router.get('/results', verifyToken, (req, res) => {
  db.all(`SELECT * FROM results WHERE user_id = ? ORDER BY timestamp DESC`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

module.exports = router;
