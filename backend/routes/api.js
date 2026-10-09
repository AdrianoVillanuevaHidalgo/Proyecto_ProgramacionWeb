const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Rutas absolutas hacia los archivos JSON
const pedidosPath = path.join(__dirname, '../data/pedidos.json');
const productosPath = path.join(__dirname, '../data/productos.json');

// Funcion para leer archivos JSON
function leerJSON(rutaArchivo) {
  try {
    if (!fs.existsSync(rutaArchivo)) {
      return [];
    }
    const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
    return contenido ? JSON.parse(contenido) : [];
  } catch (error) {
    console.error(`Error leyendo ${rutaArchivo}:`, error);
    return [];
  }
}

// Funcion para escribir archivos JSON
function escribirJSON(rutaArchivo, datos) {
  try {
    const dir = path.dirname(rutaArchivo);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error escribiendo en ${rutaArchivo}:`, error);
    return false;
  }
}


// Endpoints para pedidos (/api/pedidos)


// GET /api/pedidos - Obtener los pedidos
router.get('/pedidos', (req, res) => {
  const pedidos = leerJSON(pedidosPath);
  res.status(200).json(pedidos);
});

// POST /api/pedidos - Registrar un nuevo pedido
router.post('/pedidos', (req, res) => {
  const { cliente, telefono, fechaEntrega, direccion, mensaje, productos, total } = req.body;

  // Validacion de campos obligatorios (400 Bad Request)
  if (!cliente || !telefono || !fechaEntrega || !direccion || !mensaje || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      error: 'Solicitud incompleta. Todos los campos son obligatorios y debe incluir al menos un producto.'
    });
  }

  const nuevoPedido = {
    idPedido: Date.now(),
    cliente: cliente.trim(),
    telefono: telefono.trim(),
    fechaEntrega,
    direccion: direccion.trim(),
    mensaje: mensaje.trim(),
    productos,
    total: total || 'S/ 0.00',
    estado: 'Pendiente',
    fechaRegistro: new Date().toISOString()
  };

  const pedidos = leerJSON(pedidosPath);
  pedidos.push(nuevoPedido);
  // 200 OK - Pedido registrado con exito
  if (escribirJSON(pedidosPath, pedidos)) {
    return res.status(201).json({
      mensaje: 'Pedido registrado con éxito.',
      pedido: nuevoPedido
    });
  } else {
    // 500 Internal Server Error - Error al guardar el pedido
    return res.status(500).json({ error: 'Error interno al guardar el pedido.' });
  }
});

// PUT /api/pedidos/:id - Actualizar estado de un pedido
router.put('/pedidos/:id', (req, res) => {
  const idPedido = parseInt(req.params.id);
  const { estado } = req.body;

  let pedidos = leerJSON(pedidosPath);
  const pedido = pedidos.find(p => p.idPedido === idPedido);

  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  pedido.estado = estado;

  if (escribirJSON(pedidosPath, pedidos)) {
    return res.status(200).json({ mensaje: 'Estado de pedido actualizado.', pedido });
  } else {
    return res.status(500).json({ error: 'Error al actualizar el pedido.' });
  }
});

// DELETE /api/pedidos/:id - Eliminar pedido
router.delete('/pedidos/:id', (req, res) => {
  const idPedido = parseInt(req.params.id);
  let pedidos = leerJSON(pedidosPath);

  // Filtrar los pedidos excluyendo el que coincida con el ID
  const pedidosFiltrados = pedidos.filter(p => p.idPedido !== idPedido);

  if (pedidos.length === pedidosFiltrados.length) {
    return res.status(404).json({ error: 'El pedido no fue encontrado.' });
  }

  if (escribirJSON(pedidosPath, pedidosFiltrados)) {
    return res.status(200).json({ mensaje: 'Pedido eliminado con éxito.' });
  } else {
    return res.status(500).json({ error: 'Error al intentar eliminar el pedido.' });
  }
});

// Endpoints para productos (/api/productos)


// GET /api/productos - Obtener catalogo de productos
router.get('/productos', (req, res) => {
  const productos = leerJSON(productosPath);
  res.status(200).json(productos);
});

// POST /api/productos - Agregar un nuevo producto
router.post('/productos', (req, res) => {
  const { nombre, categoria, ocasion, precio, descripcion, imagen } = req.body;

  if (!nombre || !categoria || !ocasion || !precio || !descripcion || !imagen) {
    // 400 Bad Request - Campos obligatorios faltantes
    return res.status(400).json({
      error: 'Todos los campos del producto son obligatorios.'
    });
  }

  const nuevoProducto = {
    id: Date.now(),
    nombre: nombre.trim(),
    categoria: Array.isArray(categoria) ? categoria : [categoria],
    ocasion,
    precio: parseFloat(precio),
    descripcion: descripcion.trim(),
    imagen
  };

  const productos = leerJSON(productosPath);
  productos.push(nuevoProducto);

  if (escribirJSON(productosPath, productos)) {
    return res.status(201).json({
      mensaje: 'Producto agregado exitosamente al catálogo.',
      producto: nuevoProducto
    });
  } else {
    // 500 Internal Server Error - Error al guardar el producto
    return res.status(500).json({ error: 'Error interno al guardar el producto.' });
  }
});

// DELETE /api/productos/:id - Eliminar un producto del catálogo
router.delete('/productos/:id', (req, res) => {
  const idProducto = parseInt(req.params.id);
  let productos = leerJSON(productosPath);

  const nuevosProductos = productos.filter(p => p.id !== idProducto);

  if (escribirJSON(productosPath, nuevosProductos)) {
    return res.status(200).json({ mensaje: 'Producto eliminado del catálogo.' });
  } else {
    return res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
});
module.exports = router;