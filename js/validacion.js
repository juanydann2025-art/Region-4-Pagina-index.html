// ================================================================
// VALIDACIÓN DE REGISTROS - CARGA POR CATEGORÍA
// ================================================================

const URL_APPS_SCRIPT =
 "https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";





let registros = [];
let registroSeleccionado = null;
let cargando = false;

// ================================================================
// ELEMENTOS
// ================================================================

const cuerpoTabla =
  document.getElementById("cuerpoTabla");

const buscarRegistro =
  document.getElementById("buscarRegistro");

const filtroCategoria =
  document.getElementById("filtroCategoria");

const totalPendientes =
  document.getElementById("totalPendientes");

const totalDuplicados =
  document.getElementById("totalDuplicados");

const mensaje =
  document.getElementById("mensaje");

const modalValidacion =
  document.getElementById("modalValidacion");

const detalleRegistro =
  document.getElementById("detalleRegistro");

const comentarios =
  document.getElementById("comentarios");

const btnValidar =
  document.getElementById("btnValidar");

const btnCancelar =
  document.getElementById("btnCancelar");

const btnCerrarModal =
  document.getElementById("btnCerrarModal");

const btnActualizar =
  document.getElementById("btnActualizar");

// ================================================================
// SESIÓN
// ================================================================

function obtenerSesion() {

  try {

    const sesionGuardada =
      localStorage.getItem("sesion");

    if (sesionGuardada) {

      return JSON.parse(
        sesionGuardada
      );

    }

    const usuario =
      localStorage.getItem("usuario");

    const nombre =
      localStorage.getItem("nombreUsuario");

    const rol =
      localStorage.getItem("rol");

    if (usuario) {

      return {

        usuario:
          usuario,

        nombre:
          nombre || "",

        rol:
          rol || ""

      };

    }

    return null;

  }

  catch (error) {

    console.error(error);

    return null;

  }

}



// ================================================================
// VERIFICAR SESIÓN
// ================================================================

function verificarSesion() {

  const sesion =
    obtenerSesion();

  if (
    !sesion ||
    !sesion.usuario
  ) {

    mostrarMensaje(
      "No existe una sesión activa.",
      true
    );

    return null;

  }

  if (
    String(
      sesion.rol || ""
    )
    .trim()
    .toLowerCase() !==
    "administrador"
  ) {

    mostrarMensaje(
      "Solo un administrador puede validar registros.",
      true
    );

    return null;

  }

  return sesion;

}



// ================================================================
// MENSAJES
// ================================================================

function mostrarMensaje(
  texto,
  error = false
) {

  mensaje.textContent =
    texto;

  mensaje.classList.remove(
    "oculto"
  );

  mensaje.style.background =
    error
      ? "#fee2e2"
      : "#dbeafe";

  mensaje.style.color =
    error
      ? "#991b1b"
      : "#1e40af";

  clearTimeout(
    mostrarMensaje.temporizador
  );

  mostrarMensaje.temporizador =
    setTimeout(
      () => {

        mensaje.classList.add(
          "oculto"
        );

      },
      5000
    );

}



// ================================================================
// UTILIDADES
// ================================================================

function contarDuplicados(
  lista
) {

  return lista.filter(
    (registro) => {

      return (
        String(
          registro.duplicado || ""
        )
        .trim()
        .toUpperCase() ===
        "SI"
      );

    }
  ).length;

}



// ================================================================
// ESCAPAR HTML
// ================================================================

function escaparHTML(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }

  return String(
    valor
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
// NORMALIZAR TEXTO
// ================================================================

function normalizarTexto(
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
// ESCAPAR ATRIBUTO
// ================================================================

function escaparAtributo(
  valor
) {

  return String(
    valor || ""
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
    /\n/g,
    " "
  )
  .replace(
    /\r/g,
    " "
  );

}



// ================================================================
// FORMATEAR ETIQUETA
// ================================================================

function formatearEtiqueta(
  texto
) {

  const mapa = {

    folio:
      "Folio",

    fecha:
      "Fecha de registro",

    categoria:
      "Categoría",

    usuario:
      "Usuario que generó",

    nombreUsuario:
      "Nombre del usuario",

    rol:
      "Rol",

    estado:
      "Estado",

    duplicado:
      "Duplicado",

    duplicadoConUsuario:
      "Duplicado con usuario",

    comentarios:
      "Comentarios",

    nombre:
      "Nombre",

    edad:
      "Edad",

    sexo:
      "Sexo",

    telefono:
      "Teléfono",

    seccion:
      "Sección",

    comunidad:
      "Comunidad",

    calle:
      "Calle",

    numero:
      "Número",

    tipo:
      "Tipo",

    otro:
      "Otro",

    justificacion:
      "Justificación",

    alto:
      "Alto",

    ancho:
      "Ancho",

    metros:
      "Metros cuadrados",

    autoriza:
      "Autoriza",

    hora:
      "Hora",

    personas:
      "Personas",

    responsable:
      "Responsable"

  };


  if (
    mapa[texto]
  ) {

    return mapa[texto];

  }


  return String(
    texto || ""
  )
  .replace(
    /([A-Z])/g,
    " $1"
  )
  .replace(
    /^./,
    (letra) =>
      letra.toUpperCase()
  );

}



// ================================================================
// ESTADO INICIAL
// NO SE CARGAN REGISTROS AL ENTRAR
// ================================================================

function prepararPantallaInicial() {

  registros = [];

  cuerpoTabla.innerHTML = `

    <tr>

      <td
        colspan="7"
        class="tabla-vacia">

        Seleccione una categoría
        para cargar los registros.

      </td>

    </tr>

  `;


  totalPendientes.textContent =
    "0";


  totalDuplicados.textContent =
    "0";


  buscarRegistro.disabled =
    true;


  btnActualizar.disabled =
    true;

}



// ================================================================
// CARGAR REGISTROS DE UNA SOLA CATEGORÍA
// ================================================================

async function cargarRegistros() {

  const sesion =
    verificarSesion();


  if (!sesion) {

    return;

  }


  const categoria =
    String(
      filtroCategoria.value || ""
    ).trim();


  if (!categoria) {

    registros = [];


    totalPendientes.textContent =
      "0";


    totalDuplicados.textContent =
      "0";


    cuerpoTabla.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="tabla-vacia">

          Seleccione una categoría
          para cargar los registros.

        </td>

      </tr>

    `;


    return;

  }


  if (cargando) {

    return;

  }


  cargando =
    true;


  btnActualizar.disabled =
    true;


  filtroCategoria.disabled =
    true;


  buscarRegistro.disabled =
    true;


  cuerpoTabla.innerHTML = `

    <tr>

      <td
        colspan="7"
        class="tabla-cargando">

        Cargando
        ${escaparHTML(categoria)}...

      </td>

    </tr>

  `;


  try {

    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              accion:
                "obtenerRegistrosPendientes",

              usuario:
                sesion.usuario,

              categoria:
                categoria

            })

        }
      );


    const datos =
      await respuesta.json();


    if (!datos.ok) {

      throw new Error(
        datos.mensaje ||
        "No fue posible cargar los registros."
      );

    }


    registros =
      Array.isArray(
        datos.registros
      )
        ? datos.registros
        : [];


    buscarRegistro.disabled =
      false;


    btnActualizar.disabled =
      false;


    mostrarRegistros();

  }

  catch (error) {

    console.error(
      "ERROR:",
      error
    );


    registros = [];


    totalPendientes.textContent =
      "0";


    totalDuplicados.textContent =
      "0";


    cuerpoTabla.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="tabla-error">

          Error al cargar registros:

          <br>

          ${escaparHTML(
            error.message
          )}

        </td>

      </tr>

    `;


    mostrarMensaje(
      error.message,
      true
    );

  }

  finally {

    cargando =
      false;


    filtroCategoria.disabled =
      false;


    if (
      filtroCategoria.value
    ) {

      buscarRegistro.disabled =
        false;


      btnActualizar.disabled =
        false;

    }

  }

}



// ================================================================
// MOSTRAR / FILTRAR REGISTROS
// ================================================================

function mostrarRegistros() {

  const texto =
    normalizarTexto(
      buscarRegistro.value
    );


  const filtrados =
    registros.filter(
      (registro) => {

        if (!texto) {

          return true;

        }


        const contenido = [

          registro.folio,

          registro.categoria,

          registro.fecha,

          registro.usuario,

          registro.nombreUsuario,

          registro.nombre,

          registro.duplicado,

          registro.duplicadoConUsuario,

          JSON.stringify(
            registro.datos || {}
          )

        ]
        .join(" ")
        .toLowerCase();


        return normalizarTexto(
          contenido
        )
        .includes(
          texto
        );

      }
    );


  totalPendientes.textContent =
    filtrados.length;


  totalDuplicados.textContent =
    contarDuplicados(
      filtrados
    );


  if (
    filtrados.length === 0
  ) {

    cuerpoTabla.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="tabla-vacia">

          No hay registros pendientes
          en esta categoría.

        </td>

      </tr>

    `;


    return;

  }


  cuerpoTabla.innerHTML =
    filtrados
      .map(
        crearFila
      )
      .join("");

}



// ================================================================
// CREAR FILA
// ================================================================

function crearFila(
  registro
) {

  const duplicado =
    String(
      registro.duplicado ||
      "NO"
    )
    .trim()
    .toUpperCase();


  const claseDuplicado =
    duplicado === "SI"
      ? "duplicado-si"
      : "duplicado-no";


  const textoDuplicado =
    duplicado === "SI"
      ? "SÍ"
      : "NO";


  return `

    <tr>

      <td>

        <strong>

          ${escaparHTML(
            registro.folio
          )}

        </strong>

      </td>


      <td>

        ${escaparHTML(
          registro.categoria
        )}

      </td>


      <td>

        ${escaparHTML(
          registro.fecha
        )}

      </td>


      <td>

        ${escaparHTML(
          registro.usuario
        )}

      </td>


      <td>

        ${escaparHTML(
          registro.nombre ||
          registro.nombreUsuario ||
          ""
        )}

      </td>


      <td>

        <span
          class="${claseDuplicado}">

          ${textoDuplicado}

        </span>

      </td>


      <td>

        <button

          type="button"

          class="btn-tabla"

          onclick="abrirValidacion(
            '${escaparAtributo(
              registro.folio
            )}',
            '${escaparAtributo(
              registro.categoria
            )}'
          )">

          Ver

        </button>

      </td>

    </tr>

  `;

}



// ================================================================
// OBTENER DETALLE
// SOLO SE EJECUTA AL PRESIONAR VER
// ================================================================

async function abrirValidacion(
  folio,
  categoria
) {

  const sesion =
    verificarSesion();


  if (!sesion) {

    return;

  }


  const registroLista =
    registros.find(
      (item) => {

        return (

          String(
            item.folio
          ) ===
          String(
            folio
          )

          &&

          String(
            item.categoria
          ) ===
          String(
            categoria
          )

        );

      }
    );


  registroSeleccionado =
    registroLista ||
    {

      folio:
        folio,

      categoria:
        categoria

    };


  detalleRegistro.innerHTML = `

    <div
      class="detalle-cargando">

      Cargando detalle del registro...

      <br>

      Las fotografías se cargarán
      solamente ahora.

    </div>

  `;


  comentarios.value =
    registroLista?.comentarios ||
    "";


  modalValidacion.classList.remove(
    "oculto"
  );


  try {

    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              accion:
                "obtenerDetalleRegistro",

              usuario:
                sesion.usuario,

              categoria:
                categoria,

              folio:
                folio

            })

        }
      );


    const datos =
      await respuesta.json();


    if (
      !datos.ok ||
      !datos.registro
    ) {

      throw new Error(
        datos.mensaje ||
        "No fue posible obtener el detalle."
      );

    }


    registroSeleccionado =
      datos.registro;


    comentarios.value =
      datos.registro.comentarios ||
      "";


    mostrarDetalle(
      datos.registro
    );

  }

  catch (error) {

    console.error(
      error
    );


    detalleRegistro.innerHTML = `

      <div
        class="detalle-error">

        ${escaparHTML(
          error.message
        )}

      </div>

    `;


    mostrarMensaje(
      error.message,
      true
    );

  }

}



// ================================================================
// MOSTRAR DETALLE
// ================================================================

function mostrarDetalle(
  registro
) {

  const datos =
    registro.datos ||
    {};


  const camposPrincipales = [

    [
      "folio",
      registro.folio
    ],

    [
      "categoria",
      registro.categoria
    ],

    [
      "fecha",
      registro.fecha
    ],

    [
      "usuario",
      registro.usuario
    ],

    [
      "nombreUsuario",
      registro.nombreUsuario
    ],

    [
      "rol",
      registro.rol
    ],

    [
      "estado",
      registro.estado
    ],

    [
      "duplicado",
      registro.duplicado
    ],

    [
      "duplicadoConUsuario",
      registro.duplicadoConUsuario
    ]

  ];


  const camposDatos =
    Object.entries(
      datos
    );


  let html = `

    <div
      class="detalle-seccion">

      <h3>
        Información del registro
      </h3>

      <div
        class="detalle-grid">

  `;


  camposPrincipales.forEach(
    ([clave, valor]) => {

      if (
        valor === null ||
        valor === undefined ||
        valor === ""
      ) {

        return;

      }


      html += `

        <div
          class="detalle-item">

          <strong>

            ${escaparHTML(
              formatearEtiqueta(
                clave
              )
            )}

          </strong>

          <span>

            ${escaparHTML(
              valor
            )}

          </span>

        </div>

      `;

    }
  );


  html += `

      </div>

    </div>

  `;


  if (
    camposDatos.length
  ) {

    html += `

      <div
        class="detalle-seccion">

        <h3>
          Datos complementarios
        </h3>

        <div
          class="detalle-grid">

    `;


    camposDatos.forEach(
      ([clave, valor]) => {

        if (
          valor === null ||
          valor === undefined ||
          valor === ""
        ) {

          return;

        }


        html += `

          <div
            class="detalle-item">

            <strong>

              ${escaparHTML(
                formatearEtiqueta(
                  clave
                )
              )}

            </strong>

            <span>

              ${escaparHTML(
                valor
              )}

            </span>

          </div>

        `;

      }
    );


    html += `

        </div>

      </div>

    `;

  }


  if (
    normalizarTexto(
      registro.categoria
    ) ===
    "ciudadanos"
  ) {

    html +=
      crearSeccionINE(
        registro
      );

  }


  if (
    registro.comentarios
  ) {

    html += `

      <div
        class="detalle-seccion">

        <h3>
          Comentarios anteriores
        </h3>

        <div
          class="comentario-anterior">

          ${escaparHTML(
            registro.comentarios
          )}

        </div>

      </div>

    `;

  }


  detalleRegistro.innerHTML =
    html;

}



// ================================================================
// FOTOGRAFÍAS INE
// ================================================================

function crearSeccionINE(
  registro
) {

  const frente =
    registro.ineFrenteImagen ||
    registro.ineFrente ||
    "";


  const atras =
    registro.ineAtrasImagen ||
    registro.ineAtras ||
    "";


  return `

    <div
      class="detalle-seccion ine-seccion">

      <h3>
        Identificación INE
      </h3>


      <div
        class="ine-grid">


        <!-- INE FRENTE -->

        <div
          class="ine-foto">

          <h4>
            INE Frente
          </h4>

          ${
            frente

              ? `

                <a
                  href="${escaparHTML(
                    registro.ineFrente ||
                    frente
                  )}"
                  target="_blank"
                  rel="noopener noreferrer">

                  <img
                    src="${escaparHTML(
                      frente
                    )}"
                    alt="INE Frente"
                    loading="lazy"

                    onerror="
                      this.style.display='none';
                      this.nextElementSibling.style.display='block';
                    "
                  >

                </a>


                <div
                  class="foto-error"
                  style="display:none;">

                  No fue posible mostrar
                  la imagen.

                  <br>

                  <a
                    href="${escaparHTML(
                      registro.ineFrente ||
                      frente
                    )}"
                    target="_blank"
                    rel="noopener noreferrer">

                    Abrir fotografía

                  </a>

                </div>

              `

              : `

                <div
                  class="foto-vacia">

                  No hay fotografía
                  de INE frente.

                </div>

              `
          }

        </div>


        <!-- INE ATRÁS -->

        <div
          class="ine-foto">

          <h4>
            INE Atrás
          </h4>

          ${
            atras

              ? `

                <a
                  href="${escaparHTML(
                    registro.ineAtras ||
                    atras
                  )}"
                  target="_blank"
                  rel="noopener noreferrer">

                  <img
                    src="${escaparHTML(
                      atras
                    )}"
                    alt="INE Atrás"
                    loading="lazy"

                    onerror="
                      this.style.display='none';
                      this.nextElementSibling.style.display='block';
                    "
                  >

                </a>


                <div
                  class="foto-error"
                  style="display:none;">

                  No fue posible mostrar
                  la imagen.

                  <br>

                  <a
                    href="${escaparHTML(
                      registro.ineAtras ||
                      atras
                    )}"
                    target="_blank"
                    rel="noopener noreferrer">

                    Abrir fotografía

                  </a>

                </div>

              `

              : `

                <div
                  class="foto-vacia">

                  No hay fotografía
                  de INE atrás.

                </div>

              `
          }

        </div>


      </div>

    </div>

  `;

}



// ================================================================
// VALIDAR REGISTRO
// ================================================================

async function validarRegistro() {

  if (
    !registroSeleccionado
  ) {

    return;

  }


  const sesion =
    verificarSesion();


  if (!sesion) {

    return;

  }


  const confirmar =
    confirm(

      "¿Está seguro de validar este registro?\n\n" +

      "Una vez validado desaparecerá " +

      "de la lista de pendientes."

    );


  if (!confirmar) {

    return;

  }


  btnValidar.disabled =
    true;


  btnValidar.textContent =
    "Validando...";


  try {

    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              accion:
                "validarRegistro",

              usuario:
                sesion.usuario,

              categoria:
                registroSeleccionado.categoria,

              folio:
                registroSeleccionado.folio,

              comentarios:
                comentarios.value.trim()

            })

        }
      );


    const datos =
      await respuesta.json();


    if (
      !datos.ok
    ) {

      throw new Error(
        datos.mensaje ||
        "No se pudo validar."
      );

    }


    cerrarModal();


    mostrarMensaje(
      "Registro validado correctamente."
    );


    await cargarRegistros();

  }

  catch (error) {

    console.error(
      error
    );


    mostrarMensaje(
      error.message,
      true
    );

  }

  finally {

    btnValidar.disabled =
      false;


    btnValidar.textContent =
      "✓ Validar registro";

  }

}



// ================================================================
// CERRAR MODAL
// ================================================================

function cerrarModal() {

  modalValidacion.classList.add(
    "oculto"
  );


  registroSeleccionado =
    null;


  comentarios.value =
    "";


  detalleRegistro.innerHTML =
    "";

}



// ================================================================
// EVENTOS
// ================================================================

filtroCategoria.addEventListener(
  "change",
  () => {

    buscarRegistro.value =
      "";

    cargarRegistros();

  }
);


buscarRegistro.addEventListener(
  "input",
  mostrarRegistros
);


btnActualizar.addEventListener(
  "click",
  cargarRegistros
);


btnValidar.addEventListener(
  "click",
  validarRegistro
);


btnCancelar.addEventListener(
  "click",
  cerrarModal
);


btnCerrarModal.addEventListener(
  "click",
  cerrarModal
);


modalValidacion.addEventListener(
  "click",
  (evento) => {

    if (
      evento.target ===
      modalValidacion
    ) {

      cerrarModal();

    }

  }
);



// ================================================================
// INICIAR
// ================================================================
// IMPORTANTE:
// NO SE LLAMA cargarRegistros() AQUÍ.
// Los registros solamente se consultan
// después de seleccionar una categoría.
// ================================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    prepararPantallaInicial();

  }
);