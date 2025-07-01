const fs = require('fs');
const path = require('path');

// Ruta destino donde deben estar los PDFs
const destino = path.join(__dirname, 'public/pdfs/proyectos_legislativos');

// Ruta raíz donde buscar los archivos en caso de que falten
const raizBusqueda = path.join(__dirname);

// Lista de PDFs esperados
const archivosEsperados = [
  "L10490_Endometriosis.pdf", "L10549_Salud_Digital.pdf", "L10733_Reduccion_Sodio.pdf", "L10766_Sin_Tabaco.pdf",
  "L10657_Septiembre_Joven.pdf", "L10677_Consumo_Jovenes.pdf", "L10716_Parque_Las_Talas.pdf",
  "L10714_Aporte_Extraordinario.pdf", "L10713_Impuesto_Inmobiliario.pdf", "L10712_Estrategico_Vial.pdf",
  "L10754_Perro_Asistencia.pdf", "L10761_Celiaca.pdf", "L10725_Combustibles.pdf", "L10729_Auditorias.pdf",
  "L10763_Jovenes_Conectados.pdf", "L10731_Rayos_X.pdf", "L10719_Parques_Industriales.pdf",
  "L10764_Centros_Estudiantes.pdf", "L10743_Juego_Online.pdf", "L10755_Empleo.pdf",
  "L10760_Vivienda_Joven.pdf", "L10765_Agua.pdf", "L10767_Economia_Conocimiento.pdf", "L10768_Internet.pdf"
];

// Función recursiva para buscar archivo
function buscarArchivo(nombreArchivo, carpeta) {
  const archivos = fs.readdirSync(carpeta);
  for (let archivo of archivos) {
    const rutaCompleta = path.join(carpeta, archivo);
    const stats = fs.statSync(rutaCompleta);
    if (stats.isDirectory()) {
      const resultado = buscarArchivo(nombreArchivo, rutaCompleta);
      if (resultado) return resultado;
    } else if (archivo === nombreArchivo) {
      return rutaCompleta;
    }
  }
  return null;
}

// Verificación y movimiento
if (!fs.existsSync(destino)) fs.mkdirSync(destino, { recursive: true });

let faltantes = [];

archivosEsperados.forEach(nombre => {
  const rutaDestino = path.join(destino, nombre);
  if (fs.existsSync(rutaDestino)) {
    console.log(`✅ Ya está en destino: ${nombre}`);
  } else {
    const rutaOrigen = buscarArchivo(nombre, raizBusqueda);
    if (rutaOrigen) {
      fs.copyFileSync(rutaOrigen, rutaDestino);
      console.log(`📂 Movido: ${nombre} desde ${rutaOrigen}`);
    } else {
      faltantes.push(nombre);
      console.log(`❌ NO ENCONTRADO: ${nombre}`);
    }
  }
});

console.log("\n🔍 Revisión final:");
console.log(`✔️ Encontrados y movidos: ${archivosEsperados.length - faltantes.length}`);
if (faltantes.length > 0) {
  console.log(`🚨 Faltantes (${faltantes.length}):`);
  faltantes.forEach(f => console.log(`- ${f}`));
} else {
  console.log("🎉 ¡Todos los archivos están ahora en su lugar!");
}
