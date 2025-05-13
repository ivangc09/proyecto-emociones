const express = require('express');
const path = require('path');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase init
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS))
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/protected', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ message: "Ruta protegida", user: decodedToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});
