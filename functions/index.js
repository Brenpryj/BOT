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
    console.log("✅ Body recibido:", req.body);
    console.log("✅ Archivo recibido:", req.file);

    const { nombre, email, mensaje } = req.body;

    // 🔒 Validación de campos obligatorios
    if (!nombre || !email || !mensaje) {
      throw new Error("❌ Faltan campos requeridos (nombre, email o mensaje)");
    }

    let imagenURL = "";

    if (req.file && req.file.buffer && req.file.originalname) {
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

    console.log("✅ Sugerencia guardada correctamente");
    res.status(200).json({ mensaje: "Sugerencia enviada correctamente" });

  } catch (err) {
    console.error("🔥 Error capturado en servidor:", err);
    // Para evitar enviar HTML como respuesta en errores
    res.status(500).json({ mensaje: err.message || "Error al enviar la sugerencia" });
  }
});

exports.api = functions.https.onRequest(app);
