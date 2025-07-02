const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();

const corsOptions = {
  origin: "https://brenpryj.github.io",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json());

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
      fecha: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ mensaje: "Sugerencia enviada correctamente" });
  } catch (error) {
    console.error("Error al guardar:", error);
    return res.status(500).json({ mensaje: "Error al guardar en Firestore" });
  }
});

// 💡 Esta línea usa Gen 2
exports.api = functions.onRequest(app);
