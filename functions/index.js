const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // Aceptar JSON directo

app.post("/enviarFormulario", async (req, res) => {
  const { nombre, email, mensaje } = req.body;

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
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
    return res.status(500).json({ mensaje: "Error al guardar en Firestore" });
  }
});

exports.api = onRequest(app);
