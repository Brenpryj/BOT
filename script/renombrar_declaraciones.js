const fs = require('fs');
const path = require('path');

const carpeta = path.join(__dirname, 'public', 'pdfs', 'declaraciones_interes');

function limpiarNombreArchivo(nombre) {
  return nombre
    .trim()
    .replace(/\s+/g, '_')                      // Espacios -> _
    .replace(/[^\w\d_.\-]/g, '')               // Quitar caracteres no válidos
    .replace(/__+/g, '_')                      // Evitar doble guión bajo
    .replace(/Dcl/i, 'Dcl')                    // Unificar prefijo
    .replace(/^_+|_+$/g, '')                   // Borrar guiones bajos al principio y final
    .replace(/\.+/g, '.')                      // Limpiar puntos repetidos
}

function renombrarArchivosEnCarpeta(ruta) {
  if (!fs.existsSync(ruta)) {
    console.log(`❌ Carpeta no encontrada: ${ruta}`);
    return;
  }

  const archivos = fs.readdirSync(ruta);
  archivos.forEach(nombreOriginal => {
    const nombreLimpio = limpiarNombreArchivo(nombreOriginal);
    const rutaOriginal = path.join(ruta, nombreOriginal);
    const rutaNueva = path.join(ruta, nombreLimpio);

    if (nombreOriginal !== nombreLimpio) {
      fs.renameSync(rutaOriginal, rutaNueva);
      console.log(`🔁 Renombrado:\n  - ${nombreOriginal} ➜ ${nombreLimpio}`);
    }
  });
}

function recorrerSubcarpetas() {
  const años = ['Dcl2022', 'Dcl2023', 'Dcl2024', 'Dcl2025'];
  años.forEach(anio => {
    const rutaCompleta = path.join(carpeta, anio);
    renombrarArchivosEnCarpeta(rutaCompleta);
  });
}

recorrerSubcarpetas();
console.log("✅ Renombramiento completo.");
