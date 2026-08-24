// ========================================
// URL APPS SCRIPT
// ========================================

const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyQIpdzQUZ5QVmOHxvY5xmA9CHtmF0HIUPy0ewA9fN-G_A273ExbS0kTnjiE7JxHEBHFw/exec";


// ========================================
// CONTROL DE CONSULTA
// ========================================

let categoriaCargando = "";


// ========================================
// OBTENER USUARIO
// ========================================

function obtenerUsuario() {

  const usuario =
    localStorage.getItem("usuario");

  if (!usuario) {

    alert(
      "No existe una sesión activa."
    );

    window.location =
      "index.html";

    return "";

  }

  return usuario.trim();

}


// ========================================
// CARGAR UNA CATEGORÍA
// ========================================

function cargarCategoria(categoria) {

  if (categoriaCargando) {
    return;
  }


  const usuario =
    obtenerUsuario();

  if (!usuario) {
    return;
  }


  const contenedor =
    document.getElementById(
      "listaRegistros"
    );


  if (!contenedor) {
    return;
  }


  categoriaCargando =
    categoria;


  contenedor.innerHTML = `

    <div class="cargando">

      <i
        class="fa-solid fa-spinner fa-spin"
        style="font-size:30px;">
      </i>

      <br><br>

      Consultando
      ${escaparHTML(
        obtenerNombreCategoria(categoria)
      )}
      ...

    </div>

  `;


  bloquearBotones(true);


  fetch(
    URL_APPS_SCRIPT,
    {

      method: "POST",

      headers: {

        "Content-Type":
          "text/plain;charset=utf-8"

      },

      body: JSON.stringify({

        accion:
          "obtenerMisRegistros",

        usuario:
          usuario,

        categoria:
          categoria

      })

    }
  )

  .then(
    function(respuesta) {

      if (!respuesta.ok) {

        throw new Error(
          "Error de conexión con el servidor."
        );

      }

      return respuesta.json();

    }
  )

  .then(
    function(resultado) {

      console.log(
        "RESPUESTA MIS REGISTROS:",
        resultado
      );


      if (!resultado.ok) {

        throw new Error(
          resultado.mensaje ||
          "No se pudieron obtener los registros."
        );

      }


      mostrarRegistros(
        resultado.registros || [],
        categoria
      );

    }
  )

  .catch(
    function(error) {

      console.error(
        "ERROR MIS REGISTROS:",
        error
      );


      contenedor.innerHTML = `

        <div class="sinRegistros">

          <i
            class="fa-solid fa-triangle-exclamation"
            style="
              font-size:35px;
              color:#c62828;
            ">
          </i>

          <br><br>

          <strong>
            No se pudieron consultar los registros.
          </strong>

          <br><br>

          ${escaparHTML(
            error.message
          )}

        </div>

      `;

    }
  )

  .finally(
    function() {

      categoriaCargando = "";

      bloquearBotones(false);

    }
  );

}


// ========================================
// BLOQUEAR / DESBLOQUEAR BOTONES
// ========================================

function bloquearBotones(bloquear) {

  const botones =
    document.querySelectorAll(
      ".btnCategoria"
    );


  botones.forEach(
    function(boton) {

      boton.disabled =
        bloquear;

    }
  );

}


// ========================================
// NOMBRE DE CATEGORÍA
// ========================================

function obtenerNombreCategoria(categoria) {

  const nombres = {

    ciudadanos:
      "Ciudadanos",

    peticiones:
      "Peticiones",

    operaciones:
      "Operaciones",

    bardas:
      "Bardas",

    reuniones:
      "Reuniones"

  };


  return (
    nombres[categoria] ||
    "registros"
  );

}


// ========================================
// MOSTRAR REGISTROS
// ========================================

function mostrarRegistros(
  registros,
  categoria
) {

  const contenedor =
    document.getElementById(
      "listaRegistros"
    );


  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = "";


  // ======================================
  // SIN REGISTROS
  // ======================================

  if (
    !Array.isArray(registros) ||
    registros.length === 0
  ) {

    contenedor.innerHTML = `

      <div class="sinRegistros">

        <i
          class="fa-solid fa-folder-open"
          style="font-size:40px;">
        </i>

        <br><br>

        No tienes registros en

        <strong>
          ${escaparHTML(
            obtenerNombreCategoria(categoria)
          )}
        </strong>.

      </div>

    `;

    return;

  }


  // ======================================
  // ENCABEZADO
  // ======================================

  const encabezado =
    document.createElement(
      "div"
    );


  encabezado.style =
    "margin-bottom:15px;font-weight:bold;color:#b30000;";


  encabezado.innerHTML = `

    <i class="fa-solid fa-list"></i>

    ${registros.length}

    registro${registros.length === 1 ? "" : "s"}

    encontrados

  `;


  contenedor.appendChild(
    encabezado
  );


  // ======================================
  // CREAR TARJETAS
  // ======================================

  registros.forEach(
    function(item) {

      const tarjeta =
        document.createElement(
          "div"
        );


      tarjeta.className =
        "tarjeta";


      // ==================================
      // ENCABEZADO
      // ==================================

      let contenido = `

        <h2>

          <i
            class="fa-solid fa-file-circle-check">
          </i>

          ${escaparHTML(
            item.categoria || ""
          )}

        </h2>


        <div class="dato">

          <span class="etiqueta">
            Folio:
          </span>

          ${escaparHTML(
            item.folio || ""
          )}

        </div>


        <div class="dato">

          <span class="etiqueta">
            Fecha:
          </span>

          ${escaparHTML(
            item.fecha || ""
          )}

        </div>

      `;


      // ==================================
      // CIUDADANOS
      // ==================================

      if (
        categoria === "ciudadanos"
      ) {


        // NOMBRE

        if (item.nombre) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Nombre:
              </span>

              ${escaparHTML(
                item.nombre
              )}

            </div>

          `;

        }


        // EDAD

        if (
          item.edad !== undefined &&
          item.edad !== null &&
          item.edad !== ""
        ) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Edad:
              </span>

              ${escaparHTML(
                item.edad
              )}

            </div>

          `;

        }


        // SEXO

        if (item.sexo) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Sexo:
              </span>

              ${escaparHTML(
                item.sexo
              )}

            </div>

          `;

        }


        // TELÉFONO

        if (item.telefono) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Teléfono:
              </span>

              ${escaparHTML(
                item.telefono
              )}

            </div>

          `;

        }


        // SECCIÓN

        if (item.seccion) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Sección:
              </span>

              ${escaparHTML(
                item.seccion
              )}

            </div>

          `;

        }


        // COMUNIDAD

        if (item.comunidad) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Comunidad:
              </span>

              ${escaparHTML(
                item.comunidad
              )}

            </div>

          `;

        }


        // CALLE

        if (item.calle) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Calle:
              </span>

              ${escaparHTML(
                item.calle
              )}

            </div>

          `;

        }


        // NÚMERO

        if (item.numero) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Número:
              </span>

              ${escaparHTML(
                item.numero
              )}

            </div>

          `;

        }


        // =================================
        // VOTAR
        // =================================

        let votar =
          String(
            item.votar ||
            "PENDIENTE"
          ).toUpperCase();


        let colorVotar =
          "#777";


        if (votar === "SI") {

          colorVotar =
            "#2e7d32";

        }

        else if (votar === "NO") {

          colorVotar =
            "#c62828";

        }


        contenido += `

          <div class="dato">

            <span class="etiqueta">
              ¿Votar?:
            </span>

            <strong
              style="
                color:${colorVotar};
                font-size:16px;
              "
            >

              ${escaparHTML(
                votar
              )}

            </strong>

          </div>


          <div
            style="
              margin-top:15px;
              display:flex;
              gap:8px;
              flex-wrap:wrap;
            "
          >

            <button
              type="button"
              class="btnVotar"
              onclick="cambiarVotar(
                '${escaparJS(item.folio)}',
                'SI'
              )"
              style="
                background:#2e7d32;
                color:white;
                border:none;
                padding:9px 14px;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
              "
            >

              <i class="fa-solid fa-check"></i>

              Sí

            </button>


            <button
              type="button"
              class="btnVotar"
              onclick="cambiarVotar(
                '${escaparJS(item.folio)}',
                'NO'
              )"
              style="
                background:#c62828;
                color:white;
                border:none;
                padding:9px 14px;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
              "
            >

              <i class="fa-solid fa-xmark"></i>

              No

            </button>


            <button
              type="button"
              class="btnVotar"
              onclick="cambiarVotar(
                '${escaparJS(item.folio)}',
                'PENDIENTE'
              )"
              style="
                background:#777;
                color:white;
                border:none;
                padding:9px 14px;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
              "
            >

              Pendiente

            </button>

          </div>

        `;

      }


      // ==================================
      // PETICIONES
      // ==================================

      else if (
        categoria === "peticiones"
      ) {

        if (item.tipo) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Tipo:
              </span>

              ${escaparHTML(
                item.tipo
              )}

            </div>

          `;

        }


        if (item.seccion) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Sección:
              </span>

              ${escaparHTML(
                item.seccion
              )}

            </div>

          `;

        }


        if (item.comunidad) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Comunidad:
              </span>

              ${escaparHTML(
                item.comunidad
              )}

            </div>

          `;

        }


        if (item.otro) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Otro:
              </span>

              ${escaparHTML(
                item.otro
              )}

            </div>

          `;

        }


        if (item.justificacion) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Justificación:
              </span>

              ${escaparHTML(
                item.justificacion
              )}

            </div>

          `;

        }

      }


      // ==================================
      // OPERACIONES
      // ==================================

      else if (
        categoria === "operaciones"
      ) {

        if (item.tipo) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Tipo:
              </span>

              ${escaparHTML(
                item.tipo
              )}

            </div>

          `;

        }


        if (item.seccion) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Sección:
              </span>

              ${escaparHTML(
                item.seccion
              )}

            </div>

          `;

        }


        if (item.comunidad) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Comunidad:
              </span>

              ${escaparHTML(
                item.comunidad
              )}

            </div>

          `;

        }


        if (item.calle) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Dirección:
              </span>

              ${escaparHTML(
                item.calle
              )}

              ${
                item.numero
                  ? " #" +
                    escaparHTML(
                      item.numero
                    )
                  : ""
              }

            </div>

          `;

        }


        if (item.estatus) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Estatus:
              </span>

              ${escaparHTML(
                item.estatus
              )}

            </div>

          `;

        }

      }


      // ==================================
      // BARDAS
      // ==================================

      else if (
        categoria === "bardas"
      ) {

        if (item.tipo) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Tipo:
              </span>

              ${escaparHTML(
                item.tipo
              )}

            </div>

          `;

        }


        if (item.seccion) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Sección:
              </span>

              ${escaparHTML(
                item.seccion
              )}

            </div>

          `;

        }


        if (item.comunidad) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Comunidad:
              </span>

              ${escaparHTML(
                item.comunidad
              )}

            </div>

          `;

        }


        if (item.calle) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Calle:
              </span>

              ${escaparHTML(
                item.calle
              )}

            </div>

          `;

        }


        if (item.numero) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Número:
              </span>

              ${escaparHTML(
                item.numero
              )}

            </div>

          `;

        }


        if (item.alto) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Alto:
              </span>

              ${escaparHTML(
                item.alto
              )} m

            </div>

          `;

        }


        if (item.ancho) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Ancho:
              </span>

              ${escaparHTML(
                item.ancho
              )} m

            </div>

          `;

        }


        if (item.metros) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Superficie:
              </span>

              <strong>
                ${escaparHTML(
                  item.metros
                )} m²
              </strong>

            </div>

          `;

        }


        if (item.autoriza) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Autoriza:
              </span>

              ${escaparHTML(
                item.autoriza
              )}

            </div>

          `;

        }


        if (item.estatus) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Estatus:
              </span>

              ${escaparHTML(
                item.estatus
              )}

            </div>

          `;

        }

      }


      // ==================================
      // REUNIONES
      // ==================================

      else if (
        categoria === "reuniones"
      ) {

        if (item.hora) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Hora:
              </span>

              ${escaparHTML(
                item.hora
              )}

            </div>

          `;

        }


        if (
          item.personas !== undefined &&
          item.personas !== null
        ) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Personas:
              </span>

              ${escaparHTML(
                item.personas
              )}

            </div>

          `;

        }


        if (item.seccion) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Sección:
              </span>

              ${escaparHTML(
                item.seccion
              )}

            </div>

          `;

        }


        if (item.comunidad) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Comunidad:
              </span>

              ${escaparHTML(
                item.comunidad
              )}

            </div>

          `;

        }


        if (item.calle) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Dirección:
              </span>

              ${escaparHTML(
                item.calle
              )}

              ${
                item.numero
                  ? " #" +
                    escaparHTML(
                      item.numero
                    )
                  : ""
              }

            </div>

          `;

        }


        if (item.responsable) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Responsable:
              </span>

              ${escaparHTML(
                item.responsable
              )}

            </div>

          `;

        }


        if (item.telefono) {

          contenido += `

            <div class="dato">

              <span class="etiqueta">
                Teléfono:
              </span>

              ${escaparHTML(
                item.telefono
              )}

            </div>

          `;

        }

      }


      // ==================================
      // MOSTRAR TARJETA
      // ==================================

      tarjeta.innerHTML =
        contenido;


      contenedor.appendChild(
        tarjeta
      );

    }
  );

}


// ========================================
// CAMBIAR VOTAR
// ========================================

function cambiarVotar(
  folio,
  valor
) {

  const usuario =
    obtenerUsuario();

  if (!usuario) {
    return;
  }


  if (!folio) {

    alert(
      "El registro no tiene folio."
    );

    return;

  }


  valor =
    String(valor).toUpperCase();


  if (
    valor !== "SI" &&
    valor !== "NO" &&
    valor !== "PENDIENTE"
  ) {

    alert(
      "Valor de votación no válido."
    );

    return;

  }


  const confirmar =
    confirm(
      "¿Deseas cambiar ¿Votar? a: " +
      valor +
      "?"
    );


  if (!confirmar) {
    return;
  }


  const botones =
    document.querySelectorAll(
      ".btnVotar"
    );


  botones.forEach(
    function(boton) {

      boton.disabled =
        true;

    }
  );


  fetch(
    URL_APPS_SCRIPT,
    {

      method: "POST",

      headers: {

        "Content-Type":
          "text/plain;charset=utf-8"

      },

      body: JSON.stringify({

        accion:
          "cambiarVotar",

        usuario:
          usuario,

        folio:
          folio,

        votar:
          valor

      })

    }
  )

  .then(
    function(respuesta) {

      if (!respuesta.ok) {

        throw new Error(
          "No se pudo conectar con Apps Script."
        );

      }

      return respuesta.json();

    }
  )

  .then(
    function(resultado) {

      console.log(
        "RESPUESTA CAMBIAR VOTAR:",
        resultado
      );


      if (!resultado.ok) {

        throw new Error(
          resultado.mensaje ||
          "No se pudo actualizar el voto."
        );

      }


      alert(
        "Se actualizó correctamente."
      );


      // Recargar Ciudadanos

      cargarCategoria(
        "ciudadanos"
      );

    }
  )

  .catch(
    function(error) {

      console.error(
        "ERROR CAMBIAR VOTAR:",
        error
      );


      alert(
        "No se pudo actualizar ¿Votar?.\n\n" +
        error.message
      );


      botones.forEach(
        function(boton) {

          boton.disabled =
            false;

        }
      );

    }
  );

}


// ========================================
// ESCAPAR HTML
// ========================================

function escaparHTML(valor) {

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
// ESCAPAR JAVASCRIPT
// ========================================

function escaparJS(valor) {

  return String(valor)

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    )

    .replace(
      /"/g,
      '\\"'
    )

    .replace(
      /\r/g,
      "\\r"
    )

    .replace(
      /\n/g,
      "\\n"
    );

}


// ========================================
// REGRESAR
// ========================================

function regresar() {

  window.location =
    "Menu.html";

}