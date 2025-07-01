const fs = require("fs");
const path = require("path");

const carpeta = path.join(__dirname, "public", "pdfs", "proyectos_legislativos");

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10490") && file !== "L10490_Endometriosis.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10490_Endometriosis.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10490_Endometriosis.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10549") && file !== "L10549_Salud_Digital.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10549_Salud_Digital.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10549_Salud_Digital.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10733") && file !== "L10733_Reduccion_Sodio.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10733_Reduccion_Sodio.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10733_Reduccion_Sodio.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10766") && file !== "L10766_Sin_Tabaco.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10766_Sin_Tabaco.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10766_Sin_Tabaco.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10657") && file !== "L10657_Septiembre_Joven.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10657_Septiembre_Joven.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10657_Septiembre_Joven.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10677") && file !== "L10677_Consumo_Jovenes.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10677_Consumo_Jovenes.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10677_Consumo_Jovenes.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10716") && file !== "L10716_Parque_Las_Talas.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10716_Parque_Las_Talas.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10716_Parque_Las_Talas.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10714") && file !== "L10714_Aporte_Extraordinario.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10714_Aporte_Extraordinario.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10714_Aporte_Extraordinario.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10713") && file !== "L10713_Impuesto_Inmobiliario.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10713_Impuesto_Inmobiliario.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10713_Impuesto_Inmobiliario.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10712") && file !== "L10712_Estrategico_Vial.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10712_Estrategico_Vial.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10712_Estrategico_Vial.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10754") && file !== "L10754_Perro_Asistencia.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10754_Perro_Asistencia.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10754_Perro_Asistencia.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10761") && file !== "L10761_Celiaca.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10761_Celiaca.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10761_Celiaca.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10725") && file !== "L10725_Combustibles.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10725_Combustibles.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10725_Combustibles.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10729") && file !== "L10729_Auditorias.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10729_Auditorias.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10729_Auditorias.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10763") && file !== "L10763_Jovenes_Conectados.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10763_Jovenes_Conectados.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10763_Jovenes_Conectados.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10731") && file !== "L10731_Rayos_X.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10731_Rayos_X.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10731_Rayos_X.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10719") && file !== "L10719_Parques_Industriales.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10719_Parques_Industriales.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10719_Parques_Industriales.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10764") && file !== "L10764_Centros_Estudiantes.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10764_Centros_Estudiantes.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10764_Centros_Estudiantes.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10743") && file !== "L10743_Juego_Online.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10743_Juego_Online.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10743_Juego_Online.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10755") && file !== "L10755_Empleo.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10755_Empleo.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10755_Empleo.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10760") && file !== "L10760_Vivienda_Joven.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10760_Vivienda_Joven.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10760_Vivienda_Joven.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10765") && file !== "L10765_Agua.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10765_Agua.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10765_Agua.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10767") && file !== "L10767_Economia_Conocimiento.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10767_Economia_Conocimiento.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10767_Economia_Conocimiento.pdf`);
  }
});

fs.readdirSync(carpeta).forEach(file => {
  if (file.startsWith("L10768") && file !== "L10768_Internet.pdf") {
    const origen = path.join(carpeta, file);
    const destino = path.join(carpeta, "L10768_Internet.pdf");
    fs.renameSync(origen, destino);
    console.log(`✅ Renombrado: ${file} → L10768_Internet.pdf`);
  }
});
