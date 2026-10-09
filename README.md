# 🌸 Ritmo de Detalles - Proyecto Web Integrador

Aplicación web cliente-servidor para la floristería **Ritmo de Detalles**, desarrollada como proyecto integrador bajo los estándares del curso de Programación Web (UPN).

El sistema permite a los usuarios consultar un catálogo dinámico de arreglos florales, personalizar su pedido y registrar solicitudes sin pasarela de pago. Asimismo, incluye un módulo de administración ficticio para gestionar pedidos e inventario en tiempo real.

---

## 🛠️ Tecnologías Utilizadas

* **Front-end:** HTML5 semántico, CSS3 personalizado, Bootstrap 5 (CDN) y JavaScript (ES6+ / Fetch API).
* **Back-end:** Node.js y Express.js.
* **Persistencia de Datos:** Archivos JSON locales (`pedidos.json` y `productos.json`) mediante el módulo nativo `fs` (File System) de Node.js.

---

## 📁 Estructura del Proyecto

```text
proyecto-integrador/
├── docs/
│   ├── [1.1]_toma_requerimientos.pdf
│   ├── [1.2]_decisiones_de_diseño.pdf
│   └── [1.3]_privacidad_y_etica.pdf
├── frontend/
│   ├── index.html
│   ├── catalogo.html
│   ├── formulario.html
│   ├── login.html
│   ├── admin.html
│   ├── css/
│   │   └── styles.css
│   ├── img/
│   │   └── logo.jpg
│   └── js/
│       └── app.js
├── backend/
│   ├── data/
│   │   ├── pedidos.json
│   │   └── productos.json
│   ├── routes/
│   │   └── api.js
│   ├── server.js
│   └── package.json
├── [1.6]_reflexion_curricular.pdf
└── README.md
```
---

## 🚀 Instrucciones de Instalación y Ejecución Local

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

### 1. Requisitos Previos
Tener instalado **Node.js** (versión 16.x o superior) y **npm** en la computadora.

### 2. Instalación de Dependencias
Abre la terminal de comandos, navega hasta la carpeta del backend e instala las dependencias:
```bash
cd backend
npm install
```
### 3. Iniciar el Servidor
Ejecuta el comando para arrancar el servidor web de Express:
```bash
npm start
```
### 4. Acceso en el Navegador
Abre cualquier navegador web e ingresa a la siguiente URL:
👉 **http://localhost:3000**

---

## 🔑 Credenciales de Acceso Administrativo

Para acceder al Panel de Administración (http://localhost:3000/login.html):

* **Usuario:** ritmodedetalles
* **Contraseña:** admin123

---

## 📡 Endpoints de la API RESTful (/api)

### 1. Pedidos (/api/pedidos)

* **GET /api/pedidos**
  * **Descripción:** Obtiene la lista completa de pedidos registrados en pedidos.json.
  * **Respuesta (200 OK):**
```json
    [
      {
        "idPedido": 1791541496248,
        "cliente": "Juan Jose",
        "telefono": "900953645",
        "fechaEntrega": "2026-12-10",
        "direccion": "Av Eucaliptos, San Martin de porres",
        "mensaje": "Feliz aniversario",
        "productos": [
          {
            "id": 1791541444164,
            "nombre": "Ramo de Rosas de Limpiapipas",
            "precio": 25,
            "cantidad": 2,
            "colorSeleccionado": "Rojo"
          }
        ],
        "total": "S/ 50.00",
        "estado": "Cancelado",
        "fechaRegistro": "2026-10-09T10:24:56.248Z"
      }
    ]
```
* **POST /api/pedidos**
  * **Descripción:** Registra un nuevo pedido.
  * **Ejemplo de Cuerpo de la Solicitud (JSON):**
```json
    {
      "cliente": "María García",
      "telefono": "987654321",
      "fechaEntrega": "2026-12-10",
      "direccion": "Av. Perú 1234, San Martín de Porres",
      "mensaje": "Con mucho cariño para ti",
      "productos": [
        {
          "id": 1,
          "nombre": "Ramo de Rosas de Cinta Roja",
          "precio": 25,
          "cantidad": 1,
          "colorSeleccionado": "Rojo"
        }
      ],
      "total": "S/ 25.00"
    }
```    
  * **Respuestas HTTP:**
    * **201 Created**: Pedido registrado exitosamente.
    * **400 Bad Request**: Solicitud incompleta o faltan campos obligatorios.

* **PUT /api/pedidos/:id**
  * **Descripción:** Actualiza el estado de un pedido (Pendiente, En Preparación, Atendido, Cancelado).

* **DELETE /api/pedidos/:id**
  * **Descripción:** Elimina un pedido por su ID del archivo pedidos.json.

---

### 2. Productos (/api/productos)

* **GET /api/productos**
  * **Descripción:** Devuelve la lista del catálogo guardada en productos.json.

* **POST /api/productos**
  * **Descripción:** Agrega un nuevo producto desde el panel administrativo.
  * **Ejemplo de Cuerpo de la Solicitud (JSON):**
```json  
    {
      "nombre": "Girasoles",
      "categoria": ["cinta"],
      "ocasion": "cumpleanos",
      "precio": 35.00,
      "descripcion": "Arreglo brillante de girasoles.",
      "imagen": "data:image/jpeg;base64,..."
    }
```

* **DELETE /api/productos/:id**
  * **Descripción:** Elimina un producto del catálogo por su ID.

---

## 🔒 Privacidad por Diseño (Ley N.º 29733)

El proyecto cumple con la política de minimización de datos de la Ley de Protección de Datos Personales (Ley N.º 29733):
* No se solicitan datos financieros ni tarjetas de crédito/débito.
* Todos los datos recolectados (nombres, teléfonos, direcciones) son ficticios y procesados únicamente para la simulación de entrega del pedido.

---

**Curso:** Programación Web — Universidad Privada del Norte (UPN)  
**Año:** 2026