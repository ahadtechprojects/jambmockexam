const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { collection, addDoc, getDocs, query, where } = require('firebase/firestore');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jamb_mock';

// Helper to generate Reg Number based on YYYYMMDD + random 4-digit + Initials
const generateRegNumber = (firstName, lastName) => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  const rand = Math.floor(1000 + Math.random() * 9000);
  const init = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  
  return `${yyyy}${mm}${dd}${rand}${init}`;
};

// Register User
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, course, subjects } = req.body;
  if (!firstName || !lastName || !email || !password || !course) {
    return res.status(400).json({ error: 'All fields including Course are required' });
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const regNumber = generateRegNumber(firstName, lastName);

    const docRef = await addDoc(usersRef, {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'user',
      regNumber,
      course,
      subjects: subjects || [] // Array of subject IDs e.g. ['eng', 'bio', 'chy', 'phy']
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: docRef.id, regNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

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
        role: user.role,
        course: user.course,
        subjects: user.subjects
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
