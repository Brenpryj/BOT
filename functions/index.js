// 👇 Último ajuste 27/06/2025 — versión corregida
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(cors({ origin: true }));
const upload = multer({ storage: multer.memoryStorage() });

app.post("/enviarFormulario", upload.single("imagen"), async (req, res) => {
  try {
    console.log("✅ Datos recibidos del formulario:");
    console.log("Nombre:", req.body.nombre);
    console.log("Email:", req.body.email);
    console.log("Mensaje:", req.body.mensaje);
    console.log("Archivo:", req.file?.originalname || "No se adjuntó imagen");

    const { nombre, email, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    let imagenURL = "";

    if (req.file && req.file.buffer) {
      const fileName = `sugerencias/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
        resumable: false,
        public: true,
      });

      imagenURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      console.log("✅ Imagen subida con URL:", imagenURL);
    }

    await db.collection("sugerencias").add({
      nombre,
      email,
      mensaje,
      imagenURL,
      fecha: new Date(),
    });

    console.log("✅ Sugerencia guardada en Firestore");
    res.status(200).json({ mensaje: "Sugerencia enviada correctamente" });
  } catch (error) {
    console.error("❌ Error al procesar el formulario:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

exports.api = functions.https.onRequest(app);
