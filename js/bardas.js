const URL_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";




// ========================================
// ELEMENTOS
// ========================================

const seccion =
  document.getElementById("seccion");

const comunidad =
  document.getElementById("comunidad");

const calle =
  document.getElementById("calle");

const numero =
  document.getElementById("numero");

const alto =
  document.getElementById("alto");

const ancho =
  document.getElementById("ancho");

const metros =
  document.getElementById("metros");

const autoriza =
  document.getElementById("autoriza");

const fotoBarda =
  document.getElementById("fotoBarda");

const vistaBarda =
  document.getElementById("vistaBarda");


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

      comunidad.innerHTML =
        '<option value="">Seleccione comunidad</option>';


      const valorSeccion =
        String(
          this.value
        ).trim();


      console.log(
        "SECCIÓN:",
        valorSeccion
      );


      const lista =
        comunidades[
          valorSeccion
        ] || [];


      console.log(
        "COMUNIDADES:",
        lista
      );


      lista.forEach(
        function(nombreComunidad) {

          const opcion =
            document.createElement(
              "option"
            );


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
// CALCULAR METROS CUADRADOS
// ========================================

function calcularMetros() {

  const valorAlto =
    parseFloat(
      alto.value
    );


  const valorAncho =
    parseFloat(
      ancho.value
    );


  if (
    !isNaN(valorAlto) &&
    !isNaN(valorAncho) &&
    valorAlto > 0 &&
    valorAncho > 0
  ) {

    const resultado =
      valorAlto *
      valorAncho;


    metros.value =
      resultado.toFixed(2);

  } else {

    metros.value = "";

  }

}


if (alto) {

  alto.addEventListener(
    "input",
    calcularMetros
  );

}


if (ancho) {

  ancho.addEventListener(
    "input",
    calcularMetros
  );

}


// ========================================
// PREVISUALIZAR FOTO
// ========================================

if (fotoBarda) {

  fotoBarda.addEventListener(
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

            vistaBarda.src =
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
// GUARDAR BARDA
// ========================================

async function guardarBarda() {

  console.log(
    "INICIANDO SOLICITUD DE BARDA"
  );


  // =====================================
  // SESIÓN
  // =====================================

  const usuario =
    localStorage.getItem(
      "usuario"
    ) || "";


  const nombre =
    localStorage.getItem(
      "nombre"
    ) || "";


  const rol =
    localStorage.getItem(
      "rol"
    ) || "";


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


  // =====================================
  // COMPROBAR SESIÓN
  // =====================================

  if (!usuario) {

    alert(
      "No hay una sesión activa."
    );


    window.location.href =
      "index.html";


    return;

  }


  // =====================================
  // LEER FORMULARIO
  // =====================================

  const valorSeccion =
    seccion.value.trim();


  const valorComunidad =
    comunidad.value.trim();


  const valorCalle =
    calle.value.trim();


  const valorNumero =
    numero.value.trim();


  const valorAlto =
    alto.value.trim();


  const valorAncho =
    ancho.value.trim();


  const valorAutoriza =
    autoriza.value.trim();


  // =====================================
  // VALIDACIONES
  // =====================================

  if (!valorSeccion) {

    alert(
      "Selecciona una sección."
    );

    return;

  }


  if (!valorComunidad) {

    alert(
      "Selecciona una comunidad."
    );

    return;

  }


  if (!valorCalle) {

    alert(
      "Escribe la calle."
    );

    return;

  }


  if (!valorNumero) {

    alert(
      "Escribe el número."
    );

    return;

  }


  if (!valorAlto) {

    alert(
      "Escribe el alto de la barda en metros."
    );

    alto.focus();

    return;

  }


  if (
    parseFloat(valorAlto) <= 0
  ) {

    alert(
      "El alto debe ser mayor que cero."
    );

    alto.focus();

    return;

  }


  if (!valorAncho) {

    alert(
      "Escribe el ancho de la barda en metros."
    );

    ancho.focus();

    return;

  }


  if (
    parseFloat(valorAncho) <= 0
  ) {

    alert(
      "El ancho debe ser mayor que cero."
    );

    ancho.focus();

    return;

  }


  if (!valorAutoriza) {

    alert(
      "Escribe el nombre de quien autoriza."
    );

    autoriza.focus();

    return;

  }


  // =====================================
  // FOTO
  // =====================================

  if (
    !fotoBarda.files ||
    !fotoBarda.files[0]
  ) {

    alert(
      "Selecciona la fotografía de la barda."
    );

    return;

  }


  // =====================================
  // BOTÓN
  // =====================================

  const boton =
    document.querySelector(
      ".boton"
    );


  boton.disabled = true;


  boton.textContent =
    "Guardando...";


  try {

    // ===================================
    // LEER FOTO
    // ===================================

    const foto =
      await leerImagen(
        fotoBarda.files[0]
      );


    // ===================================
    // CALCULAR METROS
    // ===================================

    const superficie =
      (
        parseFloat(valorAlto) *
        parseFloat(valorAncho)
      ).toFixed(2);


    metros.value =
      superficie;


    // ===================================
    // DATOS
    // ===================================

    const datos = {

      accion:
        "registrarBarda",

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
        valorCalle,

      numero:
        valorNumero,

      alto:
        valorAlto,

      ancho:
        valorAncho,

      metros:
        superficie,

      autoriza:
        valorAutoriza,

      foto:
        foto

    };


    console.log(
      "ENVIANDO BARDA:",
      datos
    );


    // ===================================
    // ENVIAR A APPS SCRIPT
    // ===================================

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
            JSON.stringify(
              datos
            )

        }
      );


    // ===================================
    // RESPUESTA
    // ===================================

    const texto =
      await respuesta.text();


    console.log(
      "RESPUESTA APPS SCRIPT:",
      texto
    );


    const resultado =
      JSON.parse(
        texto
      );


    // ===================================
    // RESULTADO
    // ===================================

    if (
      resultado.ok === true
    ) {

      alert(

        "Solicitud de barda registrada correctamente.\n\n" +

        "Folio: " +

        resultado.folio

      );


      // =================================
      // LIMPIAR
      // =================================

      seccion.value =
        "";


      comunidad.innerHTML =
        '<option value="">Seleccione comunidad</option>';


      calle.value =
        "";


      numero.value =
        "";


      alto.value =
        "";


      ancho.value =
        "";


      metros.value =
        "";


      autoriza.value =
        "";


      fotoBarda.value =
        "";


      vistaBarda.src =
        "";

    }

    else {

      alert(

        resultado.mensaje ||

        "No se pudo guardar la solicitud."

      );

    }


  }

  catch(error) {

    console.error(
      "ERROR AL GUARDAR BARDA:",
      error
    );


    alert(

      "Error al guardar la solicitud:\n\n" +

      error.message

    );

  }


  finally {

    boton.disabled =
      false;


    boton.textContent =
      "Guardar Solicitud";

  }

}