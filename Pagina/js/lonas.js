const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbyQIpdzQUZ5QVmOHxvY5xmA9CHtmF0HIUPy0ewA9fN-G_A273ExbS0kTnjiE7JxHEBHFw/exec";


// ========================================
// ELEMENTOS
// ========================================

const seccion =
  document.getElementById("seccion");

const comunidad =
  document.getElementById("comunidad");

const fotoLona =
  document.getElementById("fotoLona");

const vistaLona =
  document.getElementById("vistaLona");

const autoriza =
  document.getElementById("autoriza");


// ========================================
// COMUNIDADES POR SECCIÓN
// ========================================

const comunidades = {

  "4953": [
    "MIRAFLORES"
  ],

  "4954": [
    "LA JOYA IXTACALA"
  ],

  "4955": [
    "P.I.P.S.A."
  ],

  "4962": [
    "SAN JUAN IXTACALA AMPL. NORTE"
  ],

  "5025": [
    "SAN JUAN IXTACALA AMPL. NORTE"
  ],

  "5026": [
    "SAN JUAN IXTACALA"
  ],

  "5027": [
    "JOYA IXTACALA"
  ],

  "5034": [
    "PARQUE INDUS. SAN PABLO XALPA"
  ],

  "5035": [
    "PRADO IXTACALA"
  ],

  "5036": [
    "CEYLAN IXTACALA",
    "SAN JUAN IXTACALA"
  ],

  "5049": [
    "SAN JUAN IXTACALA"
  ],

  "5050": [
    "NUEVA IXTACALA"
  ],

  "5066": [
    "BOSQUES CEYLAN"
  ],

  "5067": [
    "BOSQUES CEYLAN"
  ],

  "5068": [
    "BOSQUES CEYLAN"
  ],

  "5069": [
    "BOSQUES CEYLAN"
  ],

  "5070": [
    "VENUSTIANO CARRANZA"
  ],

  "5071": [
    "PRADO VALLEJO"
  ],

  "5072": [
    "PRADO VALLEJO"
  ],

  "5073": [
    "PRADO VALLEJO"
  ],

  "5074": [
    "EX HACIENDA DE EN MEDIO"
  ],

  "5075": [
    "EX HACIENDA DE EN MEDIO"
  ],

  "5076": [
    "PRENSA NACIONAL"
  ],

  "5077": [
    "PRENSA NACIONAL"
  ],

  "5078": [
    "PRENSA NACIONAL"
  ],

  "5079": [
    "ROSARIO CEYLAN"
  ],

  "5080": [
    "MARAVILLAS CEYLAN"
  ]

};


// ========================================
// VINCULAR SECCIÓN CON COMUNIDAD
// ========================================

if (seccion && comunidad) {

  seccion.addEventListener(
    "change",
    function () {

      // Limpiar comunidad

      comunidad.innerHTML =
        '<option value="">Seleccione comunidad</option>';


      // Obtener sección seleccionada

      const valorSeccion =
        String(
          seccion.value
        ).trim();


      console.log(
        "SECCIÓN SELECCIONADA:",
        valorSeccion
      );


      // Buscar comunidades

      const lista =
        comunidades[valorSeccion] || [];


      console.log(
        "COMUNIDADES ENCONTRADAS:",
        lista
      );


      // ==================================
      // AGREGAR COMUNIDADES
      // ==================================

      lista.forEach(
        function (nombreComunidad) {

          const opcion =
            document.createElement("option");


          opcion.value =
            nombreComunidad;


          opcion.textContent =
            nombreComunidad;


          comunidad.appendChild(
            opcion
          );

        }
      );


      // ==================================
      // SELECCIÓN AUTOMÁTICA
      // ==================================

      if (
        lista.length === 1
      ) {

        comunidad.value =
          lista[0];

      }

    }
  );

}


// ========================================
// PREVISUALIZAR FOTOGRAFÍA
// ========================================

if (fotoLona && vistaLona) {

  fotoLona.addEventListener(
    "change",
    function () {

      if (
        this.files &&
        this.files[0]
      ) {

        const lector =
          new FileReader();


        lector.onload =
          function (e) {

            vistaLona.src =
              e.target.result;

          };


        lector.readAsDataURL(
          this.files[0]
        );

      } else {

        vistaLona.src = "";

      }

    }
  );

}


// ========================================
// LEER IMAGEN
// ========================================

function leerImagen(archivo) {

  return new Promise(
    function (resolve, reject) {

      const lector =
        new FileReader();


      lector.onload =
        function (e) {

          resolve(
            e.target.result
          );

        };


      lector.onerror =
        function () {

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
// GUARDAR LONA
// ========================================

async function guardarLona() {

  console.log(
    "================================"
  );

  console.log(
    "INICIANDO SOLICITUD DE LONA"
  );

  console.log(
    "================================"
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


  // ========================================
  // COMPROBAR SESIÓN
  // ========================================

  if (!usuario) {

    alert(
      "No hay una sesión activa."
    );


    window.location.href =
      "index.html";


    return;

  }


  // ========================================
  // LEER FORMULARIO
  // ========================================

  const valorSeccion =
    document
      .getElementById("seccion")
      .value
      .trim();


  const valorComunidad =
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


  const tipoLona =
    document
      .getElementById("tipoLona")
      .value
      .trim();


  // ========================================
  // PERSONA QUE AUTORIZA
  // ========================================

  const nombreAutoriza =
    document
      .getElementById("autoriza")
      .value
      .trim();


  // ========================================
  // VALIDAR SECCIÓN
  // ========================================

  if (!valorSeccion) {

    alert(
      "Selecciona una sección."
    );

    document
      .getElementById("seccion")
      .focus();

    return;

  }


  // ========================================
  // VALIDAR COMUNIDAD
  // ========================================

  if (!valorComunidad) {

    alert(
      "Selecciona una comunidad."
    );

    document
      .getElementById("comunidad")
      .focus();

    return;

  }


  // ========================================
  // VALIDAR CALLE
  // ========================================

  if (!calle) {

    alert(
      "Escribe la calle."
    );

    document
      .getElementById("calle")
      .focus();

    return;

  }


  // ========================================
  // VALIDAR NÚMERO
  // ========================================

  if (!numero) {

    alert(
      "Escribe el número."
    );

    document
      .getElementById("numero")
      .focus();

    return;

  }


  // ========================================
  // VALIDAR TIPO DE LONA
  // ========================================

  if (!tipoLona) {

    alert(
      "Selecciona el tipo de lona."
    );

    document
      .getElementById("tipoLona")
      .focus();

    return;

  }


  // ========================================
  // VALIDAR QUIEN AUTORIZA
  // ========================================

  if (!nombreAutoriza) {

    alert(
      "Escribe el nombre de quien autoriza la colocación."
    );

    autoriza.focus();

    return;

  }


  // ========================================
  // VALIDAR FOTOGRAFÍA
  // ========================================

  if (
    !fotoLona.files ||
    !fotoLona.files[0]
  ) {

    alert(
      "Selecciona la fotografía del lugar."
    );

    fotoLona.focus();

    return;

  }


  // ========================================
  // BOTÓN
  // ========================================

  const boton =
    document.querySelector(".boton");


  if (boton) {

    boton.disabled = true;

    boton.textContent =
      "Guardando...";

  }


  try {

    // ======================================
    // LEER FOTO
    // ======================================

    const foto =
      await leerImagen(
        fotoLona.files[0]
      );


    // ======================================
    // DATOS
    // ======================================

    const datos = {

      accion:
        "registrarLona",

      usuario:
        usuario,

      nombreUsuario:
        nombre,

      rol:
        rol,

      seccion:
        valorSeccion,

      comunidad:
        valorComunidad,

      calle:
        calle,

      numero:
        numero,

      tipoLona:
        tipoLona,

      autoriza:
        nombreAutoriza,

      foto:
        foto

    };


    console.log(
      "DATOS QUE SE ENVIARÁN:",
      datos
    );


    // ======================================
    // ENVIAR A APPS SCRIPT
    // ======================================

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
            JSON.stringify(datos)

        }
      );


    // ======================================
    // LEER RESPUESTA
    // ======================================

    const texto =
      await respuesta.text();


    console.log(
      "RESPUESTA APPS SCRIPT:",
      texto
    );


    let resultado;


    try {

      resultado =
        JSON.parse(texto);

    } catch (error) {

      console.error(
        "RESPUESTA NO ES JSON:",
        texto
      );


      throw new Error(
        "El servidor no devolvió una respuesta válida."
      );

    }


    // ======================================
    // RESULTADO CORRECTO
    // ======================================

    if (
      resultado.ok === true
    ) {

      alert(

        "Solicitud de lona registrada correctamente.\n\n" +

        "Folio: " +

        resultado.folio

      );


      // ====================================
      // LIMPIAR FORMULARIO
      // ====================================

      seccion.value =
        "";


      comunidad.innerHTML =
        '<option value="">Seleccione comunidad</option>';


      document
        .getElementById("calle")
        .value =
        "";


      document
        .getElementById("numero")
        .value =
        "";


      document
        .getElementById("tipoLona")
        .value =
        "";


      autoriza.value =
        "";


      fotoLona.value =
        "";


      vistaLona.src =
        "";


    } else {

      alert(

        resultado.mensaje ||

        "No se pudo guardar la solicitud."

      );

    }


  } catch (error) {

    console.error(
      "ERROR AL GUARDAR LONA:",
      error
    );


    alert(

      "Error al guardar la solicitud:\n\n" +

      error.message

    );


  } finally {

    if (boton) {

      boton.disabled =
        false;


      boton.textContent =
        "Guardar Solicitud";

    }

  }

}