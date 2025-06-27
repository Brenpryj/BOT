const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// Configurar Multer para procesar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para recibir el formulario
app.post("/enviarFormulario", upload.single("imagen"), async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    // Guardar imagen en Storage
    let imageUrl = "";
    if (file) {
      const bucket = admin.storage().bucket();
      const id = uuidv4();
      const fileRef = bucket.file(`imagenes/${id}_${file.originalname}`);
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      await fileRef.makePublic();
      imageUrl = fileRef.publicUrl();
    }

    // Guardar datos en Firestore
    await db.collection("formularios").add({
      ...data,
      imagen: imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send({ mensaje: "Formulario enviado con éxito." });
  } catch (error) {
    console.error("Error al enviar:", error);
    res.status(500).send({ error: "Error al enviar formulario." });
  }
});

// Exportar función para Firebase
exports.api = functions.https.onRequest(app);
