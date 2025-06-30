// functions/index.js
const functions  = require("firebase-functions");
const express    = require("express");
// Ruta de comprobación
// (La declaración de 'app' se realiza más abajo)

const cors       = require("cors");
const formidable = require("formidable");
const fs         = require("fs");
const admin      = require("firebase-admin");

// inicializa Admin con tu bucket
admin.initializeApp({
  storageBucket: "boot-5795d.appspot.com"
});
const db     = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(cors({ origin: true }));

// ¡NO hay multer aquí, solo formidable!
app.post("/enviarFormulario", (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Parse error:", err);
      return res.status(500).json({ mensaje: err.message });
    }

    // Valida campos de texto
    const { nombre, email, mensaje } = fields;
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    let imagenURL = "";
    // Si llegó archivo, súbelo
    if (files.imagen?.filepath) {
      try {
        const data     = fs.readFileSync(files.imagen.filepath);
        const fileName = `sugerencias/${Date.now()}_${files.imagen.originalFilename}`;
        const fileRef  = bucket.file(fileName);
        await fileRef.save(data, {
          metadata: { contentType: files.imagen.mimetype },
          public: true,
        });
        imagenURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      } catch (uploadErr) {
        console.error("Error subiendo imagen:", uploadErr);
        // no rompemos todo: seguimos sin imagen
      }
    }

    // Guarda en Firestore
    try {
      await db.collection("sugerencias").add({
        nombre,
        email,
        mensaje,
        imagenURL,
        fecha: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ mensaje: "Sugerencia enviada correctamente" });
    } catch (dbErr) {
      console.error("Error en Firestore:", dbErr);
      return res.status(500).json({ mensaje: dbErr.message });
    }
  });
});

exports.api = functions.https.onRequest(app);
