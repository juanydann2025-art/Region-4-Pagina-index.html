const URL_APPS_SCRIPT =
 "https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";




// ========================================
// ELEMENTOS
// ========================================

const fotoSolicitud =
  document.getElementById(
    "fotoSolicitud"
  );

const vistaSolicitud =
  document.getElementById(
    "vistaSolicitud"
  );
// ========================================
// SECCIÓN → COMUNIDAD
// ========================================

const comunidadesPorSeccion = {

  "4953": ["MIRAFLORES"],

  "4954": ["LA JOYA IXTACALA"],

  "4955": ["P.I.P.S.A."],

  "4962": ["SAN JUAN IXTACALA AMPL. NORTE"],

  "5025": ["SAN JUAN IXTACALA AMPL. NORTE"],

  "5026": ["SAN JUAN IXTACALA"],

  "5027": ["JOYA IXTACALA"],

  "5034": ["PARQUE INDUS. SAN PABLO XALPA"],

  "5035": ["PRADO IXTACALA"],

  "5036": [
    "CEYLAN IXTACALA",
    "SAN JUAN IXTACALA"
  ],

  "5049": ["SAN JUAN IXTACALA"],

  "5050": ["NUEVA IXTACALA"],

  "5066": ["BOSQUES CEYLAN"],

  "5067": ["BOSQUES CEYLAN"],

  "5068": ["BOSQUES CEYLAN"],

  "5069": ["EX HACIENDA DE EN MEDIO"],

  "5070": ["VENUSTIANO CARRANZA"],

  "5071": ["PRADO VALLEJO"],

  "5072": ["PRADO VALLEJO"],

  "5073": ["PRADO VALLEJO"],

  "5074": ["EX HACIENDA DE EN MEDIO"],

  "5075": ["EX HACIENDA DE EN MEDIO"],

  "5076": ["PRENSA NACIONAL"],

  "5077": ["PRENSA NACIONAL"],

  "5078": ["PRENSA NACIONAL"],

  "5079": ["ROSARIO CEYLAN"],

  "5080": ["MARAVILLAS CEYLAN"]

};


// ========================================
// ELEMENTOS SECCIÓN Y COMUNIDAD
// ========================================

const selectorSeccion =
  document.getElementById("seccion");

const selectorComunidad =
  document.getElementById("comunidad");


// ========================================
// CAMBIAR COMUNIDAD
// ========================================

if (
  selectorSeccion &&
  selectorComunidad
) {

  selectorSeccion.addEventListener(
    "change",
    function() {

      const seccion =
        selectorSeccion.value;

      selectorComunidad.innerHTML = "";


      const comunidades =
        comunidadesPorSeccion[seccion] || [];


      comunidades.forEach(
        function(comunidad, indice) {

          const opcion =
            document.createElement("option");

          opcion.value =
            comunidad;

          opcion.textContent =
            comunidad;

          // Primera comunidad
          // seleccionada automáticamente

          if (indice === 0) {

            opcion.selected = true;

          }

          selectorComunidad.appendChild(
            opcion
          );

        }
      );


      // Si no existe comunidad

      if (!comunidades.length) {

        const opcion =
          document.createElement("option");

        opcion.value = "";

        opcion.textContent =
          "Seleccione comunidad";

        selectorComunidad.appendChild(
          opcion
        );

      }

    }
  );

}

// ========================================
// PREVISUALIZAR FOTO
// ========================================

if (fotoSolicitud) {

  fotoSolicitud.addEventListener(
    "change",
    function() {

      if (
        this.files &&
        this.files[0]
      ) {

        const lector =
          new FileReader();

        lector.onload =
          function(e) {

            vistaSolicitud.src =
              e.target.result;

          };

        lector.readAsDataURL(
          this.files[0]
        );

      }

    }
  );

}


// ========================================
// LEER IMAGEN
// ========================================

function leerImagen(archivo) {

  return new Promise(
    function(resolve, reject) {

      const lector =
        new FileReader();

      lector.onload =
        function(e) {

          resolve(
            e.target.result
          );

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


// ========================================
// GUARDAR PETICIÓN
// ========================================

async function guardarPeticion() {

  console.log(
    "INICIANDO PETICIÓN"
  );


  // ========================================
  // SESIÓN
  // ========================================

  const usuario =
    localStorage.getItem("usuario") || "";

  const nombre =
    localStorage.getItem("nombre") || "";

  const rol =
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


  if (!usuario) {

    alert(
      "No hay una sesión activa."
    );

    window.location.href =
      "index.html";

    return;

  }


  // ========================================
  // DATOS DEL FORMULARIO
  // ========================================

  const tipo =
    document
      .getElementById("tipoSolicitud")
      .value
      .trim();

const seccion =
  document
    .getElementById("seccion")
    .value
    .trim();


const comunidad =
  document
    .getElementById("comunidad")
    .value
    .trim();
  
const otro =
    document
      .getElementById("otroSolicitud")
      .value
      .trim();


  const justificacion =
    document
      .getElementById("justificacion")
      .value
      .trim();


  // ========================================
  // VALIDACIONES
  // ========================================
if (!seccion) {

  alert(
    "Selecciona la sección."
  );

  return;

}


if (!comunidad) {

  alert(
    "Selecciona la comunidad."
  );

  return;

}
  if (!tipo) {

    alert(
      "Selecciona el tipo de solicitud."
    );

    return;

  }


  if (
    tipo === "Otro" &&
    !otro
  ) {

    alert(
      "Especifica la solicitud."
    );

    return;

  }


  if (!justificacion) {

    alert(
      "Escribe la justificación."
    );

    return;

  }


  if (
    !fotoSolicitud.files ||
    !fotoSolicitud.files[0]
  ) {

    alert(
      "Selecciona la fotografía de evidencia."
    );

    return;

  }


  const boton =
    document.querySelector(".boton");


  boton.disabled = true;

  boton.textContent =
    "Guardando...";


  try {

    // ========================================
    // LEER FOTO
    // ========================================

    const foto =
      await leerImagen(
        fotoSolicitud.files[0]
      );


    // ========================================
    // DATOS
    // ========================================

    const datos = {

      accion:
        "registrarPeticion",

      usuario:
        usuario,

      nombre:
        nombre,

      rol:
        rol,
seccion:
  seccion,

comunidad:
  comunidad,
      tipo:
        tipo,

      otro:
        otro,

      justificacion:
        justificacion,

      foto:
        foto

    };


    console.log(
      "ENVIANDO PETICIÓN:",
      datos
    );


    // ========================================
    // ENVIAR
    // ========================================

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
            JSON.stringify(datos)

        }
      );


    const texto =
      await respuesta.text();


    console.log(
      "RESPUESTA APPS SCRIPT:",
      texto
    );


    const resultado =
      JSON.parse(texto);


    // ========================================
    // RESULTADO
    // ========================================

    if (
      resultado.ok === true
    ) {

      alert(
        "Petición registrada correctamente.\n\n" +
        "Folio: " +
        resultado.folio
      );


      document
        .getElementById(
          "tipoSolicitud"
        )
        .value = "";


      document
        .getElementById(
          "otroSolicitud"
        )
        .value = "";


      document
        .getElementById(
          "justificacion"
        )
        .value = "";


      fotoSolicitud.value = "";

      vistaSolicitud.src = "";


      window.location =
        "Menu.html";


    } else {

      alert(
        resultado.mensaje ||
        "No se pudo guardar la petición."
      );

    }


  } catch(error) {

    console.error(
      "ERROR PETICIÓN:",
      error
    );

    alert(
      "Error al guardar la petición:\n\n" +
      error.message
    );


  } finally {

    boton.disabled = false;

    boton.textContent =
      "Guardar Solicitud";

  }

}