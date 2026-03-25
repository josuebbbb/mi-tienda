let productos = JSON.parse(localStorage.getItem("productos")) || [];
let compras = JSON.parse(localStorage.getItem("compras")) || [];

// 🔹 Guardar productos y compras
function guardar() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

// 🔹 Eliminar producto
function eliminarProducto(index) {
  if (confirm(`¿Eliminar el producto "${productos[index].nombre}"?`)) {
    productos.splice(index, 1); // Borra del array
    guardar(); // Guarda cambios en localStorage
    mostrarProductos(); // Refresca la lista
  }
}

function guardarCompras() {
  localStorage.setItem("compras", JSON.stringify(compras));
}

// 🔹 Cálculo de venta y stock
function calcularVenta(p) {
  return (p.compra * (1 + p.margen)).toFixed(2);
}

function calcularStock(p) {
  if (p.tipo === "cajas") return p.cajas * p.unidadesPorCaja;
  else return p.unidades;
}

// 🔹 Agregar automático a compras
function agregarACompras(p) {
  let existe = compras.find(c => c.nombre === p.nombre);
  if (!existe) {
    compras.push({
      nombre: p.nombre,
      fecha: new Date().toLocaleString()
    });
    guardarCompras();
  }
}

// 🔹 Mostrar lista de compras
function mostrarCompras() {
  let lista = document.getElementById("compras");
  lista.innerHTML = "";

  compras.forEach((c, index) => {
    let item = document.createElement("li");
    item.classList.add("agotado");
    item.innerHTML = `
      ${c.nombre} <br>
      <small>${c.fecha}</small>
      <button onclick="eliminarCompra(${index})">✔</button>
    `;
    lista.appendChild(item);
  });
}

function eliminarCompra(i) {
  compras.splice(i, 1);
  guardarCompras();
  mostrarCompras();
}

// 🔹 Mostrar productos con buscador y estilo
function mostrarProductos(filtro = "") {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";

  productos.forEach((p, index) => {
    if (!p.nombre.toLowerCase().includes(filtro)) return;

    let venta = calcularVenta(p);
    let total = calcularStock(p);
    let detalle = p.tipo === "cajas" ? `${p.cajas} cajas (${p.unidadesPorCaja})` : `${p.unidades} unidades`;
    let nombreBonito = p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1);

    // Color según estado
    let colorEstado = p.estado === "agotado" ? "#e74c3c" : p.estado === "poco stock" ? "#f39c12" : "#27ae60";

    let item = document.createElement("li");

    item.innerHTML = `
      <div style="font-family: Arial, sans-serif; background: #fdfdfd; border-radius: 10px; padding: 15px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <strong style="font-size: 22px; color: #2c3e50;">${nombreBonito}</strong><br><br>
        
        <div style="font-size: 18px; color: #16a085;">Compra: $${p.compra}</div>
        
        <div style="margin: 10px 0; text-align: center;">
          <span style="color: #e67e22; font-weight: bold;">Venta:</span> 
          <input type="number" id="ventaInput${index}" value="${venta}" 
            style="width: 100px; text-align: center; font-size: 16px; padding: 3px; border-radius: 5px; border: 1px solid #ccc;">
          <button onclick="cambiarVenta(${index})" style="font-size: 16px; padding: 4px 8px; margin-left: 5px; border-radius: 5px; cursor: pointer;">💾 Guardar</button>
        </div>

        <div style="font-size: 16px; color: ${colorEstado}; font-weight: bold;">
          Stock: ${detalle} → ${total} (${p.estado})
        </div><br>

        <button style="padding: 5px 10px; margin-right: 5px; font-size: 16px;" onclick="noHay(${index})">❌ No hay</button>
        <button style="padding: 5px 10px; margin-right: 5px; font-size: 16px;" onclick="poco(${index})">⚠️ Poco</button>
        <button style="padding: 5px 10px; margin-right: 5px; font-size: 16px;" onclick="eliminarProducto(${index})">🗑️ Eliminar</button>
        <button style="padding: 5px 10px; font-size: 16px;" onclick="actualizar(${index})">🔄 Actualizar</button>
      </div>
    `;

    lista.appendChild(item);
  });
}

// 🔹 Filtrar productos
function filtrarProductos() {
  let texto = document.getElementById("buscador").value.toLowerCase();
  mostrarProductos(texto);
}

// 🔹 Agregar producto
function agregarProducto() {
  let nombre = prompt("Nombre:");
  if (nombre) nombre = nombre.toLowerCase();

  let compra = prompt("Precio compra:");
  if (!nombre || !compra) return;

  let tipo = prompt("¿Cajas? (si/no)");

  let producto = {
    nombre,
    compra: parseFloat(compra),
    margen: 0.15,
    estado: "disponible"
  };

  if (tipo.toLowerCase() === "si") {
    producto.tipo = "cajas";
    producto.cajas = parseInt(prompt("Cajas:")) || 0;
    producto.unidadesPorCaja = parseInt(prompt("Unidades por caja:")) || 0;
  } else {
    producto.tipo = "unidades";
    producto.unidades = parseInt(prompt("Unidades:")) || 0;
  }

  productos.push(producto);
  guardar();
  mostrarProductos();
}

// 🔹 Cambiar estado y stock
function noHay(i) {
  let p = productos[i];
  if (p.tipo === "cajas") p.cajas = 0;
  else p.unidades = 0;
  p.estado = "agotado";
  agregarACompras(p);
  guardar();
  mostrarProductos();
  mostrarCompras();
}

function poco(i) {
  productos[i].estado = "poco stock";
  guardar();
  mostrarProductos();
}

// 🔹 Actualizar producto manual
function actualizar(i) {
  let p = productos[i];

  let compra = prompt("Precio compra:", p.compra);
  if (compra) p.compra = parseFloat(compra);

  let margen = prompt("Margen:", p.margen);
  if (margen) p.margen = parseFloat(margen);

  if (p.tipo === "cajas") {
    let cajas = prompt("Cajas:", p.cajas);
    let unidadesCaja = prompt("Unidades por caja:", p.unidadesPorCaja);
    if (cajas) p.cajas = parseInt(cajas);
    if (unidadesCaja) p.unidadesPorCaja = parseInt(unidadesCaja);
  } else {
    let unidades = prompt("Unidades:", p.unidades);
    if (unidades) p.unidades = parseInt(unidades);
  }

  let total = calcularStock(p);

  if (total === 0) {
    p.estado = "agotado";
    agregarACompras(p);
  } else if (total < 5) {
    p.estado = "poco stock";
  } else {
    p.estado = "disponible";
  }

  guardar();
  mostrarProductos();
  mostrarCompras();
}

// 🔹 Cambiar precio de venta desde input
function cambiarVenta(index) {
  const nuevaVenta = document.getElementById(`ventaInput${index}`).value;
  if (!isNaN(nuevaVenta) && nuevaVenta > 0) {
    productos[index].margen = (parseFloat(nuevaVenta) / productos[index].compra) - 1;
    guardar();
    mostrarProductos();
  } else {
    alert("Ingresa un precio válido");
  }
}

// 🔹 Inicializar
mostrarProductos();
mostrarCompras();