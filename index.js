const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

var app = express();

app.use(express.json());
app.use(cors());

require('dotenv').config();

admin.initializeApp({
    credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

app.post("/protected", verifyToken, (req, res) => {
    res.json({ message: "Ruta protegida", user: req.user });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.use(express.static('public'));

