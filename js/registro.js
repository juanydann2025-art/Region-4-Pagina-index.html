const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyQIpdzQUZ5QVmOHxvY5xmA9CHtmF0HIUPy0ewA9fN-G_A273ExbS0kTnjiE7JxHEBHFw/exec";


// ========================================
// MOSTRAR IMAGEN
// ========================================

function mostrarImagen(input, img) {

  if (
    input.files &&
    input.files[0]
  ) {

    const lector = new FileReader();

    lector.onload = function(e) {

      img.src = e.target.result;

    };

    lector.readAsDataURL(
      input.files[0]
    );

  }

}


// ========================================
// ELEMENTOS
// ========================================

const ineFrente =
  document.getElementById("ineFrente");

const ineAtras =
  document.getElementById("ineAtras");

const vistaFrente =
  document.getElementById("vistaFrente");

const vistaAtras =
  document.getElementById("vistaAtras");


// ========================================
// PREVISUALIZAR FRENTE
// ========================================

if (ineFrente) {

  ineFrente.addEventListener(
    "change",
    function() {

      mostrarImagen(
        ineFrente,
        vistaFrente
      );

    }
  );

}


// ========================================
// PREVISUALIZAR ATRÁS
// ========================================

if (ineAtras) {

  ineAtras.addEventListener(
    "change",
    function() {

      mostrarImagen(
        ineAtras,
        vistaAtras
      );

    }
  );

}


// ========================================
// COMPRIMIR IMAGEN
// ========================================

function comprimirImagen(archivo) {

  return new Promise(
    function(resolve, reject) {

      const lector =
        new FileReader();

      lector.onload =
        function(evento) {

          const imagen =
            new Image();

          imagen.onload =
            function() {

              const MAXIMO = 1600;

              let ancho = imagen.width;
              let alto = imagen.height;

              if (
                ancho > MAXIMO ||
                alto > MAXIMO
              ) {

                if (ancho > alto) {

                  alto =
                    alto * MAXIMO / ancho;

                  ancho = MAXIMO;

                } else {

                  ancho =
                    ancho * MAXIMO / alto;

                  alto = MAXIMO;

                }

              }

              const canvas =
                document.createElement(
                  "canvas"
                );

              canvas.width = ancho;
              canvas.height = alto;

              const contexto =
                canvas.getContext("2d");

              contexto.drawImage(
                imagen,
                0,
                0,
                ancho,
                alto
              );

              resolve(
                canvas.toDataURL(
                  "image/jpeg",
                  0.75
                )
              );

            };

          imagen.onerror =
            function() {

              reject(
                new Error(
                  "No se pudo procesar la imagen."
                )
              );

            };

          imagen.src =
            evento.target.result;

        };

      lector.onerror =
        function() {

          reject(
            new Error(
              "No se pudo leer la imagen."
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
// CAMBIAR COMUNIDAD AL ELEGIR SECCIÓN
// ========================================

const selectorSeccion =
  document.getElementById("seccion");

const selectorComunidad =
  document.getElementById("comunidad");


if (
  selectorSeccion &&
  selectorComunidad
) {

  selectorSeccion.addEventListener(
    "change",
    function() {

      const seccion =
        selectorSeccion.value;

      // Limpiar comunidades

      selectorComunidad.innerHTML = "";


      // Opción inicial

      const opcionInicial =
        document.createElement("option");

      opcionInicial.value = "";

      opcionInicial.textContent =
        "Seleccione comunidad";

      selectorComunidad.appendChild(
        opcionInicial
      );


      // Buscar comunidades

      const comunidades =
        comunidadesPorSeccion[seccion] || [];


      // Agregar comunidades

     comunidades.forEach(
  function(comunidad, indice) {

    const opcion =
      document.createElement("option");

    opcion.value =
      comunidad;

    opcion.textContent =
      comunidad;

    // Seleccionar automáticamente
    // la primera comunidad

    if (indice === 0) {

      opcion.selected = true;

    }

    selectorComunidad.appendChild(
      opcion
    );

  }
);

    }
  );

}
// ========================================
// REGISTRAR CIUDADANO
// ========================================

async function siguiente() {

  console.log(
    "INICIANDO REGISTRO CIUDADANO"
  );


  const nombre =
    document
      .getElementById("nombre")
      .value
      .trim();


  const edad =
    document
      .getElementById("edad")
      .value
      .trim();


  const sexo =
    document
      .getElementById("sexo")
      .value
      .trim();


  const telefono =
    document
      .getElementById("telefono")
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


  const calle =
    document
      .getElementById("calle")
      .value
      .trim();


  const numero =
    document
      .getElementById("numero")
      .value
      .trim();


  // ========================================
  // VALIDACIONES
  // ========================================

  if (!nombre) {
    alert("Escribe el nombre completo.");
    return;
  }

  if (!edad) {
    alert("Escribe la edad.");
    return;
  }

  if (!sexo) {
    alert("Selecciona el sexo.");
    return;
  }

  if (!telefono) {
    alert("Escribe el teléfono.");
    return;
  }

  if (
    !seccion ||
    seccion === "Seleccione sección"
  ) {

    alert("Selecciona una sección.");
    return;

  }

  if (
    !comunidad ||
    comunidad === "Seleccione comunidad"
  ) {

    alert("Selecciona una comunidad.");
    return;

  }

  if (!calle) {
    alert("Escribe la calle.");
    return;
  }

  if (!numero) {
    alert("Escribe el número.");
    return;
  }

  if (
    !ineFrente.files ||
    !ineFrente.files[0]
  ) {

    alert(
      "Selecciona la foto del INE frente."
    );

    return;

  }

  if (
    !ineAtras.files ||
    !ineAtras.files[0]
  ) {

    alert(
      "Selecciona la foto del INE atrás."
    );

    return;

  }


  const boton =
    document.querySelector(".boton");

  boton.disabled = true;
  boton.textContent = "Guardando...";


  try {

    // ========================================
    // COMPRIMIR IMÁGENES
    // ========================================

    const fotoFrente =
      await comprimirImagen(
        ineFrente.files[0]
      );

    const fotoAtras =
      await comprimirImagen(
        ineAtras.files[0]
      );


    // ========================================
    // USUARIO ACTIVO
    // ========================================

    const usuario =
      localStorage.getItem("usuario") || "";

    const nombreUsuario =
      localStorage.getItem("nombre") || "";

    const rol =
      localStorage.getItem("rol") || "";


    // ========================================
    // DATOS
    // ========================================

    const datos = {

      accion:
        "registrarCiudadano",

      usuario:
        usuario,

      nombreUsuario:
        nombreUsuario,

      rol:
        rol,

      nombre:
        nombre,

      edad:
        edad,

      sexo:
        sexo,

      telefono:
        telefono,

      seccion:
        seccion,

      comunidad:
        comunidad,

      calle:
        calle,

      numero:
        numero,

      ineFrente:
        fotoFrente,

      ineAtras:
        fotoAtras

    };


    console.log(
      "ENVIANDO CIUDADANO:",
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
        "Ciudadano registrado correctamente.\n\n" +
        "Folio: " +
        resultado.folio
      );


      // Limpiar formulario

      document
        .getElementById("nombre")
        .value = "";

      document
        .getElementById("edad")
        .value = "";

      document
        .getElementById("sexo")
        .value = "";

      document
        .getElementById("telefono")
        .value = "";

      document
        .getElementById("seccion")
        .value = "";

      document
        .getElementById("comunidad")
        .value = "";

      document
        .getElementById("calle")
        .value = "";

      document
        .getElementById("numero")
        .value = "";

      ineFrente.value = "";
      ineAtras.value = "";

      vistaFrente.src = "";
      vistaAtras.src = "";


    } else {

      alert(
        resultado.mensaje ||
        "No se pudo guardar el ciudadano."
      );

    }


  } catch(error) {

    console.error(
      "ERROR REGISTRO:",
      error
    );

    alert(
      "Error al guardar ciudadano:\n\n" +
      error.message
    );


  } finally {

    boton.disabled = false;

    boton.textContent =
      "Siguiente";

  }

}

