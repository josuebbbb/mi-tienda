<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestión de Productos</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f4f4f4;
    }
    h1, h2 { text-align: center; }
    .container {
      display: flex;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .panel {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      flex: 1;
    }
    .categorias { flex: 1; }
    .productos { flex: 2; }

    .carpeta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin: 5px 0;
      background: #e3f2fd;
      border-radius: 5px;
      cursor: pointer;
    }
    .carpeta:hover { background: #bbdefb; }

    input, button {
      padding: 8px;
      margin: 5px 0;
    }
    button {
      cursor: pointer;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover { background: #1565c0; }
    .btn-eliminar {
      background: #d32f2f;
      padding: 5px 8px;
      font-size: 12px;
    }
    .btn-eliminar:hover { background: #b71c1c; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th { background: #1976d2; color: white; }
  </style>
</head>
<body>

  <h1>📦 Gestión de Productos</h1>

  <div class="container">
    <!-- Panel de Categorías -->
    <div class="panel categorias">
      <h2>Categorías</h2>
      <input type="text" id="buscadorCategorias" placeholder="Buscar categoría..." onkeyup="filtrarCategorias()">
      <button onclick="agregarCategoria()">+ Nueva Categoría</button>
      
      <div id="categorias"></div>
    </div>

    <!-- Panel de Productos -->
    <div class="panel productos">
      <h2 id="tituloProductos">Productos</h2>
      
      <div id="formularioProducto" style="display: none;">
        <input type="text" id="nombreProducto" placeholder="Nombre del producto">
        <input type="number" id="precioProducto" placeholder="Precio" step="0.01">
        <button onclick="agregarProducto()">Agregar Producto</button>
      </div>

      <table id="tablaProductos">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>

  <script>
    // ==================== DATOS ====================
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
    let categoriaActual = null;

    // ==================== FUNCIONES ====================
    function capitalizar(texto) {
      return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    function guardar() {
      localStorage.setItem("productos", JSON.stringify(productos));
      localStorage.setItem("categorias", JSON.stringify(categorias));
    }

    // ==================== CATEGORÍAS ====================
    function agregarCategoria() {
      let nombre = prompt("Nombre de la categoría:");
      if (!nombre || nombre.trim() === "") return;

      nombre = capitalizar(nombre.trim());

      if (categorias.includes(nombre)) {
        alert("Esa categoría ya existe");
        return;
      }

      categorias.push(nombre);
      guardar();
      mostrarCategorias();
    }

    function eliminarCategoria(cat) {
      if (!confirm(`¿Eliminar la categoría "${cat}" y todos sus productos?`)) return;

      categorias = categorias.filter(c => c !== cat);
      productos = productos.filter(p => p.categoria !== cat);

      if (categoriaActual === cat) {
        categoriaActual = null;
        document.getElementById("tituloProductos").textContent = "Productos";
        document.getElementById("formularioProducto").style.display = "none";
      }

      guardar();
      mostrarCategorias();
      mostrarProductos();
    }

    function verCategoria(cat) {
      categoriaActual = cat;
      document.getElementById("tituloProductos").textContent = `Productos - ${cat}`;
      document.getElementById("formularioProducto").style.display = "block";
      mostrarProductos();
    }

    function filtrarCategorias() {
      let texto = document.getElementById("buscadorCategorias").value.toLowerCase().trim();
      let cont = document.getElementById("categorias");
      cont.innerHTML = "";

      const filtradas = categorias.filter(cat => cat.toLowerCase().includes(texto));

      if (filtradas.length === 0) {
        cont.innerHTML = `<p style="color:gray; padding:10px;">No se encontraron categorías</p>`;
        return;
      }

      filtradas.forEach(cat => {
        let div = document.createElement("div");
        div.className = "carpeta";
        div.innerHTML = `
          <span onclick="verCategoria('${cat}')">${cat}</span>
          <button onclick="eliminarCategoria('${cat}')" class="btn-eliminar">🗑</button>
        `;
        cont.appendChild(div);
      });
    }

    function mostrarCategorias() {
      filtrarCategorias();
    }

    // ==================== PRODUCTOS ====================
    function agregarProducto() {
      if (!categoriaActual) return;

      const nombre = document.getElementById("nombreProducto").value.trim();
      const precio = parseFloat(document.getElementById("precioProducto").value);

      if (!nombre || isNaN(precio)) {
        alert("Completa nombre y precio correctamente");
        return;
      }

      productos.push({
        id: Date.now(),
        nombre: capitalizar(nombre),
        precio: precio,
        categoria: categoriaActual
      });

      guardar();
      mostrarProductos();

      // Limpiar formulario
      document.getElementById("nombreProducto").value = "";
      document.getElementById("precioProducto").value = "";
    }

    function eliminarProducto(id) {
      if (!confirm("¿Eliminar este producto?")) return;
      productos = productos.filter(p => p.id !== id);
      guardar();
      mostrarProductos();
    }

    function mostrarProductos() {
      const tbody = document.querySelector("#tablaProductos tbody");
      tbody.innerHTML = "";

      const productosFiltrados = productos.filter(p => p.categoria === categoriaActual);

      if (productosFiltrados.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="3" style="text-align:center; color:gray;">No hay productos en esta categoría</td>`;
        tbody.appendChild(tr);
        return;
      }

      productosFiltrados.forEach(prod => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${prod.nombre}</td>
          <td>$${prod.precio.toFixed(2)}</td>
          <td><button onclick="eliminarProducto(${prod.id})" class="btn-eliminar">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
      });
    }

    // ==================== INICIO ====================
    window.onload = function() {
      mostrarCategorias();

      // Si hay categorías, selecciona la primera automáticamente (opcional)
      if (categorias.length > 0) {
        verCategoria(categorias[0]);
      }
    };
  </script>
</body>
</html>
