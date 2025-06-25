const fs = require('fs');
const path = require('path');

// Ruta donde deberían estar los PDFs
const pdfDir = path.join(__dirname, 'public/pdfs/proyectos_legislativos');

// Lista de archivos PDF esperados según el HTML
const archivosEsperados = [
  "L10490_Endometriosis.pdf",
  "L10549_Salud_Digital.pdf",
  "L10733_Reduccion_Sodio.pdf",
  "L10766_Sin_Tabaco.pdf",
  "L10657_Septiembre_Joven.pdf",
  "L10677_Consumo_Jovenes.pdf",
  "L10716_Parque_Las_Talas.pdf",
  "L10714_Aporte_Extraordinario.pdf",
  "L10713_Impuesto_Inmobiliario.pdf",
  "L10712_Estrategico_Vial.pdf",
  "L10754_Perro_Asistencia.pdf",
  "L10761_Celiaca.pdf",
  "L10725_Combustibles.pdf",
  "L10729_Auditorias.pdf",
  "L10763_Jovenes_Conectados.pdf",
  "L10731_Rayos_X.pdf",
  "L10719_Parques_Industriales.pdf",
  "L10764_Centros_Estudiantes.pdf",
  "L10743_Juego_Online.pdf",
  "L10755_Empleo.pdf",
  "L10760_Vivienda_Joven.pdf",
  "L10765_Agua.pdf",
  "L10767_Economia_Conocimiento.pdf",
  "L10768_Internet.pdf"
];

// Verificación
let encontrados = 0;
let faltantes = [];

archivosEsperados.forEach((archivo) => {
  const ruta = path.join(pdfDir, archivo);
  if (fs.existsSync(ruta)) {
    encontrados++;
    console.log(`✅ Encontrado: ${archivo}`);
  } else {
    faltantes.push(archivo);
    console.log(`❌ FALTANTE: ${archivo}`);
  }
});

console.log(`\n🧾 Archivos encontrados: ${encontrados}`);
if (faltantes.length > 0) {
  console.log(`\n🚨 Archivos faltantes (${faltantes.length}):`);
  faltantes.forEach(f => console.log(`- ${f}`));
} else {
  console.log("\n✅ ¡Todos los archivos están presentes!");
}
