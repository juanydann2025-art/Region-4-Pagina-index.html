/* =========================================================
   INFORMES
   ========================================================= */

const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyQIpdzQUZ5QVmOHxvY5xmA9CHtmF0HIUPy0ewA9fN-G_A273ExbS0kTnjiE7JxHEBHFw/exec";

let ultimoInformeFechas = null;
let ultimoInformeSeccion = null;
let ultimoInformeUsuario = null;
let usuariosInformeCargados = false;


function $(id) {
  return document.getElementById(id);
}


function mostrarMensaje(texto, error = false) {
  const elemento = $("mensaje");
  elemento.textContent = texto;
  elemento.className = error ? "mensaje error" : "mensaje exito";
}


function ocultarMensaje() {
  $("mensaje").className = "mensaje oculto";
}


function obtenerUsuario() {
  return localStorage.getItem("usuario") || "";
}


async function postJSON(datos) {

  const respuesta = await fetch(URL_APPS_SCRIPT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(datos)
  });

  const texto = await respuesta.text();

  let json;

  try {
    json = JSON.parse(texto);
  } catch (e) {
    throw new Error("El servidor devolvió una respuesta no válida.");
  }

  if (!json.ok) {
    throw new Error(json.mensaje || "No se pudo completar la operación.");
  }

  return json;
}


function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function esFoto(encabezado) {
  const h = String(encabezado || "").toLowerCase();
  return h.includes("url") ||
         h.includes("foto") ||
         h.includes("imagen") ||
         h.includes("evidencia") ||
         h.includes("ine frente") ||
         h.includes("ine atras");
}


function formatearValor(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}


function renderResumen(contenedor, resultados, etiquetaExtra = "") {
  let total = 0;
  const usuarios = {};

  resultados.forEach(r => {
    total += r.filas.length;
    const indiceUsuario = (r.resumen && r.resumen.indiceUsuario >= 0)
      ? r.resumen.indiceUsuario
      : -1;

    r.filas.forEach(fila => {
      const usuario = indiceUsuario >= 0
        ? String(fila[indiceUsuario] || "Sin usuario")
        : "Sin usuario";
      usuarios[usuario] = (usuarios[usuario] || 0) + 1;
    });
  });

  const tarjetasUsuarios = Object.entries(usuarios)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([usuario, cantidad]) => `
      <div class="mini-tarjeta">
        <span>${escaparHTML(usuario)}</span>
        <strong>${cantidad}</strong>
      </div>
    `).join("");

  contenedor.innerHTML = `
    <div class="tarjeta-total">
      <span>Total de registros</span>
      <strong>${total}</strong>
      ${etiquetaExtra ? `<small>${escaparHTML(etiquetaExtra)}</small>` : ""}
    </div>
    ${tarjetasUsuarios}
  `;
}


function renderResultados(contenedor, resultados, modo = "fechas") {

  if (!resultados || resultados.length === 0) {
    contenedor.innerHTML = `
      <div class="sin-registros">
        <i class="fa-solid fa-circle-info"></i>
        No se encontraron registros para los criterios seleccionados.
      </div>
    `;
    return;
  }

  let html = "";

  resultados.forEach(resultado => {

    const headers = resultado.encabezados || [];
    const filas = resultado.filas || [];

    let indices = headers.map((_, i) => i).filter(i => !esFoto(headers[i]));

    if (modo === "seccion" && resultado.categoria === "Ciudadanos") {
      const buscar = palabras => headers.findIndex(h => palabras.some(p => String(h).toLowerCase().includes(p)));
      const preferidos = [
        buscar(["folio"]),
        buscar(["fecha"]),
        buscar(["nombre"]),
        buscar(["usuario"]),
        buscar(["seccion"]),
        buscar(["comunidad"])
      ].filter(i => i >= 0);
      indices = [...new Set(preferidos)];
    } else if (indices.length > 9) {
      indices = indices.slice(0, 9);
    }

    html += `
      <div class="categoria-resultado">
        <div class="categoria-header">
          <div>
            <h3>${escaparHTML(resultado.categoria)}</h3>
            <span>${filas.length} registro(s)</span>
          </div>
        </div>
    `;

    if (filas.length === 0) {
      html += `<div class="sin-registros pequeno">Sin registros.</div></div>`;
      return;
    }

    html += `<div class="tabla-responsive"><table><thead><tr>`;
    indices.forEach(i => {
      html += `<th>${escaparHTML(headers[i])}</th>`;
    });
    html += `</tr></thead><tbody>`;

    filas.forEach(fila => {
      html += `<tr>`;
      indices.forEach(i => {
        html += `<td>${escaparHTML(formatearValor(fila[i]))}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;

    if (modo === "seccion" && resultado.categoria === "Ciudadanos") {
      html += `
        <div class="nota-ciudadanos">
          <i class="fa-solid fa-calendar-check"></i>
          En este apartado la columna <strong>Fecha</strong> corresponde a la fecha de registro del ciudadano.
        </div>
      `;
    }

    html += `</div>`;
  });

  contenedor.innerHTML = html;
}


async function consultarFechas() {
  ocultarMensaje();

  const fechaInicio = $("fechaInicio").value;
  const fechaFin = $("fechaFin").value;
  const categoria = $("categoria").value;
  const boton = $("btnConsultarFechas");

  if (!fechaInicio || !fechaFin) {
    mostrarMensaje("Seleccione la fecha inicial y final.", true);
    return;
  }

  if (fechaInicio > fechaFin) {
    mostrarMensaje("La fecha inicial no puede ser mayor que la fecha final.", true);
    return;
  }

  boton.disabled = true;
  boton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Consultando...`;

  try {
    const respuesta = await postJSON({
      accion: "obtenerInformeFechas",
      usuario: obtenerUsuario(),
      fechaInicio,
      fechaFin,
      categoria
    });

    ultimoInformeFechas = {
      fechaInicio,
      fechaFin,
      categoria
    };

    renderResumen(
      $("resumenFechas"),
      respuesta.resultados,
      `${fechaInicio} al ${fechaFin}`
    );

    renderResultados(
      $("resultadoFechas"),
      respuesta.resultados,
      "fechas"
    );

    $("btnPdfFechas").disabled = false;
    mostrarMensaje("Informe generado correctamente.");
  } catch (error) {
    mostrarMensaje(error.message, true);
    $("btnPdfFechas").disabled = true;
  } finally {
    boton.disabled = false;
    boton.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Generar informe`;
  }
}


async function consultarSeccion() {
  ocultarMensaje();

  const seccion = $("seccion").value.trim();
  const boton = $("btnConsultarSeccion");

  if (!seccion) {
    mostrarMensaje("Escriba una sección.", true);
    return;
  }

  boton.disabled = true;
  boton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Consultando...`;

  try {
    const respuesta = await postJSON({
      accion: "obtenerInformeSeccion",
      usuario: obtenerUsuario(),
      seccion
    });

    ultimoInformeSeccion = { seccion };

    renderResumen(
      $("resumenSeccion"),
      respuesta.resultados,
      `Sección ${seccion}`
    );

    renderResultados(
      $("resultadoSeccion"),
      respuesta.resultados,
      "seccion"
    );

    $("btnPdfSeccion").disabled = false;
    mostrarMensaje("Informe de sección generado correctamente.");
  } catch (error) {
    mostrarMensaje(error.message, true);
    $("btnPdfSeccion").disabled = true;
  } finally {
    boton.disabled = false;
    boton.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Consultar sección`;
  }
}


function descargarBase64(base64, nombre, mimeType) {
  if (!base64) throw new Error("El servidor no devolvió el archivo.");

  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);

  const blob = new Blob([bytes], { type: mimeType || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre || "informe";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}


async function exportarArchivo(tipo, formato) {
  ocultarMensaje();

  let datos = null;
  let contenedor = null;
  let boton = null;

  if (tipo === "fechas") {
    if (!ultimoInformeFechas) {
      mostrarMensaje("Primero genere el informe por fechas.", true);
      return;
    }
    datos = {
      usuario: obtenerUsuario(),
      tipo: "fechas",
      ...ultimoInformeFechas
    };
    contenedor = $("resultadoFechas");
    boton = $(formato === "pdf" ? "btnPdfFechas" : "btnExcelFechas");
  } else if (tipo === "seccion") {
    if (!ultimoInformeSeccion) {
      mostrarMensaje("Primero consulte la sección.", true);
      return;
    }
    datos = {
      usuario: obtenerUsuario(),
      tipo: "seccion",
      seccion: ultimoInformeSeccion.seccion
    };
    contenedor = $("resultadoSeccion");
    boton = $(formato === "pdf" ? "btnPdfSeccion" : "btnExcelSeccion");
  } else {
    if (!ultimoInformeUsuario) {
      mostrarMensaje("Primero consulte el usuario.", true);
      return;
    }
    datos = {
      usuario: obtenerUsuario(),
      tipo: "usuario",
      usuarioBuscado: ultimoInformeUsuario.usuarioBuscado
    };
    contenedor = $("resultadoUsuario");
    boton = $(formato === "pdf" ? "btnPdfUsuario" : formato === "xlsx" ? "btnExcelUsuario" : "btnWordUsuario");
  }

  datos.accion = formato === "pdf"
    ? "exportarInformePDF"
    : formato === "xlsx"
      ? "exportarInformeExcel"
      : "exportarInformeWord";

  const textoOriginal = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generando...`;

  try {
    const respuesta = await postJSON(datos);
    descargarBase64(respuesta.base64, respuesta.nombre, respuesta.mimeType);
    mostrarMensaje(`${formato.toUpperCase()} descargado correctamente.`);
  } catch (error) {
    mostrarMensaje(error.message, true);
  } finally {
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
  }
}


async function exportarPDF(tipo) {
  return exportarArchivo(tipo, "pdf");
}


async function consultarUsuario() {
  ocultarMensaje();

  const select = $("usuarioInforme");
  const usuarioBuscado = select.value.trim();
  const boton = $("btnConsultarUsuario");

  if (!usuarioBuscado) {
    mostrarMensaje("Seleccione un usuario.", true);
    return;
  }

  boton.disabled = true;
  boton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Consultando...`;

  try {
    const respuesta = await postJSON({
      accion: "obtenerInformeUsuario",
      usuario: obtenerUsuario(),
      usuarioBuscado
    });

    ultimoInformeUsuario = { usuarioBuscado };

    renderResumen(
      $("resumenUsuario"),
      respuesta.resultados,
      `Usuario: ${usuarioBuscado}`
    );

    renderResultados(
      $("resultadoUsuario"),
      respuesta.resultados,
      "usuario"
    );

    $("btnPdfUsuario").disabled = false;
    $("btnExcelUsuario").disabled = false;
    $("btnWordUsuario").disabled = false;
    mostrarMensaje("Informe por usuario generado correctamente.");
  } catch (error) {
    ultimoInformeUsuario = null;
    $("btnPdfUsuario").disabled = true;
    $("btnExcelUsuario").disabled = true;
    $("btnWordUsuario").disabled = true;
    mostrarMensaje(error.message, true);
  } finally {
    boton.disabled = false;
    boton.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Consultar usuario`;
  }
}


async function cargarUsuariosInforme() {
  if (usuariosInformeCargados) return;

  const select = $("usuarioInforme");
  select.innerHTML = `<option value="">Cargando usuarios...</option>`;

  try {
    const respuesta = await postJSON({
      accion: "obtenerUsuariosInforme",
      usuario: obtenerUsuario()
    });

    select.innerHTML = `<option value="">Seleccione un usuario...</option>`;

    (respuesta.usuarios || []).forEach(u => {
      const option = document.createElement("option");
      option.value = u.usuario;
      option.textContent = `${u.nombre || u.usuario} — ${u.usuario}${u.rol ? " — " + u.rol : ""}`;
      select.appendChild(option);
    });

    usuariosInformeCargados = true;
  } catch (error) {
    select.innerHTML = `<option value="">No se pudieron cargar los usuarios</option>`;
    mostrarMensaje(error.message, true);
  }
}


function configurarPestanas() {
  document.querySelectorAll(".pestana").forEach(boton => {
    boton.addEventListener("click", () => {
      document.querySelectorAll(".pestana").forEach(b => b.classList.remove("activa"));
      boton.classList.add("activa");

      const tab = boton.dataset.tab;
      $("tabFechas").classList.toggle("oculto", tab !== "fechas");
      $("tabSeccion").classList.toggle("oculto", tab !== "seccion");
      $("tabUsuario").classList.toggle("oculto", tab !== "usuario");
      ocultarMensaje();

      if (tab === "usuario") cargarUsuariosInforme();
    });
  });
}


function inicializar() {
  configurarPestanas();

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const hoyTexto = `${yyyy}-${mm}-${dd}`;

  $("fechaInicio").value = hoyTexto;
  $("fechaFin").value = hoyTexto;

  $("btnConsultarFechas").addEventListener("click", consultarFechas);
  $("btnConsultarSeccion").addEventListener("click", consultarSeccion);
  $("btnConsultarUsuario").addEventListener("click", consultarUsuario);

  $("btnPdfFechas").addEventListener("click", () => exportarArchivo("fechas", "pdf"));
  $("btnExcelFechas").addEventListener("click", () => exportarArchivo("fechas", "xlsx"));

  $("btnPdfSeccion").addEventListener("click", () => exportarArchivo("seccion", "pdf"));
  $("btnExcelSeccion").addEventListener("click", () => exportarArchivo("seccion", "xlsx"));

  $("btnPdfUsuario").addEventListener("click", () => exportarArchivo("usuario", "pdf"));
  $("btnExcelUsuario").addEventListener("click", () => exportarArchivo("usuario", "xlsx"));
  $("btnWordUsuario").addEventListener("click", () => exportarArchivo("usuario", "doc"));
}


document.addEventListener("DOMContentLoaded", inicializar);
