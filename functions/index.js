// 👇 Forzar cambio para redeploy
// Último ajuste 27/06/2025

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

app.post("/enviarFormulario", upload.single("imagen"), async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;
    let imagenURL = "";

    if (req.file) {
      const fileName = `sugerencias/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        public: true,
      });
      imagenURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    await db.collection("sugerencias").add({
      nombre,
      email,
      mensaje,
      imagenURL,
      fecha: new Date(),
    });

    res.status(200).json({ mensaje: "Sugerencia enviada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al enviar la sugerencia" });
  }
});

exports.api = functions.https.onRequest(app);
