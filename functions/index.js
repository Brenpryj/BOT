const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const formidable = require("formidable");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

app.post("/enviarFormulario", (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields) => {
    if (err) {
      console.error("Parse error:", err);
      return res.status(500).json({ mensaje: "Error al procesar el formulario" });
    }

    const { nombre, email, mensaje } = fields;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    try {
      await db.collection("sugerencias").add({
        nombre,
        email,
        mensaje,
        fecha: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ mensaje: "Sugerencia enviada correctamente" });
    } catch (dbErr) {
      console.error("Error en Firestore:", dbErr);
      return res.status(500).json({ mensaje: "Error al guardar en Firestore" });
    }
  });
});

exports.api = functions.https.onRequest(app);
