let productos = JSON.parse(localStorage.getItem("productos")) || [];
let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

let categoriaActual = null;

// 🔹 CAPITALIZAR
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// 🔹 Guardar
function guardar() {
  localStorage.setItem("productos", JSON.stringify(productos));
  localStorage.setItem("categorias", JSON.stringify(categorias));
}

// 🔹 Crear categoría
function agregarCategoria() {
  let nombre = prompt("Nombre de la categoría:");
  if (!nombre) return;

  nombre = capitalizar(nombre.toLowerCase());

  categorias.push(nombre);
  guardar();
  mostrarCategorias();
}

// 🔹 ELIMINAR CATEGORIA
function eliminarCategoria(cat) {
  if (!confirm("¿Eliminar categoría y sus productos?")) return;

  categorias = categorias.filter(c => c !== cat);
  productos = productos.filter(p => p.categoria !== cat);

  guardar();
  mostrarCategorias();
}

// 🔍 FILTRAR CATEGORÍAS
function filtrarCategorias() {
  let texto = document.getElementById("buscadorCategorias").value.toLowerCase();

  let cont = document.getElementById("categorias");
  cont.innerHTML = "";

  categorias.forEach(cat => {
    if (!cat.toLowerCase().includes(texto)) return;

    let div = document.createElement("div");
    div.className = "carpeta";

    div.innerHTML = `
      <span class="eliminar-cat" onclick="event.stopPropagation(); eliminarCategoria('${cat}')">✖</span>
      📁<br><strong>${capitalizar(cat)}</strong>
    `;

    div.onclick = () => abrirCategoria(cat);

    cont.appendChild(div);
  });
}

// 🔹 Mostrar categorías
function mostrarCategorias() {
  let cont = document.getElementById("categorias");
  cont.innerHTML = "";

  categorias.forEach(cat => {
    let div = document.createElement("div");
    div.className = "carpeta";

    div.innerHTML = `
      <span class="eliminar-cat" onclick="event.stopPropagation(); eliminarCategoria('${cat}')">✖</span>
      📁<br><strong>${capitalizar(cat)}</strong>
    `;

    div.onclick = () => abrirCategoria(cat);

    cont.appendChild(div);
  });

  mostrarAgotados();
}

// 🔴 Mostrar agotados
function mostrarAgotados() {
  let cont = document.getElementById("agotados");
  cont.innerHTML = "<h3>❌ Productos agotados</h3>";

  let hay = false;

  productos.forEach((p, index) => {
    if (p.estado === "agotado" && !p.comprado) {
      let div = document.createElement("div");

      div.innerHTML = `
        • ${capitalizar(p.nombre)} (${p.categoria})
        <button onclick="marcarComprado(${index})">✔</button>
      `;

      cont.appendChild(div);
      hay = true;
    }
  });

  if (!hay) cont.innerHTML += "<p>✔ Todo comprado</p>";
}

// 🔹 Marcar comprado
function marcarComprado(i) {
  productos[i].comprado = true;
  guardar();
  mostrarCategorias();
}

// 🔹 Abrir categoría
function abrirCategoria(cat) {
  categoriaActual = cat;

  document.getElementById("categorias").style.display = "none";
  document.getElementById("agotados").style.display = "none";
  document.getElementById("productosVista").style.display = "block";

  document.getElementById("titulo").innerText = "📁 " + capitalizar(cat);

  mostrarProductos();
}

// 🔙 Volver
function volver() {
  document.getElementById("categorias").style.display = "grid";
  document.getElementById("agotados").style.display = "block";
  document.getElementById("productosVista").style.display = "none";

  mostrarCategorias();
}

// 🔹 Calcular
function calcularVenta(p) {
  return (p.compra * (1 + p.margen)).toFixed(2);
}

function calcularStock(p) {
  return p.tipo === "cajas"
    ? p.cajas * p.unidadesPorCaja
    : p.unidades;
}

// 🔹 Estado automático
function actualizarEstado(p) {
  let total = calcularStock(p);

  if (total === 0) {
    p.estado = "agotado";
    p.comprado = false;
  } else if (total < 5) {
    p.estado = "poco";
  } else {
    p.estado = "disponible";
  }
}

// 🔍 FILTRAR PRODUCTOS
function filtrarProductos() {
  let texto = document.getElementById("buscadorProductos").value.toLowerCase();
  mostrarProductos(texto);
}

// 🔹 Mostrar productos
function mostrarProductos(filtro = "") {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";

  productos.forEach((p, index) => {
    if (p.categoria !== categoriaActual) return;
    if (!p.nombre.toLowerCase().includes(filtro)) return;

    let venta = calcularVenta(p);
    let total = calcularStock(p);

    let detalle = p.tipo === "cajas"
      ? `${p.cajas} cajas (${p.unidadesPorCaja})`
      : `${p.unidades} unidades`;

    let color =
      p.estado === "agotado" ? "#e74c3c" :
      p.estado === "poco" ? "#f39c12" :
      "#27ae60";

    let li = document.createElement("li");

    li.innerHTML = `
      <div style="border-left:5px solid ${color};padding:10px;">
        
        <strong>${capitalizar(p.nombre)}</strong><br><br>

        Compra: $${p.compra}<br>

        Venta:
        <input type="number" id="venta${index}" value="${venta}" style="width:80px;">
        <button onclick="cambiarVenta(${index})">💾</button><br><br>

        Stock: ${detalle} → ${total} (${p.estado})<br><br>

        ${p.tipo === "cajas" ? `
        Cajas:
        <input type="number" id="cajas${index}" value="${p.cajas}" style="width:60px;">
        Unid/Caja:
        <input type="number" id="unidadCaja${index}" value="${p.unidadesPorCaja}" style="width:60px;">
        <button onclick="guardarCajas(${index})">💾</button>
        <br><br>
        ` : `
        Unidades:
        <input type="number" id="unidades${index}" value="${p.unidades}" style="width:60px;">
        <button onclick="guardarUnidades(${index})">💾</button>
        <br><br>
        `}

        <button onclick="restarUno(${index})">➖ 1</button>
<button onclick="noHay(${index})">❌ No hay</button>
<button onclick="poco(${index})">⚠️ Poco</button>
<button onclick="actualizar(${index})">🔄 Actualizar</button>
<button onclick="eliminarProducto(${index})">🗑️</button>
      </div>
    `;

    lista.appendChild(li);
  });
}

// 🔹 Guardar cajas directo
function guardarCajas(i) {
  let p = productos[i];

  p.cajas = parseInt(document.getElementById(`cajas${i}`).value) || 0;
  p.unidadesPorCaja = parseInt(document.getElementById(`unidadCaja${i}`).value) || 0;

  actualizarEstado(p);
  guardar();
  mostrarProductos();
}

// 🔹 Guardar unidades directo
function guardarUnidades(i) {
  let p = productos[i];

  p.unidades = parseInt(document.getElementById(`unidades${i}`).value) || 0;

  actualizarEstado(p);
  guardar();
  mostrarProductos();
}

// 🔹 Agregar producto
function agregarProducto() {
  let nombre = prompt("Nombre:");
  let compra = prompt("Precio compra:");
  let tipo = prompt("¿Cajas? (si/no)");

  if (!nombre || !compra) return;

  let producto = {
    nombre: capitalizar(nombre.toLowerCase()),
    compra: parseFloat(compra),
    margen: 0.2,
    estado: "disponible",
    categoria: categoriaActual,
    comprado: false
  };

  if (tipo.toLowerCase() === "si") {
    producto.tipo = "cajas";
    producto.cajas = parseInt(prompt("Cajas:")) || 0;
    producto.unidadesPorCaja = parseInt(prompt("Unidades por caja:")) || 0;
  } else {
    producto.tipo = "unidades";
    producto.unidades = parseInt(prompt("Unidades:")) || 0;
  }

  actualizarEstado(producto);

  productos.push(producto);
  guardar();
  mostrarProductos();
}

// 🔹 Actualizar clásico (se mantiene)
function actualizar(i) {
  let p = productos[i];

  let compra = prompt("Precio compra:", p.compra);
  if (compra !== null) p.compra = parseFloat(compra);

  let margen = prompt("Margen:", p.margen);
  if (margen !== null) p.margen = parseFloat(margen);

  actualizarEstado(p);

  guardar();
  mostrarProductos();
}

// 🔹 Cambiar venta
function cambiarVenta(i) {
  let nueva = document.getElementById(`venta${i}`).value;

  if (nueva > 0) {
    productos[i].margen =
      (parseFloat(nueva) / productos[i].compra) - 1;

    guardar();
    mostrarProductos();
  }
}

// 🔹 Estados
function noHay(i) {
  let p = productos[i];

  if (p.tipo === "cajas") p.cajas = 0;
  else p.unidades = 0;

  actualizarEstado(p);

  guardar();
  mostrarProductos();
}

function poco(i) {
  productos[i].estado = "poco";
  guardar();
  mostrarProductos();
}

// 🔹 Eliminar producto
function eliminarProducto(i) {
  productos.splice(i, 1);
  guardar();
  mostrarProductos();
}

function vender(i) {
  let p = productos[i];

  if (p.tipo === "cajas") {
    // Convertimos todo a unidades
    let total = p.cajas * p.unidadesPorCaja;

    if (total > 0) {
      total -= 1; // vende 1 unidad

      // recalcular cajas
      p.cajas = Math.floor(total / p.unidadesPorCaja);
    }

  } else {
    if (p.unidades > 0) {
      p.unidades -= 1;
    }
  }

  // 🔥 ACTUALIZAR ESTADO AUTOMÁTICO
  let totalFinal = calcularStock(p);

  if (totalFinal === 0) {
    p.estado = "agotado";
    p.comprado = false;
  } else if (totalFinal < 5) {
    p.estado = "poco";
  } else {
    p.estado = "disponible";
  }

  guardar();
  mostrarProductos();
}

function restarUno(i) {
  let p = productos[i];

  if (p.tipo === "cajas") {
    // total en unidades
    let total = p.cajas * p.unidadesPorCaja;

    if (total > 0) {
      total -= 1;

      // recalcular cajas
      p.cajas = Math.floor(total / p.unidadesPorCaja);
    }

  } else {
    if (p.unidades > 0) {
      p.unidades -= 1;
    }
  }

 

// 🔹 Inicio
mostrarCategorias();
