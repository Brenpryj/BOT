const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Crear carpeta uploads si no existe
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

// Base de datos SQLite
const db = new sqlite3.Database('./database/bot.sqlite');

// Crear tablas si no existen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reclamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    dni TEXT,
    ubicacion TEXT,
    imagen TEXT,
    descripcion TEXT,
    tiempo_problema TEXT,
    numero_seguimiento TEXT,
    fecha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    propuesta TEXT,
    problema TEXT,
    imagen TEXT,
    fecha TEXT
  )`);
});

// RUTAS HTML

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Reclamos
app.get('/reclamos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reclamos.html'));
});

app.post('/reclamos', upload.single('imagen'), (req, res) => {
  const { nombre, dni, ubicacion, descripcion, tiempo_problema } = req.body;
  const imagen = req.file ? req.file.filename : '';
  const fecha = new Date().toLocaleDateString();
  const numero_seguimiento = 'LRQ-' + Date.now();

  db.run(
    `INSERT INTO reclamos (nombre, dni, ubicacion, imagen, descripcion, tiempo_problema, numero_seguimiento, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, dni, ubicacion, imagen, descripcion, tiempo_problema, numero_seguimiento, fecha],
    (err) => {
      if (err) return res.send("❌ Error al guardar el reclamo.");
      res.send(`<h2>✅ Reclamo enviado con éxito</h2><p>Número de seguimiento: <strong>${numero_seguimiento}</strong></p><a href="/">Volver al inicio</a>`);
    }
  );
});

// Ideas
app.get('/ideas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ideas.html'));
});

app.post('/ideas', upload.single('imagen'), (req, res) => {
  const { nombre, propuesta, problema } = req.body;
  const imagen = req.file ? req.file.filename : '';
  const fecha = new Date().toLocaleDateString();

  db.run(
    `INSERT INTO ideas (nombre, propuesta, problema, imagen, fecha)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, propuesta, problema, imagen, fecha],
    (err) => {
      if (err) return res.send("❌ Error al guardar la idea.");
      res.send(`<h2>✅ ¡Gracias por tu propuesta!</h2><p>Fue enviada correctamente.</p><a href="/">Volver al inicio</a>`);
    }
  );
});

// Proyectos
app.get('/proyectos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'proyectos.html'));
});

app.get('/api/proyectos', (req, res) => {
  fs.readFile('./database/proyectos.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los proyectos' });
    res.json(JSON.parse(data));
  });
});

// Legislatura
app.get('/funcion-legislatura.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'funcion-legislatura.html'));
});

// Admin
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Declaraciones
app.get('/declaraciones.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'declaraciones.html'));
});

// APIs
app.get('/api/reclamos', (req, res) => {
  db.all('SELECT * FROM reclamos ORDER BY fecha DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error cargando reclamos' });
    res.json(rows);
  });
});

app.get('/api/ideas', (req, res) => {
  db.all('SELECT * FROM ideas ORDER BY fecha DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error cargando ideas' });
    res.json(rows);
  });
});

// Eliminar reclamos
app.post('/api/reclamos/:id/eliminar', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM reclamos WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al eliminar reclamo' });
    res.json({ success: true });
  });
});

// Eliminar ideas
app.post('/api/ideas/:id/eliminar', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM ideas WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Error al eliminar idea' });
    res.json({ success: true });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
});
// Verificar y mover PDFs
const verificarYMoverPDFs = require('./verificar_y_mover_pdfs');