// ========================================
// CONFIGURACIÓN
// ========================================

const URL_APPS_SCRIPT =
 "https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";




// ========================================
// VARIABLES DE SESIÓN
// ========================================

let usuario = "";
let nombre = "";
let rol = "";


// ========================================
// INICIAR CUANDO EL HTML YA CARGÓ
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log("ESTADISTICAS: HTML CARGADO");

    // ================================
    // LEER SESIÓN
    // ================================

    usuario =
      localStorage.getItem("usuario") || "";

    nombre =
      localStorage.getItem("nombre") || "";

    rol =
      localStorage.getItem("rol") || "";


    console.log(
      "USUARIO:",
      usuario
    );

    console.log(
      "NOMBRE:",
      nombre
    );

    console.log(
      "ROL:",
      rol
    );


    // ================================
    // MOSTRAR USUARIO
    // ================================

    const elementoNombre =
      document.getElementById(
        "nombreUsuario"
      );

    const elementoRol =
      document.getElementById(
        "rolUsuario"
      );


    if (elementoNombre) {

      elementoNombre.textContent =
        nombre || usuario || "Sin usuario";

    }


    if (elementoRol) {

      elementoRol.textContent =
        rol || "Sin rol";

    }


    // ================================
    // VERIFICAR SESIÓN
    // ================================

    if (!usuario) {

      alert(
        "No existe una sesión activa."
      );

      window.location.href =
        "index.html";

      return;

    }


    // ================================
    // VERIFICAR ADMINISTRADOR
    // ================================

    if (
      rol.trim().toLowerCase() !==
      "administrador"
    ) {

      alert(
        "No tiene permisos para acceder a Estadísticas."
      );

      window.location.href =
        "Menu.html";

      return;

    }


    // ================================
    // CARGAR ESTADÍSTICAS
    // ================================

    cargarEstadistica();

  }

);


// ========================================
// CARGAR ESTADÍSTICAS
// ========================================

async function cargarEstadistica() {

  const tablaSecciones =
    document.getElementById(
      "tablaSecciones"
    );

  const tablaUsuarios =
    document.getElementById(
      "tablaUsuarios"
    );

  const mensaje =
    document.getElementById(
      "mensaje"
    );


  // ================================
  // MENSAJE DE CARGA
  // ================================

  if (tablaSecciones) {

    tablaSecciones.innerHTML = `

      <tr>

        <td colspan="7">

          Cargando información...

        </td>

      </tr>

    `;

  }


  if (tablaUsuarios) {

    tablaUsuarios.innerHTML = `

      <tr>

        <td colspan="4">

          Cargando información...

        </td>

      </tr>

    `;

  }


  if (mensaje) {

    mensaje.textContent =
      "";

  }


  try {

    console.log(
      "ENVIANDO SOLICITUD DE ESTADÍSTICAS..."
    );


    // ================================
    // ENVIAR AL APPS SCRIPT
    // ================================

    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              accion:
                "obtenerEstadistica",

              usuario:
                usuario,

              rol:
                rol

            })

        }

      );


    console.log(
      "RESPUESTA HTTP:",
      respuesta.status
    );


    const texto =
      await respuesta.text();


    console.log(
      "RESPUESTA GS:",
      texto
    );


    if (!texto) {

      throw new Error(
        "El servidor no devolvió ninguna respuesta."
      );

    }


    // ================================
    // CONVERTIR JSON
    // ================================

    let resultado;


    try {

      resultado =
        JSON.parse(texto);

    }

    catch(error) {

      console.error(
        "RESPUESTA NO ES JSON:",
        texto
      );

      throw new Error(
        "La respuesta del Apps Script no es válida."
      );

    }


    console.log(
      "RESULTADO:",
      resultado
    );


    // ================================
    // VERIFICAR RESPUESTA
    // ================================

    if (
      resultado.ok !== true
    ) {

      throw new Error(
        resultado.mensaje ||
        "No se pudieron obtener las estadísticas."
      );

    }


    // ================================
    // MOSTRAR SECCIONES
    // ================================

    mostrarSecciones(
      resultado.secciones || []
    );


    // ================================
    // MOSTRAR USUARIOS
    // ================================

    mostrarUsuarios(
      resultado.usuarios || []
    );


    // ================================
    // MOSTRAR TOTALES
    // ================================

    mostrarTotales(
      resultado.totales || {}
    );


    if (mensaje) {

      mensaje.textContent =
        "Estadísticas actualizadas correctamente.";

    }

  }

  catch(error) {

    console.error(
      "ERROR ESTADISTICAS:",
      error
    );


    if (tablaSecciones) {

      tablaSecciones.innerHTML = `

        <tr>

          <td colspan="7">

            Error al cargar la información.

          </td>

        </tr>

      `;

    }


    if (tablaUsuarios) {

      tablaUsuarios.innerHTML = `

        <tr>

          <td colspan="4">

            Error al cargar la información.

          </td>

        </tr>

      `;

    }


    if (mensaje) {

      mensaje.textContent =
        "Error: " +
        error.message;

    }

  }

}


// ========================================
// MOSTRAR ESTADÍSTICAS POR SECCIÓN
// ========================================

function mostrarSecciones(
  secciones
) {

  const tabla =
    document.getElementById(
      "tablaSecciones"
    );


  if (!tabla) {

    console.error(
      "No existe tablaSecciones."
    );

    return;

  }


  tabla.innerHTML =
    "";


  if (
    !Array.isArray(secciones) ||
    secciones.length === 0
  ) {

    tabla.innerHTML = `

      <tr>

        <td colspan="7">

          No hay información.

        </td>

      </tr>

    `;

    return;

  }


  secciones.forEach(
    function(item) {

      const fila =
        document.createElement(
          "tr"
        );


      // ==================================
      // OBTENER DATOS
      // ==================================

      const listaNominal =
        Number(
          item.listaNominal
        ) || 0;


      const registrados =
        Number(
          item.registrados
        ) || 0;


      // ==================================
      // CALCULAR PORCENTAJE
      // ==================================

      let porcentaje =
        0;


      if (
        listaNominal > 0
      ) {

        porcentaje =
          (
            registrados /
            listaNominal
          ) * 100;

      }


      // ==================================
      // CLASIFICAR PORCENTAJE
      // ==================================

      if (
        porcentaje >= 100
      ) {

        fila.classList.add(
          "padron-excelente"
        );

      }

      else if (
        porcentaje >= 91
      ) {

        fila.classList.add(
          "padron-muy-bueno"
        );

      }

      else if (
        porcentaje >= 80
      ) {

        fila.classList.add(
          "padron-normal"
        );

      }

      else if (
        porcentaje >= 70
      ) {

        fila.classList.add(
          "padron-buen-avance"
        );

      }

      else if (
        porcentaje >= 55
      ) {

        fila.classList.add(
          "padron-en-rango"
        );

      }

      else if (
        porcentaje >= 40
      ) {

        fila.classList.add(
          "padron-regular"
        );

      }

      else {

        fila.classList.add(
          "padron-muy-bajo"
        );

      }


      // ==================================
      // MOSTRAR INFORMACIÓN
      // ==================================

      fila.innerHTML = `

        <td>
          ${escaparHTML(
            item.seccion
          )}
        </td>

        <td>
          ${numero(
            item.listaNominal
          )}
        </td>

        <td>
          ${numero(
            item.registrados
          )}
        </td>

        <td>
          ${numero(
            item.porcentajeRegistrados
          )}%
        </td>

        <td>
          ${numero(
            item.votaron
          )}
        </td>

        <td>
          ${numero(
            item.porcentajeVotaron
          )}%
        </td>

        <td>
          ${numero(
            item.pendientes
          )}
        </td>

      `;


      tabla.appendChild(
        fila
      );

    }

  );

}


// ========================================
// MOSTRAR USUARIOS
// ========================================

function mostrarUsuarios(
  usuarios
) {

  const tabla =
    document.getElementById(
      "tablaUsuarios"
    );


  if (!tabla) {

    console.error(
      "No existe tablaUsuarios."
    );

    return;

  }


  tabla.innerHTML =
    "";


  if (
    !Array.isArray(usuarios) ||
    usuarios.length === 0
  ) {

    tabla.innerHTML = `

      <tr>

        <td colspan="4">

          No hay registros.

        </td>

      </tr>

    `;

    return;

  }


  usuarios.forEach(
    function(item) {

      const fila =
        document.createElement(
          "tr"
        );


      // ==================================
      // CALCULAR DÍAS SIN REGISTRAR
      // ==================================

      const diasSinRegistrar =
        calcularDiasSinRegistrar(
          item.ultimoRegistro
        );


      // ==================================
      // 3 DÍAS O MÁS = ROJO
      // ==================================

      if (
        diasSinRegistrar >= 3
      ) {

        fila.classList.add(
          "registro-atrasado"
        );

      }


      // ==================================
      // MOSTRAR INFORMACIÓN
      // ==================================

      fila.innerHTML = `

        <td>
          ${escaparHTML(
            item.usuario
          )}
        </td>

        <td>
          ${escaparHTML(
            item.nombre
          )}
        </td>

        <td>
          ${numero(
            item.registros
          )}
        </td>

        <td>
          ${escaparHTML(
            item.ultimoRegistro
          )}
        </td>

      `;


      tabla.appendChild(
        fila
      );

    }

  );

}


// ========================================
// CALCULAR DÍAS SIN REGISTRAR
// ========================================

function calcularDiasSinRegistrar(
  fechaTexto
) {

  if (
    fechaTexto === null ||
    fechaTexto === undefined ||
    fechaTexto === ""
  ) {

    return 999;

  }


  let fecha;


  // ==================================
  // SI YA ES FECHA
  // ==================================

  if (
    Object.prototype.toString.call(
      fechaTexto
    ) === "[object Date]"
  ) {

    fecha =
      new Date(
        fechaTexto
      );

  }

  else {

    let texto =
      String(
        fechaTexto
      ).trim();


    // ==================================
    // QUITAR HORA
    // ==================================

    texto =
      texto.split(" ")[0];


    // ==================================
    // DD/MM/YYYY
    // ==================================

    if (
      /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
        texto
      )
    ) {

      const partes =
        texto.split("/");


      fecha =
        new Date(
          Number(partes[2]),
          Number(partes[1]) - 1,
          Number(partes[0])
        );

    }


    // ==================================
    // YYYY-MM-DD
    // ==================================

    else if (
      /^\d{4}-\d{1,2}-\d{1,2}$/.test(
        texto
      )
    ) {

      const partes =
        texto.split("-");


      fecha =
        new Date(
          Number(partes[0]),
          Number(partes[1]) - 1,
          Number(partes[2])
        );

    }


    // ==================================
    // OTROS FORMATOS
    // ==================================

    else {

      fecha =
        new Date(
          fechaTexto
        );

    }

  }


  // ==================================
  // FECHA INVÁLIDA
  // ==================================

  if (
    isNaN(
      fecha.getTime()
    )
  ) {

    console.warn(
      "Fecha no válida:",
      fechaTexto
    );

    return 999;

  }


  // ==================================
  // COMPARAR SOLO FECHAS
  // ==================================

  const hoy =
    new Date();


  hoy.setHours(
    0,
    0,
    0,
    0
  );


  fecha.setHours(
    0,
    0,
    0,
    0
  );


  const diferencia =
    hoy.getTime() -
    fecha.getTime();


  const dias =
    Math.floor(
      diferencia /
      (
        1000 *
        60 *
        60 *
        24
      )
    );


  return dias;

}


// ========================================
// MOSTRAR TOTALES
// ========================================

function mostrarTotales(
  totales
) {

  if (!totales) {

    return;

  }


  const totalNominal =
    document.getElementById(
      "totalNominal"
    );


  const totalRegistrados =
    document.getElementById(
      "totalRegistrados"
    );


  const totalPendientes =
    document.getElementById(
      "totalPendientes"
    );


  const totalVotaron =
    document.getElementById(
      "totalVotaron"
    );


  const porcentajeRegistrados =
    document.getElementById(
      "piePorcentajeRegistrados"
    );


  const porcentajeVotaron =
    document.getElementById(
      "piePorcentajeVotaron"
    );


  if (totalNominal) {

    totalNominal.textContent =
      numero(
        totales.listaNominal
      );

  }


  if (totalRegistrados) {

    totalRegistrados.textContent =
      numero(
        totales.registrados
      );

  }


  if (totalPendientes) {

    totalPendientes.textContent =
      numero(
        totales.pendientes
      );

  }


  if (totalVotaron) {

    totalVotaron.textContent =
      numero(
        totales.votaron
      );

  }


  if (porcentajeRegistrados) {

    porcentajeRegistrados.textContent =
      numero(
        totales.porcentajeRegistrados
      ) +
      "%";

  }


  if (porcentajeVotaron) {

    porcentajeVotaron.textContent =
      numero(
        totales.porcentajeVotaron
      ) +
      "%";

  }

}


// ========================================
// FORMATEAR NÚMEROS
// ========================================

function numero(
  valor
) {

  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {

    return "0";

  }


  return valor;

}


// ========================================
// PROTEGER TEXTO HTML
// ========================================

function escaparHTML(
  valor
) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(valor)
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


// ========================================
// REGRESAR AL MENÚ
// ========================================

function regresarMenu() {

  window.location.href =
    "Menu.html";

}