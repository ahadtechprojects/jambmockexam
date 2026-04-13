const express = require('express');
const db = require('../db');
const { collection, addDoc, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

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
router.post('/results', verifyToken, async (req, res) => {
  const { score, total } = req.body;

  if (score === undefined || total === undefined) {
    return res.status(400).json({ error: 'Score and total are required' });
  }

  try {
    const userDocRef = doc(db, 'users', req.userId);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const docRef = await addDoc(collection(db, 'results'), {
      user_id: req.userId,
      score,
      total,
      course: userData.course || 'Not Specified',
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'Result saved successfully', resultId: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User's Latest Result
router.get('/results', verifyToken, async (req, res) => {
  try {
    const q = query(collection(db, 'results'), where('user_id', '==', req.userId));
    const snapshot = await getDocs(q);
    
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory to avoid Firestore composite index errors
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
