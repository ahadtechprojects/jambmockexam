const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyASIqb0TdXe0WVMHbsCDBuiLY-1QV2foYc",
  authDomain: "jambmockcbt.firebaseapp.com",
  projectId: "jambmockcbt",
  storageBucket: "jambmockcbt.firebasestorage.app",
  messagingSenderId: "282521900222",
  appId: "1:282521900222:web:6d0611183622afca9f7aef",
  measurementId: "G-3FE9Z7LYB4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = db;
