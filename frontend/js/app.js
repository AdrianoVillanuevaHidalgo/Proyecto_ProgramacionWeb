////Catalogo HTML////

// URL base de los endpoints de la API RESTful
const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los elementos del DOM
  const contenedor = document.getElementById('contenedorProductos');
  const contadorResultados = document.getElementById('contadorResultados');
  const rangePrecio = document.getElementById('rangePrecio');
  const precioValor = document.getElementById('precioValor');
  const selectOrden = document.getElementById('selectOrden');
  const btnResetFiltros = document.getElementById('btnResetFiltros');

  // Si no estamos en catalogo.html, finaliza la ejecucion
  if (!contenedor) return;  

  // Leer parametros iniciales enviadas por la URL (desde index.html)
  const params = new URLSearchParams(window.location.search);
  const catURL = params.get('categoria');
  const ocasionURL = params.get('ocasion');
  const buscarURL = params.get('buscar');

  // Marcar los checkboxes correspondientes si vienen especificados en la URL
  if (catURL) {
    const chkCat = document.querySelector(`.filter-group input[value="${catURL}"]`);
    if (chkCat) chkCat.checked = true;
  }
  if (ocasionURL) {
    const chkOcasion = document.querySelector(`.filter-group input[value="${ocasionURL}"]`);
    if (chkOcasion) chkOcasion.checked = true;
  }

  // Peticion asincrona GET a la API RESTful para obtener los productos del servidor
  async function cargarProductosDesdeServidor() {
    try {
      const respuesta = await fetch(`${API_URL}/productos`);
      if (!respuesta.ok) throw new Error('Error al consultar el catalogo');
      const productos = await respuesta.json();
      aplicarFiltrosYOrden(productos);
    } catch (err) {
      console.error('Error:', err);
      contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="fs-5 text-danger">No se pudo conectar con el servidor para cargar el catalogo.</p>
        </div>
      `;
    }
  }

  // Función Principal de Filtrado
  function aplicarFiltrosYOrden(productos) {
    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('.filter-group input[id^="cat"]:checked')
    ).map(chk => chk.value);

    const ocasionesSeleccionadas = Array.from(
      document.querySelectorAll('.filter-group input[id^="ocasion"]:checked')
    ).map(chk => chk.value);

    const precioMaximo = parseFloat(rangePrecio.value);
    const criterioOrden = selectOrden.value;

    let resultados = productos.filter(prod => {
      const categoriasProd = Array.isArray(prod.categoria) ? prod.categoria : [prod.categoria];
      const ocasionesProd = Array.isArray(prod.ocasion) ? prod.ocasion : [prod.ocasion];

      const cumpleCategoria = categoriasSeleccionadas.length === 0 || 
        categoriasSeleccionadas.some(cat => categoriasProd.includes(cat));
        
      const cumpleOcasion = ocasionesSeleccionadas.length === 0 || 
        ocasionesSeleccionadas.some(oc => ocasionesProd.includes(oc));
        
      const cumplePrecio = prod.precio <= precioMaximo;

      const cumpleBusqueda = !buscarURL || prod.nombre.toLowerCase().includes(buscarURL.toLowerCase());

      return cumpleCategoria && cumpleOcasion && cumplePrecio && cumpleBusqueda;
    });

    // Ordenamiento
    if (criterioOrden === 'precio-asc') {
      resultados.sort((a, b) => a.precio - b.precio);
    } else if (criterioOrden === 'precio-desc') {
      resultados.sort((a, b) => b.precio - a.precio);
    }

    
    renderizarTarjetas(resultados);
  }

  //manipulacion del DOM
  function renderizarTarjetas(productos) {
    contenedor.innerHTML = '';
    contadorResultados.textContent = `Mostrando ${productos.length} producto(s) de catálogo`;

    if (productos.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="fs-5 text-muted">No se encontraron productos que coincidan con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    productos.forEach(prod => {
      const col = document.createElement('div');
      col.className = 'col';

      const categoriasArray = Array.isArray(prod.categoria) ? prod.categoria : [prod.categoria];
      const badgesHTML = categoriasArray
        .map(cat => `<span class="badge bg-secondary mb-2 me-1">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`)
        .join('');

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <div>${badgesHTML}</div>
              <h5 class="card-title fs-6 fw-bold">${prod.nombre}</h5>
              <p class="card-text text-muted fs-7">${prod.descripcion}</p>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="fw-bold text-success fs-5">S/ ${prod.precio.toFixed(2)}</span>
              <a href="formulario.html?producto=${prod.id}" class="btn btn-sm button-color text-white rounded-pill px-3">Pedir</a>
            </div>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });
  }
  // Event Listeners
    rangePrecio.addEventListener('input', (e) => {
      precioValor.textContent = `S/ ${e.target.value}`;
      cargarProductosDesdeServidor();
    });

    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', cargarProductosDesdeServidor);
    });

    selectOrden.addEventListener('change', cargarProductosDesdeServidor);

    btnResetFiltros.addEventListener('click', () => {
      document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(chk => chk.checked = false);
      rangePrecio.value = 150;
      precioValor.textContent = 'S/ 150';
      selectOrden.value = 'relevancia';
      cargarProductosDesdeServidor();
    });

    cargarProductosDesdeServidor();
});




//// Formulario HTML ////

document.addEventListener('DOMContentLoaded', () => {
  const formPedido = document.getElementById('form-pedido');
  const contenedorCarrito = document.getElementById('contenedor-carrito-items');
  const totalPrecioElemento = document.getElementById('carrito-total-precio');
  const mensajeFeedback = document.getElementById('mensaje-feedback');

  // Si no estamos en formulario.html, detenemos la ejecucion
  if (!formPedido || !contenedorCarrito) return;

  // Inicializar el carrito desde localStorage o procesar el parametro de la URL
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  // Funcion para inicializar la pagina del formulario y manejar el parametro de producto en la URL
  async function inicializarPaginaFormulario() {
  const params = new URLSearchParams(window.location.search);
  const idProductoURL = parseInt(params.get('producto'));

  // Si se accedio desde el catalogo con un producto especifico y no esta en el carrito, se agrega
  if (idProductoURL) {
    try {
    // Fetch para verificar si el producto existe en el servidor  
    const respuesta = await fetch(`${API_URL}/productos`);
    // Verificar si la respuesta fue exitosa  
    const inventario = await respuesta.json();
    const prodSeleccionado = inventario.find(p => p.id === idProductoURL);

    if (prodSeleccionado) {
        // Verificar si el producto ya esta en el carrito
        const existe = carrito.find(p => p.id === prodSeleccionado.id);
        
        if (existe) {
          // Si ya existe, incrementamos su cantidad
          existe.cantidad++;
        } else {
          // Si no existe, lo agregamos como un item nuevo
          carrito.push({
            ...prodSeleccionado,
            cantidad: 1,
            colorSeleccionado: 'Rojo' // Valor por defect
          });
        }

        // Guardar el carrito en localStorage y limpiar la URL para evitar recargas duplicadas
        localStorage.setItem('carrito', JSON.stringify(carrito));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
        console.error('Error al agregar el producto seleccionado al carrito:', err);
      }
    }
    renderizarCarrito();
  }
  // Guardar el estado actual del carrito en localStorage
  function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  // Renderizar los productos dentro de la columna del carrito
  function renderizarCarrito() {
    contenedorCarrito.innerHTML = '';

    if (carrito.length === 0) {
      contenedorCarrito.innerHTML = `
        <div class="text-center py-4">
          <p class="text-muted small mb-2">Tu carrito esta vacio.</p>
          <a href="catalogo.html" class="btn btn-sm btn-outline-success">Ir al catalogo</a>
        </div>
      `;
      totalPrecioElemento.textContent = 'S/ 0.00';
      return;
    }

    let total = 0;

    carrito.forEach((item, index) => {
      total += item.precio * item.cantidad;
      const categorias = Array.isArray(item.categoria) ? item.categoria : [item.categoria];
      const permiteColor = categorias.includes('cinta') || categorias.includes('limpiapipas');
      const selectorColorHTML = permiteColor ? `
        <div>
          <select class="form-select form-select-sm color-select" data-index="${index}" style="font-size: 0.75rem;">
            <option value="Rojo" ${item.colorSeleccionado === 'Rojo' ? 'selected' : ''}>Color: Rojo</option>
            <option value="Rosa" ${item.colorSeleccionado === 'Rosa' ? 'selected' : ''}>Color: Rosa</option>
            <option value="Azul" ${item.colorSeleccionado === 'Azul' ? 'selected' : ''}>Color: Azul</option>
            <option value="Amarillo" ${item.colorSeleccionado === 'Amarillo' ? 'selected' : ''}>Color: Amarillo</option>
          </select>
        </div>
      ` : `
        <div>
          <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.7rem;">Color estandar</span>
        </div>
      `;

      const itemCard = document.createElement('div');
      itemCard.className = 'card mb-3 border-light shadow-sm p-2';
      itemCard.innerHTML = `
        <div class="row g-2 align-items-center">
          <div class="col-3">
            <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded" style="object-fit: cover; height: 70px; width: 100%;">
          </div>
          <div class="col-9">
            <div class="d-flex justify-content-between align-items-start">
              <h3 class="h6 fw-bold mb-1 text-truncate" style="max-width: 140px;">${item.nombre}</h3>
              <span class="fw-bold text-success small">S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>

            <div class="d-flex align-items-center justify-content-between mt-2 gap-2">
              ${selectorColorHTML}
              <div class="input-group input-group-sm" style="width: 90px;">
                <button class="btn btn-outline-secondary px-2 btn-disminuir" data-index="${index}" type="button">-</button>
                <span class="form-control text-center px-1 bg-white fw-bold">${item.cantidad}</span>
                <button class="btn btn-outline-secondary px-2 btn-aumentar" data-index="${index}" type="button">+</button>
              </div>
            </div>
          </div>
        </div>
      `;

      contenedorCarrito.appendChild(itemCard);
    });

    totalPrecioElemento.textContent = `S/ ${total.toFixed(2)}`;
    asignarEventosCarrito();
  }

  // Asignar los listener para los botones
  function asignarEventosCarrito() {
    // Cambios de color
    document.querySelectorAll('.color-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = e.target.getAttribute('data-index');
        carrito[index].colorSeleccionado = e.target.value;
        guardarCarrito();
      });
    });

    // Boton aumentar
    document.querySelectorAll('.btn-aumentar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        carrito[index].cantidad++;
        guardarCarrito();
        renderizarCarrito();
      });
    });

    // Boton disminuir ,si llega a 0 se remueve
    document.querySelectorAll('.btn-disminuir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        carrito[index].cantidad--;
        
        if (carrito[index].cantidad <= 0) {
          carrito.splice(index, 1); // Remover del carrito
        }
        
        guardarCarrito();
        renderizarCarrito();
      });
    });
  }

  // Logica de envio y validacion del formulario con peticion POST al backend
  formPedido.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar si hay productos en el carrito antes de procesar el pedido
    if (carrito.length === 0) {
      mostrarFeedback('error', 'Debes tener al menos un producto en tu carrito para realizar el pedido.');
      return;
    }

    // Validar formulario
    if (!formPedido.checkValidity()) {
      e.stopPropagation();
      formPedido.classList.add('was-validated');
      mostrarFeedback('error', 'Por favor, completa todos los campos requeridos correctamente.');
      return;
    }

    // Capturar datos del cliente
    const payloadPedido = {
          cliente: document.getElementById('nombre').value.trim(),
          telefono: document.getElementById('telefono').value.trim(),
          fechaEntrega: document.getElementById('fecha-entrega').value,
          direccion: document.getElementById('direccion').value.trim(),
          mensaje: document.getElementById('mensaje').value.trim(),
          productos: carrito,
          total: totalPrecioElemento.textContent
        };

    try {
      // Petición POST asincrona hacia /api/pedidos
      const respuesta = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPedido)
      });
      
    const resultado = await respuesta.json();  

  if (respuesta.status === 201) {
          // Registro Exitoso (201 Created)
          mostrarFeedback('exito', '¡Gracias! Tu pedido ha sido registrado con éxito en nuestro servidor.');
          carrito = [];
          localStorage.removeItem('carrito');
          formPedido.reset();
          formPedido.classList.remove('was-validated');
          renderizarCarrito();
        } else {
          // Error de validación (400 Bad Request o 500)
          mostrarFeedback('error', resultado.error || 'No se pudo procesar la solicitud.');
        }
      } catch (error) {
        console.error('Error al enviar el pedido:', error);
        mostrarFeedback('error', 'Ocurrió un problema de conexión con el servidor.');
      }
    });

  // Funcion para mensajes de feedback
  function mostrarFeedback(tipo, mensaje) {
    mensajeFeedback.classList.remove('d-none', 'alert-danger', 'alert-success');
    if (tipo === 'exito') {
      mensajeFeedback.classList.add('alert', 'alert-success');
    } else {
      mensajeFeedback.classList.add('alert', 'alert-danger');
    }
    mensajeFeedback.textContent = mensaje;
  }

  inicializarPaginaFormulario();
});




///// Login HTML ///////

document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const loginFeedback = document.getElementById('login-feedback');

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const usuario = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (usuario === 'ritmodedetalles' && password === 'admin123') {
        sessionStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin.html';
      } else {
        loginFeedback.classList.remove('d-none');
        loginFeedback.className = 'alert alert-danger small mb-3';
        loginFeedback.textContent = 'Usuario o contraseña incorrectos. Verifica las credenciales de prueba.';
      }
    });
  }
});

/// Admin HTML ///

document.addEventListener('DOMContentLoaded', () => {
  const tbodyPedidos = document.getElementById('tbody-pedidos');
  const tbodyInventario = document.getElementById('tbody-inventario');
  const btnLogout = document.getElementById('btn-logout');

  // Si no estamos en admin.html, detener esta ejecucion
  if (!tbodyPedidos || !tbodyInventario) return;

  // Proteccion de ruta
  if (sessionStorage.getItem('isAdmin') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // Cerrar Sesion
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('isAdmin');
      window.location.href = 'login.html';
    });
  }

  ///Gestion de pedidos///
  async function cargarPedidosAdmin() {
    try {
      const respuesta = await fetch(`${API_URL}/pedidos`);
      const pedidos = await respuesta.json();
      
      tbodyPedidos.innerHTML = '';

      if (pedidos.length === 0) {
        tbodyPedidos.innerHTML = `
          <tr>
            <td colspan="8" class="text-center text-muted py-4">No hay pedidos registrados en el servidor.</td>
          </tr>
        `;
        return;
      }

      pedidos.forEach((ped) => {
        const tr = document.createElement('tr');
        const listaProdsHTML = ped.productos.map(p => {
          const colorTxt = p.colorSeleccionado ? ` (${p.colorSeleccionado})` : '';
          return `<div>• ${p.nombre}${colorTxt} x${p.cantidad}</div>`;
        }).join('');

        tr.innerHTML = `
          <td><small class="fw-bold">#${ped.idPedido}</small></td>
          <td>
            <div class="fw-bold">${ped.cliente}</div>
            <small class="text-muted">${ped.telefono}</small>
          </td>
          <td><small>${ped.fechaEntrega}</small></td>
          <td class="small">${listaProdsHTML}</td>
          <td><small class="text-italic">"${ped.mensaje}"</small></td>
          <td class="fw-bold text-success">${ped.total}</td>
          <td>
            <select class="form-select form-select-sm select-estado-pedido" data-id="${ped.idPedido}">
              <option value="Pendiente" ${ped.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="En Preparación" ${ped.estado === 'En Preparación' ? 'selected' : ''}>En Preparación</option>
              <option value="Atendido" ${ped.estado === 'Atendido' ? 'selected' : ''}>Atendido</option>
              <option value="Cancelado" ${ped.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </td>
          <td>
            <button class="btn btn-outline-danger btn-sm btn-eliminar-pedido" data-id="${ped.idPedido}" title="Eliminar pedido">🗑️</button>
          </td>
        `;

        tbodyPedidos.appendChild(tr);
      });

      asignarEventosPedidosAdmin();
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  }

  // ASIGNAR EVENTOS DE CAMBIO DE ESTADO Y ELIMINAR PEDIDO
  function asignarEventosPedidosAdmin() {
    // Escuchar cambio en el select de Estado
    document.querySelectorAll('.select-estado-pedido').forEach(select => {
      select.addEventListener('change', async (e) => {
        const idPedido = e.target.getAttribute('data-id');
        const nuevoEstado = e.target.value;

        try {
          await fetch(`${API_URL}/pedidos/${idPedido}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
          });
        } catch (err) {
          console.error('Error al cambiar el estado del pedido:', err);
        }
      });
    });

    // Boton eliminar pedido
    document.querySelectorAll('.btn-eliminar-pedido').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idPedido = e.target.getAttribute('data-id');
        if (confirm('¿Deseas eliminar este pedido del servidor?')) {
          try {
            await fetch(`${API_URL}/pedidos/${idPedido}`, { method: 'DELETE' });
            cargarPedidosAdmin();
          } catch (err) {
            console.error('Error al eliminar pedido:', err);
          }
        }
      });
    });
  }

  // Consultar,agregar y eliminar productos (/api/productos)
  async function cargarInventarioAdmin() {
    try {
      const respuesta = await fetch(`${API_URL}/productos`);
      const productos = await respuesta.json();

      tbodyInventario.innerHTML = '';

      productos.forEach((prod) => {
        const tr = document.createElement('tr');
        const cats = Array.isArray(prod.categoria) ? prod.categoria.join(', ') : prod.categoria;

        tr.innerHTML = `
          <td>
            <img src="${prod.imagen}" alt="${prod.nombre}" style="width: 45px; height: 45px; object-fit: cover;" class="rounded">
          </td>
          <td class="fw-semibold small">${prod.nombre}</td>
          <td><span class="badge bg-secondary extra-small">${cats}</span></td>
          <td class="fw-bold text-success small">S/ ${parseFloat(prod.precio).toFixed(2)}</td>
          <td>
            <button class="btn btn-outline-danger btn-sm btn-eliminar-prod" data-id="${prod.id}">Eliminar</button>
          </td>
        `;

        tbodyInventario.appendChild(tr);
      });

      asignarEventosProductosAdmin();
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    }
  }
  // Asignar eventos para eliminar productos del inventario
  function asignarEventosProductosAdmin() {
    document.querySelectorAll('.btn-eliminar-prod').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idProducto = e.target.getAttribute('data-id');
        if (confirm('¿Deseas eliminar este producto del catálogo?')) {
          try {
            await fetch(`${API_URL}/productos/${idProducto}`, { method: 'DELETE' });
            cargarInventarioAdmin();
          } catch (err) {
            console.error('Error al eliminar producto:', err);
          }
        }
      });
    });
  }
  const formProducto = document.getElementById('form-producto');
  const fileInput = document.getElementById('prod-imagen-file');
  const feedbackProducto = document.getElementById('feedback-producto');

  if (formProducto) {
    formProducto.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!formProducto.checkValidity()) {
        e.stopPropagation();
        formProducto.classList.add('was-validated');
        return;
      }

      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function (event) {
        const imagenBase64 = event.target.result;

        const categoriasArreglo = document.getElementById('prod-categoria').value
          .split(',')
          .map(c => c.trim().toLowerCase());

        const nuevoProducto = {
          nombre: document.getElementById('prod-nombre').value.trim(),
          categoria: categoriasArreglo,
          ocasion: document.getElementById('prod-ocasion').value,
          precio: parseFloat(document.getElementById('prod-precio').value),
          descripcion: document.getElementById('prod-descripcion').value.trim(),
          imagen: imagenBase64
        };

        try {
          const respuesta = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
          });

          if (respuesta.status === 201) {
            feedbackProducto.classList.remove('d-none');
            feedbackProducto.className = 'alert alert-success small mb-3';
            feedbackProducto.textContent = '¡Producto agregado con éxito al servidor!';

            formProducto.reset();
            formProducto.classList.remove('was-validated');
            cargarInventarioAdmin();

            setTimeout(() => {
              feedbackProducto.classList.add('d-none');
            }, 3000);
          }
        } catch (err) {
          console.error('Error al guardar producto:', err);
        }
      };

      reader.readAsDataURL(file);
    });
  }

  const btnRefrescar = document.getElementById('btn-refrescar-pedidos');
  if (btnRefrescar) {
    btnRefrescar.addEventListener('click', cargarPedidosAdmin);
  }

  cargarPedidosAdmin();
  cargarInventarioAdmin();
});