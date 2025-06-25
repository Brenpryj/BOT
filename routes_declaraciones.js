const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const AÑOS = ['2022', '2023', '2024', '2025'];

router.get('/', (req, res) => {
  const basePath = path.join(__dirname, '..', 'public', 'pdfs', 'declaraciones_interes');
  const resultado = {};

  AÑOS.forEach(anio => {
    const carpeta = path.join(basePath, `Dcl${anio}`);
    if (fs.existsSync(carpeta)) {
      const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.pdf'));
      resultado[anio] = archivos.map(nombreArchivo => {
        const nombreLimpio = path.basename(nombreArchivo, '.pdf').replace(/_/g, ' ');
        return { nombre: nombreLimpio, archivo: nombreArchivo };
      });
    } else {
      resultado[anio] = [];
    }
  });

  res.json(resultado);
});

module.exports = router;
