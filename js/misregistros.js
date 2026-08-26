// ================================================================
// CONFIGURACIÓN
// ================================================================

const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyQIpdzQUZ5QVmOHxvY5xmA9CHtmF0HIUPy0ewA9fN-G_A273ExbS0kTnjiE7JxHEBHFw/exec";

const META_CIUDADANOS = 90;


// ================================================================
// VARIABLES
// ================================================================

let categoriaActual = "ciudadanos";

let filtros = {};

let registrosCache = {};

let registroRealizadoActual = null;


// ================================================================
// INICIAR
// ================================================================

document.addEventListener(
  "DOMContentLoaded",
  iniciar
);


function iniciar() {

  const usuario =
    obtenerUsuario();

  if (!usuario) {
    return;
  }

  const nombre =
    localStorage.getItem("nombre") ||
    usuario;

  const usuarioActivo =
    document.getElementById(
      "usuarioActivo"
    );

  if (usuarioActivo) {

    usuarioActivo.textContent =
      `${nombre} · ${usuario}`;

  }

  seleccionarCategoria(
    "ciudadanos"
  );

}


// ================================================================
// OBTENER USUARIO
// ================================================================

function obtenerUsuario() {

  const usuario =
    (
      localStorage.getItem("usuario") ||
      ""
    ).trim();

  if (!usuario) {

    alert(
      "No existe una sesión activa."
    );

    window.location =
      "index.html";

    return "";

  }

  return usuario;

}


// ================================================================
// CAMBIAR CATEGORÍA
// ================================================================

async function seleccionarCategoria(
  categoria
) {

  categoriaActual =
    categoria;

  document
    .querySelectorAll(".pestana")
    .forEach(
      function(btn) {

        btn.classList.toggle(
          "activa",
          btn.dataset.categoria === categoria
        );

      }
    );

  if (
    categoria === "avance"
  ) {

    await cargarDatosCiudadanos();

    mostrarAvance();

    return;

  }

  construirSubPestanas(
    categoria
  );

  await cargarCategoria(
    categoria
  );

}


// ================================================================
// SUBPESTAÑAS
// ================================================================

function construirSubPestanas(
  categoria
) {

  const cont =
    document.getElementById(
      "subPestanas"
    );

  if (!cont) {
    return;
  }

  if (
    categoria === "ciudadanos"
  ) {

    cont.innerHTML = `

      <button
        type="button"
        class="subpestana activa"
        onclick="aplicarFiltro('todos',this)"
      >
        Todos
        <span id="cntTodos">0</span>
      </button>

      <button
        type="button"
        class="subpestana"
        onclick="aplicarFiltro('pendientes',this)"
      >
        Pendientes por votar
        <span id="cntPendientes">0</span>
      </button>

      <button
        type="button"
        class="subpestana"
        onclick="aplicarFiltro('votaron',this)"
      >
        Votaron
        <span id="cntVotaron">0</span>
      </button>

    `;

    filtros[categoria] =
      "todos";

    return;

  }

  cont.innerHTML = `

    <button
      type="button"
      class="subpestana activa"
      onclick="aplicarFiltro('todos',this)"
    >
      Todos
    </button>

    <button
      type="button"
      class="subpestana"
      onclick="aplicarFiltro('pendientes',this)"
    >
      Pendientes
    </button>

  `;

  filtros[categoria] =
    "todos";

}


// ================================================================
// CARGAR CATEGORÍA
// ================================================================

async function cargarCategoria(
  categoria
) {

  const usuario =
    obtenerUsuario();

  if (!usuario) {
    return;
  }

  mostrarCargando(
    "Consultando registros..."
  );

  try {

    const resultado =
      await postJSON({

        accion:
          "obtenerMisRegistros",

        usuario:
          usuario,

        categoria:
          categoria

      });

    if (
      !resultado ||
      !resultado.ok
    ) {

      throw new Error(
        resultado?.mensaje ||
        "No se pudieron obtener los registros."
      );

    }

    const registros =
      resultado.registros ||
      [];

    registrosCache[categoria] =
      registros;

    if (
      categoria === "ciudadanos"
    ) {

      actualizarResumenCiudadanos(
        registros
      );

      revisarInactividad(
        registros
      );

    }

    actualizarContadores(
      categoria,
      registros
    );

    mostrarFiltrados();

  }
  catch(error) {

    mostrarError(
      error?.message ||
      "No se pudieron consultar los registros."
    );

  }

}


// ================================================================
// CARGAR CIUDADANOS
// ================================================================

async function cargarDatosCiudadanos() {

  if (
    registrosCache.ciudadanos
  ) {

    return;

  }

  await cargarCategoria(
    "ciudadanos"
  );

}


// ================================================================
// FILTRO
// ================================================================

function aplicarFiltro(
  filtro,
  boton
) {

  filtros[categoriaActual] =
    filtro;

  document
    .querySelectorAll(".subpestana")
    .forEach(
      function(b) {

        b.classList.remove(
          "activa"
        );

      }
    );

  if (boton) {

    boton.classList.add(
      "activa"
    );

  }

  mostrarFiltrados();

}


// ================================================================
// MOSTRAR FILTRADOS
// ================================================================

function mostrarFiltrados() {

  const registros =
    registrosCache[
      categoriaActual
    ] || [];

  const filtro =
    filtros[
      categoriaActual
    ] || "todos";

  let lista =
    registros;

  if (
    categoriaActual === "ciudadanos"
  ) {

    lista =
      registros.filter(
        function(r) {

          const voto =
            normalizar(
              r.votar ||
              r.voto ||
              "PENDIENTE"
            );

          if (
            filtro === "pendientes"
          ) {

            return (
              voto !== "si" &&
              voto !== "voto"
            );

          }

          if (
            filtro === "votaron"
          ) {

            return (
              voto === "si" ||
              voto === "voto"
            );

          }

          return true;

        }
      );

  }
  else if (
    filtro === "pendientes"
  ) {

    lista =
      registros.filter(
        function(r) {

          return (
            normalizar(
              r.estatus ||
              r.estado ||
              "PENDIENTE"
            ) ===
            "pendiente"
          );

        }
      );

  }

  renderRegistros(
    lista,
    categoriaActual
  );

}


// ================================================================
// CONTADORES
// ================================================================

function actualizarContadores(
  categoria,
  registros
) {

  if (
    categoria !== "ciudadanos"
  ) {

    return;

  }

  let pendientes =
    0;

  let votaron =
    0;

  registros.forEach(
    function(r) {

      const voto =
        normalizar(
          r.votar ||
          r.voto ||
          "PENDIENTE"
        );

      if (
        voto === "si" ||
        voto === "voto"
      ) {

        votaron++;

      }
      else {

        pendientes++;

      }

    }
  );

  setText(
    "cntTodos",
    registros.length
  );

  setText(
    "cntPendientes",
    pendientes
  );

  setText(
    "cntVotaron",
    votaron
  );

  setText(
    "totalVotaron",
    votaron
  );

}


// ================================================================
// RESUMEN
// ================================================================

function actualizarResumenCiudadanos(
  registros
) {

  const total =
    registros.length;

  const porcentaje =
    Math.min(
      100,
      (
        total /
        META_CIUDADANOS
      ) * 100
    );

  const faltan =
    Math.max(
      0,
      META_CIUDADANOS -
      total
    );

  setText(
    "totalCiudadanos",
    `${total} / ${META_CIUDADANOS}`
  );

  setText(
    "porcentajeAvance",
    `${porcentaje.toFixed(1)}%`
  );

  setText(
    "faltanCiudadanos",
    faltan
  );

  setText(
    "textoProgreso",
    `${total} de ${META_CIUDADANOS}`
  );

  const barra =
    document.getElementById(
      "barraProgreso"
    );

  if (barra) {

    barra.style.width =
      `${porcentaje}%`;

  }

  if (
    total >= META_CIUDADANOS
  ) {

    setText(
      "mensajeProgreso",
      "¡Meta de 90 ciudadanos cumplida!"
    );

  }
  else if (
    total === 0
  ) {

    setText(
      "mensajeProgreso",
      "Comienza a registrar ciudadanos para avanzar hacia tu meta."
    );

  }
  else {

    setText(
      "mensajeProgreso",
      `Te faltan ${faltan} ciudadanos para llegar a la meta.`
    );

  }

}


// ================================================================
// AVISO
// ================================================================

function revisarInactividad(
  registros
) {

  const aviso =
    document.getElementById(
      "avisoInactividad"
    );

  if (!aviso) {
    return;
  }

  if (
    !registros ||
    !registros.length
  ) {

    aviso.classList.remove(
      "oculto"
    );

    return;

  }

  const fechas =
    registros
      .map(
        function(r) {

          return parseFecha(
            r.fecha
          );

        }
      )
      .filter(Boolean)
      .sort(
        function(a,b) {

          return b - a;

        }
      );

  if (!fechas.length) {

    aviso.classList.add(
      "oculto"
    );

    return;

  }

  const ultima =
    fechas[0];

  const dias =
    (
      Date.now() -
      ultima.getTime()
    ) /
    86400000;

  if (
    dias >= 2
  ) {

    aviso.classList.remove(
      "oculto"
    );

  }
  else {

    aviso.classList.add(
      "oculto"
    );

  }

}


// ================================================================
// CERRAR AVISO
// ================================================================

function cerrarAviso() {

  const aviso =
    document.getElementById(
      "avisoInactividad"
    );

  if (aviso) {

    aviso.classList.add(
      "oculto"
    );

  }

}


// ================================================================
// MI AVANCE
// ================================================================

function mostrarAvance() {

  const sub =
    document.getElementById(
      "subPestanas"
    );

  if (sub) {

    sub.innerHTML =
      "";

  }

  const registros =
    registrosCache.ciudadanos ||
    [];

  const total =
    registros.length;

  let votaron =
    0;

  registros.forEach(
    function(r) {

      const voto =
        normalizar(
          r.votar ||
          r.voto ||
          ""
        );

      if (
        voto === "si" ||
        voto === "voto"
      ) {

        votaron++;

      }

    }
  );

  const pendientes =
    total -
    votaron;

  const porcentaje =
    Math.min(
      100,
      total /
      META_CIUDADANOS *
      100
    );

  const faltan =
    Math.max(
      0,
      META_CIUDADANOS -
      total
    );

  document.getElementById(
    "listaRegistros"
  ).innerHTML = `

    <div class="avance-grid">

      <div class="avance-box grande">

        <span>
          Ciudadanos registrados
        </span>

        <strong>
          ${total}
        </strong>

        <small>
          de ${META_CIUDADANOS}
        </small>

      </div>

      <div class="avance-box">

        <span>
          Porcentaje
        </span>

        <strong>
          ${porcentaje.toFixed(1)}%
        </strong>

      </div>

      <div class="avance-box">

        <span>
          Faltan
        </span>

        <strong>
          ${faltan}
        </strong>

      </div>

      <div class="avance-box">

        <span>
          Votaron
        </span>

        <strong>
          ${votaron}
        </strong>

      </div>

      <div class="avance-box">

        <span>
          Pendientes por votar
        </span>

        <strong>
          ${pendientes}
        </strong>

      </div>

    </div>

    <div class="avance-detalle">

      <div class="avance-detalle-cabecera">

        <div>

          <span class="eyebrow">
            SEGUIMIENTO PERSONAL
          </span>

          <h2>
            Meta de 90 ciudadanos
          </h2>

        </div>

        <strong>
          ${porcentaje.toFixed(1)}%
        </strong>

      </div>

      <div class="barra grande">

        <div
          style="width:${porcentaje}%"
        ></div>

      </div>

      <p>

        ${
          total >= META_CIUDADANOS

          ? "¡Excelente! Ya alcanzaste la meta de 90 ciudadanos."

          : `Necesitas registrar ${faltan} ciudadano(s) más para alcanzar la meta.`

        }

      </p>

    </div>

  `;

}


// ================================================================
// RENDERIZAR
// ================================================================

function renderRegistros(
  registros,
  categoria
) {

  const cont =
    document.getElementById(
      "listaRegistros"
    );

  if (!cont) {
    return;
  }

  if (
    !registros ||
    !registros.length
  ) {

    cont.innerHTML = `

      <div class="vacio">

        <i class="fa-regular fa-folder-open"></i>

        <h3>
          No hay registros
        </h3>

        <p>
          No existen registros en esta categoría o filtro.
        </p>

      </div>

    `;

    return;

  }

  cont.innerHTML =
    registros
      .map(
        function(r, i) {

          if (
            categoria === "ciudadanos"
          ) {

            return tarjetaCiudadano(
              r,
              i
            );

          }

          if (
            categoria === "peticiones"
          ) {

            return tarjetaPeticion(
              r
            );

          }

          if (
            categoria === "operaciones"
          ) {

            return tarjetaOperacion(
              r
            );

          }

          if (
            categoria === "bardas"
          ) {

            return tarjetaBarda(
              r
            );

          }

          if (
            categoria === "reuniones"
          ) {

            return tarjetaReunion(
              r
            );

          }

          return "";

        }
      )
      .join("");

}


// ================================================================
// ESTADO REALIZACIÓN
// ================================================================

function obtenerEstadoRealizacion(
  r
) {

  return normalizar(
    r.realizado ||
    r.estatusRealizado ||
    r.estadoRealizado ||
    r.estatus ||
    r.estado ||
    "PENDIENTE"
  );

}


function estaRealizado(
  r
) {

  const estado =
    obtenerEstadoRealizacion(
      r
    );

  return (
    estado === "realizado" ||
    estado === "realizada" ||
    estado === "completado" ||
    estado === "completada"
  );

}


// ================================================================
// BLOQUE REALIZACIÓN
// ================================================================

function htmlRealizacion(
  r
) {

  if (
    !estaRealizado(r)
  ) {

    return `

      <div class="zona-realizacion">

        <button
          type="button"
          class="btn-realizar-registro"
          onclick="abrirModalRealizadoPorFolio('${escAtributo(r.folio)}')"
        >

          <i class="fa-solid fa-circle-check"></i>

          Marcar como realizado

        </button>

      </div>

    `;

  }

  const fecha =
    r.fechaRealizado ||
    r.fechaRealizacion ||
    r.realizadoFecha ||
    "";

  const comentario =
    r.comentarioRealizado ||
    r.comentario ||
    r.realizadoComentario ||
    "";

  const foto =
    r.fotoRealizado ||
    r.fotoEvidencia ||
    r.evidencia ||
    r.urlEvidencia ||
    r.urlFotoRealizado ||
    "";

  return `

    <div class="realizacion-completa">

      <div class="realizacion-info">

        <i class="fa-solid fa-circle-check"></i>

        <div>

          <strong>
            REALIZADO
          </strong>

          ${
            fecha
              ? `
                <small>
                  Fecha: ${esc(fecha)}
                </small>
              `
              : ""
          }

        </div>

      </div>

      ${
        comentario
          ? `
            <p>
              <b>Comentario:</b>
              ${esc(comentario)}
            </p>
          `
          : ""
      }

      ${
        foto
          ? `
            <button
              type="button"
              class="ver-evidencia"
              onclick="abrirModalEvidencia('${escAtributo(r.folio)}')"
            >

              <i class="fa-solid fa-image"></i>

              Ver evidencia

            </button>
          `
          : ""
      }

    </div>

  `;

}


// ================================================================
// TARJETA CIUDADANO
// ================================================================

function tarjetaCiudadano(
  r,
  indice
) {

  const voto =
    normalizar(
      r.votar ||
      r.voto ||
      "PENDIENTE"
    );

  const votado =
    voto === "si" ||
    voto === "voto";

  return `

    <article class="registro">

      <div class="registro-top">

        <span class="folio">
          ${esc(r.folio || "")}
        </span>

        <span
          class="estado ${
            votado
              ? "ok"
              : "pendiente"
          }"
        >

          ${
            votado
              ? "VOTÓ"
              : "PENDIENTE"
          }

        </span>

      </div>

      <h3>
        ${esc(r.nombre || "Sin nombre")}
      </h3>

      <div class="datos">

        <span>
          <b>Edad:</b>
          ${esc(r.edad)}
        </span>

        <span>
          <b>Sexo:</b>
          ${esc(r.sexo)}
        </span>

        <span>
          <b>Teléfono:</b>
          ${esc(r.telefono)}
        </span>

        <span>
          <b>Sección:</b>
          ${esc(r.seccion)}
        </span>

        <span>
          <b>Comunidad:</b>
          ${esc(r.comunidad)}
        </span>

        <span>
          <b>Dirección:</b>
          ${esc(r.calle)}
          ${esc(r.numero)}
        </span>

      </div>

      <div class="registro-pie">

        <span>

          <i class="fa-regular fa-calendar"></i>

          ${esc(r.fecha || "")}

        </span>

        <button
          type="button"
          class="btn-votar ${
            votado
              ? "deshacer"
              : ""
          }"
          onclick="cambiarVotacionPorFolio('${escAtributo(r.folio)}')"
        >

          <i
            class="fa-solid ${
              votado
                ? "fa-rotate-left"
                : "fa-check"
            }"
          ></i>

          ${
            votado
              ? "Marcar pendiente"
              : "Marcar que votó"
          }

        </button>

      </div>

    </article>

  `;

}


// ================================================================
// PETICIÓN
// ================================================================

function tarjetaPeticion(
  r
) {

  return `

    <article class="registro">

      <div class="registro-top">

        <span class="folio">
          ${esc(r.folio)}
        </span>

        <span class="estado ${
          estaRealizado(r)
            ? "realizado"
            : "pendiente"
        }">

          ${
            estaRealizado(r)
              ? "REALIZADO"
              : esc(
                  r.estatus ||
                  r.estado ||
                  "PENDIENTE"
                )
          }

        </span>

      </div>

      <h3>
        ${esc(
          r.tipo ||
          "Petición"
        )}
      </h3>

      <div class="datos">

        <span>
          <b>Fecha:</b>
          ${esc(r.fecha)}
        </span>

        <span>
          <b>Sección:</b>
          ${esc(r.seccion)}
        </span>

        <span>
          <b>Comunidad:</b>
          ${esc(r.comunidad)}
        </span>

        <span class="ancho">

          <b>Justificación:</b>

          ${esc(
            r.justificacion ||
            r.otro ||
            ""
          )}

        </span>

      </div>

      ${htmlRealizacion(r)}

    </article>

  `;

}


// ================================================================
// LONA
// ================================================================

function tarjetaOperacion(
  r
) {

  return tarjetaGenerica(
    r,
    "Lona"
  );

}


// ================================================================
// BARDA
// ================================================================

function tarjetaBarda(
  r
) {

  return `

    <article class="registro">

      <div class="registro-top">

        <span class="folio">
          ${esc(r.folio)}
        </span>

        <span class="estado ${
          estaRealizado(r)
            ? "realizado"
            : "pendiente"
        }">

          ${
            estaRealizado(r)
              ? "REALIZADO"
              : esc(
                  r.estatus ||
                  r.estado ||
                  "PENDIENTE"
                )
          }

        </span>

      </div>

      <h3>
        ${esc(
          r.tipo ||
          "Barda"
        )}
      </h3>

      <div class="datos">

        <span>
          <b>Fecha:</b>
          ${esc(r.fecha)}
        </span>

        <span>
          <b>Sección:</b>
          ${esc(r.seccion)}
        </span>

        <span>
          <b>Comunidad:</b>
          ${esc(r.comunidad)}
        </span>

        <span>
          <b>Medidas:</b>
          ${esc(r.alto)}
          ×
          ${esc(r.ancho)}
        </span>

        <span>
          <b>Superficie:</b>
          ${esc(
            r.metros ||
            r.superficie ||
            ""
          )}
          m²
        </span>

      </div>

      ${htmlRealizacion(r)}

    </article>

  `;

}


// ================================================================
// REUNIÓN
// ================================================================

function tarjetaReunion(
  r
) {

  return tarjetaGenerica(
    r,
    "Reunión"
  );

}


// ================================================================
// TARJETA GENERAL
// ================================================================

function tarjetaGenerica(
  r,
  titulo
) {

  return `

    <article class="registro">

      <div class="registro-top">

        <span class="folio">
          ${esc(r.folio)}
        </span>

        <span class="estado ${
          estaRealizado(r)
            ? "realizado"
            : "pendiente"
        }">

          ${
            estaRealizado(r)
              ? "REALIZADO"
              : esc(
                  r.estatus ||
                  r.estado ||
                  "PENDIENTE"
                )
          }

        </span>

      </div>

      <h3>
        ${esc(
          r.tipo ||
          titulo
        )}
      </h3>

      <div class="datos">

        <span>
          <b>Fecha:</b>
          ${esc(r.fecha)}
        </span>

        <span>
          <b>Sección:</b>
          ${esc(r.seccion)}
        </span>

        <span>
          <b>Comunidad:</b>
          ${esc(r.comunidad)}
        </span>

        <span>
          <b>Calle:</b>
          ${esc(r.calle)}
          ${esc(r.numero)}
        </span>

      </div>

      ${htmlRealizacion(r)}

    </article>

  `;

}


// ================================================================
// ABRIR MODAL POR FOLIO
// ================================================================

function abrirModalRealizadoPorFolio(
  folio
) {

  const registros =
    registrosCache[
      categoriaActual
    ] || [];

  const registro =
    registros.find(
      function(r) {

        return String(
          r.folio || ""
        ) === String(
          folio || ""
        );

      }
    );

  if (!registro) {

    alert(
      "No se encontró el registro seleccionado."
    );

    return;

  }

  abrirModalRealizado(
    registro,
    categoriaActual
  );

}


// ================================================================
// ABRIR MODAL
// ================================================================

function abrirModalRealizado(
  registro,
  categoria
) {

  registroRealizadoActual =
    registro;

  const modal =
    document.getElementById(
      "modalRealizado"
    );

  if (!modal) {
    return;
  }

  const folio =
    registro.folio ||
    "";

  const info =
    document.getElementById(
      "infoRegistroRealizado"
    );

  if (info) {

    info.innerHTML = `

      <strong>
        ${esc(
          registro.tipo ||
          registro.nombre ||
          categoria
        )}
      </strong>

      <small>
        Folio: ${esc(folio)}
      </small>

    `;

  }

  setValue(
    "realizadoFolio",
    folio
  );

  setValue(
    "realizadoCategoria",
    categoria
  );

  setValue(
    "realizadoFila",
    registro.fila || ""
  );

  const fecha =
    document.getElementById(
      "realizadoFecha"
    );

  if (fecha) {

    fecha.value =
      obtenerFechaHoy();

  }

  const comentario =
    document.getElementById(
      "realizadoComentario"
    );

  if (comentario) {

    comentario.value =
      "";

  }

  const foto =
    document.getElementById(
      "realizadoFoto"
    );

  if (foto) {

    foto.value =
      "";

  }

  const preview =
    document.getElementById(
      "previewFotoRealizado"
    );

  if (preview) {

    preview.innerHTML = `

      <div class="preview-vacio">

        <i class="fa-regular fa-image"></i>

        <span>
          No se ha seleccionado fotografía
        </span>

      </div>

    `;

  }

  modal.classList.remove(
    "oculto"
  );

  document.body.style.overflow =
    "hidden";

}


// ================================================================
// CERRAR MODAL
// ================================================================

function cerrarModalRealizado() {

  const modal =
    document.getElementById(
      "modalRealizado"
    );

  if (modal) {

    modal.classList.add(
      "oculto"
    );

  }

  document.body.style.overflow =
    "";

  registroRealizadoActual =
    null;

}


// ================================================================
// PREVISUALIZAR FOTO
// ================================================================

function previsualizarFotoRealizado(
  input
) {

  const preview =
    document.getElementById(
      "previewFotoRealizado"
    );

  if (!preview) {
    return;
  }

  const archivo =
    input?.files?.[0];

  if (!archivo) {

    preview.innerHTML = `

      <div class="preview-vacio">

        <i class="fa-regular fa-image"></i>

        <span>
          No se ha seleccionado fotografía
        </span>

      </div>

    `;

    return;

  }

  if (
    !archivo.type.startsWith(
      "image/"
    )
  ) {

    alert(
      "Selecciona una imagen válida."
    );

    input.value =
      "";

    return;

  }

  const url =
    URL.createObjectURL(
      archivo
    );

  preview.innerHTML = `

    <img
      src="${url}"
      alt="Vista previa de evidencia"
    >

  `;

}


// ================================================================
// GUARDAR REALIZADO
// ================================================================

async function guardarRealizado(
  event
) {

  event.preventDefault();

  console.log(
    "========================================"
  );

  console.log(
    "GUARDAR REALIZADO - INICIANDO"
  );

  console.log(
    "========================================"
  );


  // --------------------------------------------------------------
  // VERIFICAR REGISTRO
  // --------------------------------------------------------------

  if (!registroRealizadoActual) {

    alert(
      "No hay un registro seleccionado."
    );

    return;

  }


  // --------------------------------------------------------------
  // FORMULARIO
  // --------------------------------------------------------------

  const formulario =
    document.getElementById(
      "formRealizado"
    );

  if (!formulario) {

    alert(
      "No se encontró el formulario."
    );

    return;

  }


  // --------------------------------------------------------------
  // FECHA
  // --------------------------------------------------------------

  const campoFecha =
    document.getElementById(
      "realizadoFecha"
    );

  const fecha =
    campoFecha
      ? String(
          campoFecha.value || ""
        ).trim()
      : "";


  if (!fecha) {

    alert(
      "Selecciona la fecha de realización."
    );

    campoFecha?.focus();

    return;

  }


  // --------------------------------------------------------------
  // COMENTARIO
  // --------------------------------------------------------------

  const campoComentario =
    document.getElementById(
      "realizadoComentario"
    );

  if (!campoComentario) {

    alert(
      "No se encontró el campo de comentario."
    );

    return;

  }


  // TOMAR DIRECTAMENTE EL VALOR DEL TEXTAREA

  const comentario =
    String(
      campoComentario.value || ""
    )
      .trim();


  console.log(
    "CAMPO COMENTARIO:",
    campoComentario
  );

  console.log(
    "VALOR ORIGINAL:",
    campoComentario.value
  );

  console.log(
    "COMENTARIO FINAL:",
    comentario
  );


  // --------------------------------------------------------------
  // VALIDAR COMENTARIO
  // --------------------------------------------------------------

  if (
    !comentario
  ) {

    alert(
      "Debe escribir un comentario de realización."
    );

    campoComentario.focus();

    return;

  }


  // --------------------------------------------------------------
  // FOLIO
  // --------------------------------------------------------------

  const folio =
    String(
      registroRealizadoActual.folio ||
      ""
    ).trim();


  const fila =
    registroRealizadoActual.fila ||
    "";


  const categoria =
    categoriaActual ||
    "";


  if (!folio) {

    alert(
      "El registro seleccionado no tiene folio."
    );

    return;

  }


  // --------------------------------------------------------------
  // FOTO
  // --------------------------------------------------------------

  const fotoInput =
    document.getElementById(
      "realizadoFoto"
    );


  // --------------------------------------------------------------
  // BOTÓN
  // --------------------------------------------------------------

  const btn =
    document.getElementById(
      "btnGuardarRealizado"
    );

  const textoOriginal =
    btn
      ? btn.innerHTML
      : "";


  try {

    if (btn) {

      btn.disabled =
        true;

      btn.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Guardando...

      `;

    }


    mostrarCargaGeneral(
      "Guardando realización..."
    );


    // ------------------------------------------------------------
    // FOTO
    // ------------------------------------------------------------

    let fotoBase64 =
      "";

    let fotoNombre =
      "";

    let fotoTipo =
      "";


    if (
      fotoInput &&
      fotoInput.files &&
      fotoInput.files.length > 0
    ) {

      const archivo =
        fotoInput.files[0];


      if (
        !archivo.type ||
        !archivo.type.startsWith(
          "image/"
        )
      ) {

        throw new Error(
          "Selecciona una fotografía válida."
        );

      }


      fotoNombre =
        archivo.name ||
        "evidencia.jpg";


      fotoTipo =
        archivo.type ||
        "image/jpeg";


      fotoBase64 =
        await convertirArchivoBase64(
          archivo
        );

    }


    // ------------------------------------------------------------
    // DATOS
    // ------------------------------------------------------------

    const usuario =
      obtenerUsuario();


    if (!usuario) {

      throw new Error(
        "No existe una sesión activa."
      );

    }


    const datosEnviar = {

      accion:
        "guardarRealizado",

      usuario:
        usuario,

      folio:
        folio,

      fila:
        fila,

      categoria:
        categoria,

      fechaRealizado:
        fecha,

      comentarioRealizado:
        comentario,

      fotoBase64:
        fotoBase64,

      fotoNombre:
        fotoNombre,

      fotoTipo:
        fotoTipo

    };


    console.log(
      "========================================"
    );

    console.log(
      "DATOS A ENVIAR AL APPS SCRIPT:"
    );

    console.log(
      datosEnviar
    );

    console.log(
      "COMENTARIO ENVIADO:",
      datosEnviar.comentarioRealizado
    );

    console.log(
      "========================================"
    );


    // ------------------------------------------------------------
    // ENVIAR
    // ------------------------------------------------------------

    const resultado =
      await postJSON(
        datosEnviar
      );


    console.log(
      "RESPUESTA APPS SCRIPT:",
      resultado
    );


    // ------------------------------------------------------------
    // RESPUESTA
    // ------------------------------------------------------------

    if (
      !resultado ||
      resultado.ok !== true
    ) {

      throw new Error(
        resultado?.mensaje ||
        "No se pudo guardar la realización."
      );

    }


    // ------------------------------------------------------------
    // ACTUALIZAR CACHE
    // ------------------------------------------------------------

    registroRealizadoActual.realizado =
      "REALIZADO";

    registroRealizadoActual.estatusRealizado =
      "REALIZADO";

    registroRealizadoActual.estadoRealizado =
      "REALIZADO";

    registroRealizadoActual.fechaRealizado =
      fecha;

    registroRealizadoActual.fechaRealizacion =
      fecha;

    registroRealizadoActual.realizadoFecha =
      fecha;

    registroRealizadoActual.comentarioRealizado =
      comentario;

    registroRealizadoActual.comentario =
      comentario;

    registroRealizadoActual.realizadoComentario =
      comentario;


    if (
      resultado.urlFoto
    ) {

      registroRealizadoActual.fotoRealizado =
        resultado.urlFoto;

      registroRealizadoActual.fotoEvidencia =
        resultado.urlFoto;

      registroRealizadoActual.evidencia =
        resultado.urlFoto;

      registroRealizadoActual.urlEvidencia =
        resultado.urlFoto;

      registroRealizadoActual.urlFotoRealizado =
        resultado.urlFoto;

    }


    // ------------------------------------------------------------
    // CERRAR
    // ------------------------------------------------------------

    cerrarModalRealizado();

    ocultarCargaGeneral();


    // ------------------------------------------------------------
    // RECARGAR
    // ------------------------------------------------------------

    delete registrosCache[
      categoriaActual
    ];


    await cargarCategoria(
      categoriaActual
    );


    alert(
      "El registro fue marcado como realizado correctamente."
    );


  }
  catch(error) {

    console.error(
      "ERROR GUARDANDO REALIZADO:",
      error
    );

    ocultarCargaGeneral();

    alert(
      error?.message ||
      "Ocurrió un error al guardar la realización."
    );

  }
  finally {

    if (btn) {

      btn.disabled =
        false;

      btn.innerHTML =
        textoOriginal;

    }

  }

}


// ================================================================
// CONVERTIR FOTO BASE64
// ================================================================

function convertirArchivoBase64(
  archivo
) {

  return new Promise(
    function(resolve, reject) {

      const lector =
        new FileReader();

      lector.onload =
        function() {

          const resultado =
            String(
              lector.result || ""
            );

          const separador =
            resultado.indexOf(",");

          if (
            separador >= 0
          ) {

            resolve(
              resultado.substring(
                separador + 1
              )
            );

          }
          else {

            resolve(
              resultado
            );

          }

        };

      lector.onerror =
        function() {

          reject(
            new Error(
              "No se pudo leer la fotografía."
            )
          );

        };

      lector.readAsDataURL(
        archivo
      );

    }
  );

}


// ================================================================
// EVIDENCIA
// ================================================================

function abrirModalEvidenciaPorFolio(
  folio
) {

  abrirModalEvidencia(
    folio
  );

}


function abrirModalEvidencia(
  folio
) {

  const registros =
    registrosCache[
      categoriaActual
    ] || [];

  const registro =
    registros.find(
      function(r) {

        return String(
          r.folio || ""
        ) === String(
          folio || ""
        );

      }
    );

  if (!registro) {

    alert(
      "No se encontró el registro."
    );

    return;

  }

  const foto =
    registro.fotoRealizado ||
    registro.fotoEvidencia ||
    registro.evidencia ||
    registro.urlEvidencia ||
    registro.urlFotoRealizado ||
    "";

  if (!foto) {

    alert(
      "Este registro no tiene una fotografía de evidencia."
    );

    return;

  }

  const modal =
    document.getElementById(
      "modalEvidencia"
    );

  const imagen =
    document.getElementById(
      "imagenEvidencia"
    );

  const info =
    document.getElementById(
      "infoEvidencia"
    );

  if (!modal || !imagen) {
    return;
  }

  imagen.src =
    foto;

  if (info) {

    info.innerHTML = `

      <strong>
        ${esc(
          registro.tipo ||
          registro.nombre ||
          categoriaActual
        )}
      </strong>

      <small>
        Folio:
        ${esc(
          registro.folio ||
          ""
        )}
      </small>

    `;

  }

  modal.classList.remove(
    "oculto"
  );

  document.body.style.overflow =
    "hidden";

}


// ================================================================
// CERRAR EVIDENCIA
// ================================================================

function cerrarModalEvidencia() {

  const modal =
    document.getElementById(
      "modalEvidencia"
    );

  if (modal) {

    modal.classList.add(
      "oculto"
    );

  }

  const imagen =
    document.getElementById(
      "imagenEvidencia"
    );

  if (imagen) {

    imagen.src =
      "";

  }

  document.body.style.overflow =
    "";

}


// ================================================================
// CAMBIAR VOTACIÓN
// ================================================================

async function cambiarVotacionPorFolio(
  folio
) {

  const registros =
    registrosCache.ciudadanos ||
    [];

  const r =
    registros.find(
      function(registro) {

        return String(
          registro.folio || ""
        ) === String(
          folio || ""
        );

      }
    );

  if (!r) {

    alert(
      "No se encontró el ciudadano seleccionado."
    );

    return;

  }


  const votoActual =
    normalizar(
      r.votar ||
      r.voto ||
      "PENDIENTE"
    );


  const votado =
    votoActual === "si" ||
    votoActual === "voto";


  const nuevoValor =
    votado
      ? "PENDIENTE"
      : "SI";


  const pregunta =
    nuevoValor === "SI"
      ? `¿Deseas marcar a ${r.nombre} como VOTÓ?`
      : `¿Deseas regresar a ${r.nombre} a PENDIENTE?`;


  if (
    !confirm(pregunta)
  ) {

    return;

  }


  try {

    const resultado =
      await postJSON({

        accion:
          "cambiarVotar",

        usuario:
          obtenerUsuario(),

        folio:
          r.folio,

        fila:
          r.fila,

        votar:
          nuevoValor

      });


    if (
      !resultado ||
      !resultado.ok
    ) {

      throw new Error(
        resultado?.mensaje ||
        "No se pudo actualizar la votación."
      );

    }


    r.votar =
      nuevoValor;


    actualizarResumenCiudadanos(
      registros
    );


    actualizarContadores(
      "ciudadanos",
      registros
    );


    mostrarFiltrados();


  }
  catch(error) {

    alert(
      error?.message ||
      "No se pudo actualizar la votación."
    );

  }

}


// ================================================================
// CONEXIÓN
// ================================================================

async function postJSON(
  datos
) {

  console.log(
    "POST JSON:",
    datos
  );


  const respuesta =
    await fetch(
      URL_APPS_SCRIPT,
      {

        method:
          "POST",

        headers:
          {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

        body:
          JSON.stringify(
            datos
          )

      }
    );


  if (
    !respuesta.ok
  ) {

    throw new Error(
      "Error de conexión con el servidor."
    );

  }


  const texto =
    await respuesta.text();


  console.log(
    "RESPUESTA TEXTO:",
    texto
  );


  let resultado;


  try {

    resultado =
      JSON.parse(
        texto
      );

  }
  catch(error) {

    console.error(
      "Respuesta del servidor:",
      texto
    );

    throw new Error(
      "El servidor no devolvió una respuesta válida."
    );

  }


  return resultado;

}


// ================================================================
// CARGANDO
// ================================================================

function mostrarCargando(
  texto
) {

  const cont =
    document.getElementById(
      "listaRegistros"
    );

  if (!cont) {
    return;
  }

  cont.innerHTML = `

    <div class="cargando">

      <i
        class="fa-solid fa-spinner fa-spin"
      ></i>

      <p>
        ${esc(texto)}
      </p>

    </div>

  `;

}


// ================================================================
// CARGA GENERAL
// ================================================================

function mostrarCargaGeneral(
  texto
) {

  const cont =
    document.getElementById(
      "cargandoGeneral"
    );

  const textoCont =
    document.getElementById(
      "textoCargandoGeneral"
    );

  if (textoCont) {

    textoCont.textContent =
      texto ||
      "Procesando...";

  }

  if (cont) {

    cont.classList.remove(
      "oculto"
    );

  }

}


function ocultarCargaGeneral() {

  const cont =
    document.getElementById(
      "cargandoGeneral"
    );

  if (cont) {

    cont.classList.add(
      "oculto"
    );

  }

}


// ================================================================
// ERROR
// ================================================================

function mostrarError(
  mensaje
) {

  const cont =
    document.getElementById(
      "listaRegistros"
    );

  if (!cont) {
    return;
  }

  cont.innerHTML = `

    <div class="vacio error">

      <i
        class="fa-solid fa-triangle-exclamation"
      ></i>

      <h3>
        No se pudieron consultar los registros
      </h3>

      <p>
        ${esc(
          mensaje ||
          "Error desconocido."
        )}
      </p>

    </div>

  `;

}


// ================================================================
// FECHA
// ================================================================

function parseFecha(
  valor
) {

  if (!valor) {
    return null;
  }

  const texto =
    String(
      valor
    ).trim();

  let fecha =
    new Date(
      texto
    );

  if (
    !isNaN(
      fecha.getTime()
    )
  ) {

    return fecha;

  }

  const m =
    texto.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/
    );

  if (!m) {
    return null;
  }

  let anio =
    Number(
      m[3]
    );

  if (
    anio < 100
  ) {

    anio += 2000;

  }

  fecha =
    new Date(
      anio,
      Number(
        m[2]
      ) - 1,
      Number(
        m[1]
      )
    );

  return isNaN(
    fecha.getTime()
  )
    ? null
    : fecha;

}


// ================================================================
// FECHA HOY
// ================================================================

function obtenerFechaHoy() {

  const ahora =
    new Date();

  const anio =
    ahora.getFullYear();

  const mes =
    String(
      ahora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const dia =
    String(
      ahora.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${anio}-${mes}-${dia}`;

}


// ================================================================
// NORMALIZAR
// ================================================================

function normalizar(
  valor
) {

  return String(
    valor || ""
  )
    .trim()
    .toLowerCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );

}


// ================================================================
// ESCAPAR HTML
// ================================================================

function esc(
  valor
) {

  return String(
    valor ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ================================================================
// ESCAPAR ATRIBUTO
// ================================================================

function escAtributo(
  valor
) {

  return String(
    valor ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    )
    .replace(
      /\r/g,
      ""
    )
    .replace(
      /\n/g,
      "\\n"
    );

}


// ================================================================
// VALOR
// ================================================================

function setValue(
  id,
  valor
) {

  const elemento =
    document.getElementById(
      id
    );

  if (elemento) {

    elemento.value =
      valor ?? "";

  }

}


// ================================================================
// TEXTO
// ================================================================

function setText(
  id,
  texto
) {

  const elemento =
    document.getElementById(
      id
    );

  if (elemento) {

    elemento.textContent =
      texto;

  }

}


// ================================================================
// ESC
// ================================================================

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key !== "Escape"
    ) {

      return;

    }

    cerrarModalRealizado();

    cerrarModalEvidencia();

  }
);


// ================================================================
// VOLVER
// ================================================================

function volverMenu() {

  window.location =
    "Menu.html";

}