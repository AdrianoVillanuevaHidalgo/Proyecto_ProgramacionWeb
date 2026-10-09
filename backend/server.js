const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para el parseo de JSON en las solicitudes (req.body)
app.use(express.json({ limit: '10mb' })); // Limite para imagenes
app.use(express.urlencoded({ extended: true }));

// Servir los archivos estaticos de la carpeta frontend
// Apunta a la carpeta frontend/ ubicada un nivel arriba de backend/
app.use(express.static(path.join(__dirname, '../frontend')));

// Montar las rutas de la API RESTful bajo el prefijo /api
app.use('/api', apiRoutes);

// Ruta por defecto: Servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo global de rutas NO encontradas (Codigo HTTP 404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada (404 Not Found). Verifica la dirección ingresada.'
  });
});

// Iniciar la escucha del servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Servidor Ritmo de Detalles ejecutandose con exito`);
  console.log(`Acceso a la web: http://localhost:${PORT}`);
  console.log(`Endpoints API:  http://localhost:${PORT}/api/pedidos`);
  console.log(`====================================================`);
});