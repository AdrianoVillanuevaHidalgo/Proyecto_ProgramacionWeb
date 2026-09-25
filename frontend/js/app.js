// Inventario de productos
const inventarioProductos = [
  {
    id: 1,
    nombre: "Ramo de Rosas de Cinta Roja",
    categoria: ["cinta"],
    ocasion: "cumpleanos",
    precio: 25.00,
    descripcion: "Ideal para regalos duraderos y celebraciones.",
    imagen: "img/productos/producto_1.jpg"
  },
  {
    id: 2,
    nombre: "Ramo de Rosas de Cinta Rosa con Peluche",
    categoria: ["cinta", "peluches"],
    ocasion: "aniversario",
    precio: 30.00,
    descripcion: "Ideal para regalos duraderos y aniversarios especiales.",
    imagen: "img/productos/producto_2.jpg"
  },
  {
    id: 3,
    nombre: "Canasta de Celebración",
    categoria: ["canastas"],
    ocasion: "celebraciones",
    precio: 35.00,
    descripcion: "Ideal para celebraciones especiales.",
    imagen: "img/productos/producto_3.jpg"
  },
  {
    id: 4,
    nombre: "Ramo de Rosas de Limpiapipas",
    categoria: ["limpiapipas"],
    ocasion: "aniversario",
    precio: 25.00,
    descripcion: "Ideal para aniversarios y San Valentín.",
    imagen: "img/productos/producto_4.jpg"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los elementos del DOM
  const contenedor = document.getElementById('contenedorProductos');
  const contadorResultados = document.getElementById('contadorResultados');
  const rangePrecio = document.getElementById('rangePrecio');
  const precioValor = document.getElementById('precioValor');
  const selectOrden = document.getElementById('selectOrden');
  const btnResetFiltros = document.getElementById('btnResetFiltros');

  // Si no estamos en catalogo.html, finaliza la ejecución
  if (!contenedor) return;

  // Leer parámetros iniciales enviadas por la URL (desde index.html)
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

  // Event Listeners
  rangePrecio.addEventListener('input', (e) => {
    precioValor.textContent = `S/ ${e.target.value}`;
    aplicarFiltrosYOrden();
  });

  const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
  checkboxes.forEach(chk => chk.addEventListener('change', aplicarFiltrosYOrden));

  selectOrden.addEventListener('change', aplicarFiltrosYOrden);

  btnResetFiltros.addEventListener('click', () => {
    checkboxes.forEach(chk => chk.checked = false);
    rangePrecio.value = 150;
    precioValor.textContent = 'S/ 150';
    selectOrden.value = 'relevancia';
    aplicarFiltrosYOrden();
  });

  // Función Principal de Filtrado
  function aplicarFiltrosYOrden() {
    const categoriasSeleccionadas = Array.from(
      document.querySelectorAll('.filter-group input[id^="cat"]:checked')
    ).map(chk => chk.value);

    const ocasionesSeleccionadas = Array.from(
      document.querySelectorAll('.filter-group input[id^="ocasion"]:checked')
    ).map(chk => chk.value);

    const precioMaximo = parseFloat(rangePrecio.value);
    const criterioOrden = selectOrden.value;

    let resultados = inventarioProductos.filter(prod => {
      // Formatear categorías y ocasiones a arreglos por consistencia
      const categoriasProd = Array.isArray(prod.categoria) ? prod.categoria : [prod.categoria];
      const ocasionesProd = Array.isArray(prod.ocasion) ? prod.ocasion : [prod.ocasion];

      // Filtro de Categoría (Soporta productos multicategoría)
      const cumpleCategoria = categoriasSeleccionadas.length === 0 || 
        categoriasSeleccionadas.some(cat => categoriasProd.includes(cat));
        
      // Filtro de Ocasión
      const cumpleOcasion = ocasionesSeleccionadas.length === 0 || 
        ocasionesSeleccionadas.some(oc => ocasionesProd.includes(oc));
        
      // Filtro de Rango de Precio
      const cumplePrecio = prod.precio <= precioMaximo;

      // Filtro de Búsqueda por Texto
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

  //Función de Manipulación del DOM
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

      // Convertir categorías en badges badges HTML dinámicos
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


  aplicarFiltrosYOrden();
});