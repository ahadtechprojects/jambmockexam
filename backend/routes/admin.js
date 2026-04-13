const express = require('express');
const db = require('../db');
const { collection, getDocs } = require('firebase/firestore');

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
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const resultsSnapshot = await getDocs(collection(db, 'results'));
    
    // Calculate total exams taken per user
    const examsCount = {};
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      examsCount[data.user_id] = (examsCount[data.user_id] || 0) + 1;
    });

    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.role !== 'admin') {
        users.push({
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          regNumber: data.regNumber,
          course: data.course || 'Not Specified',
          examsTaken: examsCount[doc.id] || 0
        });
      }
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get All Results
router.get('/results', verifyAdmin, async (req, res) => {
  try {
    const resultsSnapshot = await getDocs(collection(db, 'results'));
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    // Map users by ID for quick lookup
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });

    const results = [];
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      const user = usersMap[data.user_id] || {};
      
      results.push({
        id: doc.id,
        score: data.score,
        total: data.total,
        timestamp: data.timestamp,
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || 'User',
        regNumber: user.regNumber || 'N/A',
        course: user.course || data.course || 'N/A'
      });
    });

    // Sort by timestamp descending
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
