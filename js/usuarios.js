// ========================================
// CONFIGURACIÓN
// ========================================

const URL_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";




// ========================================
// VARIABLES
// ========================================

let usuarioSesion =
  localStorage.getItem("usuario") || "";

let nombreSesion =
  localStorage.getItem("nombre") || "";

let rolSesion =
  localStorage.getItem("rol") || "";

let usuarios = [];

let modoEdicion = false;

let idEditando = "";


// ========================================
// INICIAR
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const nombreUsuario =
      document.getElementById("nombreUsuario");

    const rolUsuario =
      document.getElementById("rolUsuario");

    if (nombreUsuario) {

      nombreUsuario.textContent =
        nombreSesion ||
        usuarioSesion ||
        "Sin usuario";

    }

    if (rolUsuario) {

      rolUsuario.textContent =
        rolSesion ||
        "Sin rol";

    }

    if (!usuarioSesion) {

      alert("No existe una sesión activa.");

      window.location.href =
        "index.html";

      return;

    }

    if (
      rolSesion.trim().toLowerCase() !==
      "administrador"
    ) {

      alert(
        "No tiene permisos para administrar usuarios."
      );

      window.location.href =
        "Menu.html";

      return;

    }

    const formulario =
      document.getElementById("formUsuario");

    if (formulario) {

      formulario.addEventListener(
        "submit",
        guardarUsuario
      );

    }

    cargarUsuarios();

  }
);


// ========================================
// CARGAR USUARIOS
// ========================================

async function cargarUsuarios() {

  const tabla =
    document.getElementById(
      "tablaUsuarios"
    );

  if (tabla) {

    tabla.innerHTML = `
      <tr>
        <td colspan="8">
          Cargando usuarios...
        </td>
      </tr>
    `;

  }

  try {

    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({

            accion:
              "obtenerUsuarios",

            usuario:
              usuarioSesion,

            usuarioSesion:
              usuarioSesion,

            rol:
              rolSesion,

            rolSesion:
              rolSesion

          })

        }
      );

    const texto =
      await respuesta.text();

    console.log(
      "RESPUESTA USUARIOS:",
      texto
    );

    if (!texto) {

      throw new Error(
        "El servidor no devolvió información."
      );

    }

    const resultado =
      JSON.parse(texto);

    if (resultado.ok !== true) {

      throw new Error(
        resultado.mensaje ||
        "No se pudieron obtener los usuarios."
      );

    }

    usuarios =
      resultado.usuarios || [];

    mostrarUsuarios(
      usuarios
    );

    if (!modoEdicion) {

      generarSiguienteID();

    }

  }
  catch (error) {

    console.error(
      "ERROR USUARIOS:",
      error
    );

    if (tabla) {

      tabla.innerHTML = `
        <tr>
          <td colspan="8">
            Error al cargar usuarios.
          </td>
        </tr>
      `;

    }

    mostrarMensaje(
      "Error: " + error.message,
      "error"
    );

  }

}


// ========================================
// MOSTRAR USUARIOS
// ========================================

function mostrarUsuarios(lista) {

  const tabla =
    document.getElementById(
      "tablaUsuarios"
    );

  if (!tabla) return;

  tabla.innerHTML = "";

  if (
    !Array.isArray(lista) ||
    lista.length === 0
  ) {

    tabla.innerHTML = `
      <tr>
        <td colspan="8">
          No hay usuarios registrados.
        </td>
      </tr>
    `;

    return;

  }

  lista.forEach(function (item) {

    const fila =
      document.createElement("tr");

    if (
      String(item.activo)
        .toUpperCase() === "NO"
    ) {

      fila.className =
        "usuario-inactivo";

    }

    fila.innerHTML = `

      <td>
        ${escaparHTML(item.id)}
      </td>

      <td>
        ${escaparHTML(item.nombre)}
      </td>

      <td>
        ${escaparHTML(item.usuario)}
      </td>

      <td>
        ${escaparHTML(item.rol)}
      </td>

      <td>
        ${escaparHTML(item.activo)}
      </td>

      <td>
        ${escaparHTML(item.direccion)}
      </td>

      <td>
        ${escaparHTML(item.telefono)}
      </td>

      <td>

        <button
          type="button"
          class="accion editar"
          onclick="editarUsuario('${escaparJS(item.id)}')">

          <i class="fa-solid fa-pen"></i>

        </button>

        <button
          type="button"
          class="accion activar"
          onclick="cambiarActivo('${escaparJS(item.id)}')">

          <i class="fa-solid fa-power-off"></i>

        </button>

      </td>

    `;

    tabla.appendChild(fila);

  });

}


// ========================================
// GENERAR SIGUIENTE ID
// ========================================

function generarSiguienteID() {

  const campo =
    document.getElementById(
      "idUsuario"
    );

  if (!campo) return;

  let mayor = 0;

  usuarios.forEach(function (item) {

    const id =
      Number(item.id);

    if (
      !isNaN(id) &&
      id > mayor
    ) {

      mayor = id;

    }

  });

  campo.value =
    mayor + 1;

}


// ========================================
// GUARDAR / ACTUALIZAR
// ========================================

async function guardarUsuario(evento) {

  evento.preventDefault();

  const id =
    document.getElementById(
      "idUsuario"
    ).value.trim();

  const nombre =
    document.getElementById(
      "nombre"
    ).value.trim();

  const usuario =
    document.getElementById(
      "usuario"
    ).value.trim();

  const password =
    document.getElementById(
      "password"
    ).value.trim();

  const rol =
    document.getElementById(
      "rol"
    ).value;

  const activo =
    document.getElementById(
      "activo"
    ).value;

  const direccion =
    document.getElementById(
      "direccion"
    ).value.trim();

  const telefono =
    document.getElementById(
      "telefono"
    ).value.trim();


  // ==================================
  // VALIDACIONES
  // ==================================

  if (
    !nombre ||
    !usuario ||
    !rol ||
    !activo ||
    !direccion ||
    !telefono
  ) {

    mostrarMensaje(
      "Todos los campos son obligatorios.",
      "error"
    );

    return;

  }


  // ==================================
  // CONTRASEÑA
  // ==================================
  //
  // NUEVO USUARIO:
  // contraseña obligatoria.
  //
  // EDICIÓN:
  // contraseña vacía = conservar actual.
  //

  if (
    !modoEdicion &&
    !password
  ) {

    mostrarMensaje(
      "La contraseña es obligatoria para un usuario nuevo.",
      "error"
    );

    return;

  }


  // ==================================
  // VERIFICAR USUARIO DUPLICADO
  // ==================================

  const existe =
    usuarios.some(function (item) {

      const mismoUsuario =
        String(item.usuario || "")
          .trim()
          .toLowerCase() ===
        usuario
          .trim()
          .toLowerCase();

      const mismoID =
        String(item.id) ===
        String(id);

      return (
        mismoUsuario &&
        !mismoID
      );

    });


  if (existe) {

    mostrarMensaje(
      "El usuario ya existe y pertenece a otro registro.",
      "error"
    );

    return;

  }


  const boton =
    document.querySelector(
      "#formUsuario button[type='submit']"
    );

  if (boton) {

    boton.disabled = true;

    boton.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Guardando...
    `;

  }


  try {

    const accion =
      modoEdicion
        ? "actualizarUsuario"
        : "registrarUsuario";


    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body: JSON.stringify({

            accion: accion,

            id: id,

            nombre: nombre,

            usuario: usuario,

            password: password,

            rol: rol,

            activo: activo,

            direccion: direccion,

            telefono: telefono,

            usuarioSesion:
              usuarioSesion,

            rolSesion:
              rolSesion,

            usuario:
              usuario,

            rol:
              rol

          })

        }
      );


    const texto =
      await respuesta.text();

    console.log(
      "RESPUESTA GUARDAR:",
      texto
    );


    if (!texto) {

      throw new Error(
        "El servidor no devolvió información."
      );

    }


    const resultado =
      JSON.parse(texto);


    if (resultado.ok !== true) {

      throw new Error(
        resultado.mensaje ||
        "No se pudo guardar el usuario."
      );

    }


    if (modoEdicion) {

      mostrarMensaje(
        "Usuario actualizado correctamente.",
        "exito"
      );

    }
    else {

      mostrarMensaje(
        "Usuario registrado correctamente.",
        "exito"
      );

    }


    // ==================================
    // LIMPIAR
    // ==================================

    limpiarFormulario();


    // ==================================
    // RECARGAR
    // ==================================

    await cargarUsuarios();


  


  }
  catch (error) {

    console.error(
      "ERROR GUARDANDO:",
      error
    );

    mostrarMensaje(
      "Error: " + error.message,
      "error"
    );

  }
  finally {

    if (boton) {

      boton.disabled = false;

      boton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        ${modoEdicion
          ? "Actualizar usuario"
          : "Guardar usuario"}
      `;

    }

  }

}


// ========================================
// EDITAR USUARIO
// ========================================

function editarUsuario(id) {

  const usuarioEncontrado =
    usuarios.find(function (item) {

      return String(item.id) ===
        String(id);

    });


  if (!usuarioEncontrado) {

    mostrarMensaje(
      "No se encontró el usuario.",
      "error"
    );

    return;

  }


  // ==================================
  // ACTIVAR MODO EDICIÓN
  // ==================================

  modoEdicion = true;

  idEditando =
    String(usuarioEncontrado.id);


  document.getElementById(
    "idUsuario"
  ).value =
    usuarioEncontrado.id;


  document.getElementById(
    "nombre"
  ).value =
    usuarioEncontrado.nombre || "";


  document.getElementById(
    "usuario"
  ).value =
    usuarioEncontrado.usuario || "";


  document.getElementById(
    "rol"
  ).value =
    usuarioEncontrado.rol || "";


  document.getElementById(
    "activo"
  ).value =
    usuarioEncontrado.activo || "SI";


  document.getElementById(
    "direccion"
  ).value =
    usuarioEncontrado.direccion || "";


  document.getElementById(
    "telefono"
  ).value =
    usuarioEncontrado.telefono || "";


  // ==================================
  // IMPORTANTE
  // ==================================
  //
  // NO ponemos la contraseña.
  //
  // Si queda vacía:
  // el GS debe conservar la contraseña actual.
  //

  document.getElementById(
    "password"
  ).value = "";


  const boton =
    document.querySelector(
      "#formUsuario button[type='submit']"
    );


  if (boton) {

    boton.innerHTML = `
      <i class="fa-solid fa-pen"></i>
      Actualizar usuario
    `;

  }


  mostrarMensaje(
    "Usuario cargado para edición. Deja la contraseña vacía para conservar la actual.",
    "info"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ========================================
// CAMBIAR ACTIVO
// ========================================

async function cambiarActivo(id) {

  const usuarioEncontrado =
    usuarios.find(function (item) {

      return String(item.id) ===
        String(id);

    });


  if (!usuarioEncontrado) {

    return;

  }


  const actual =
    String(
      usuarioEncontrado.activo
    ).toUpperCase();


  const nuevo =
    actual === "SI"
      ? "NO"
      : "SI";


  const confirmar =
    confirm(
      "¿Desea cambiar el estado del usuario a " +
      nuevo +
      "?"
    );


  if (!confirmar) {

    return;

  }


  try {

    const respuesta =
      await fetch(
        URL_APPS_SCRIPT,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body: JSON.stringify({

            accion:
              "cambiarActivoUsuario",

            id:
              id,

            activo:
              nuevo,

            usuarioSesion:
              usuarioSesion,

            rolSesion:
              rolSesion

          })

        }
      );


    const texto =
      await respuesta.text();


    const resultado =
      JSON.parse(texto);


    if (resultado.ok !== true) {

      throw new Error(
        resultado.mensaje ||
        "No se pudo cambiar el estado."
      );

    }


    mostrarMensaje(
      "Estado actualizado correctamente.",
      "exito"
    );


    await cargarUsuarios();

  }
  catch (error) {

    mostrarMensaje(
      "Error: " + error.message,
      "error"
    );

  }

}


// ========================================
// FILTRAR USUARIOS
// ========================================

function filtrarUsuarios() {

  const campo =
    document.getElementById(
      "buscarUsuario"
    );

  if (!campo) return;

  const texto =
    campo.value
      .trim()
      .toLowerCase();


  const filtrados =
    usuarios.filter(function (item) {

      return (

        String(
          item.nombre || ""
        )
        .toLowerCase()
        .includes(texto)

        ||

        String(
          item.usuario || ""
        )
        .toLowerCase()
        .includes(texto)

      );

    });


  mostrarUsuarios(
    filtrados
  );

}


// ========================================
// LIMPIAR FORMULARIO
// ========================================

function limpiarFormulario() {

  const formulario =
    document.getElementById(
      "formUsuario"
    );


  if (formulario) {

    formulario.reset();

  }


  modoEdicion = false;

  idEditando = "";


  document.getElementById(
    "activo"
  ).value = "SI";


  const boton =
    document.querySelector(
      "#formUsuario button[type='submit']"
    );


  if (boton) {

    boton.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar usuario
    `;

  }


  generarSiguienteID();

}


// ========================================
// MENSAJE
// ========================================

function mostrarMensaje(
  texto,
  tipo
) {

  const mensaje =
    document.getElementById(
      "mensaje"
    );


  if (!mensaje) return;


  mensaje.textContent =
    texto;


  mensaje.className =
    "mensaje " + tipo;

}


// ========================================
// PROTEGER HTML
// ========================================

function escaparHTML(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ========================================
// PROTEGER JAVASCRIPT
// ========================================

function escaparJS(valor) {

  if (
    valor === null ||
    valor === undefined
  ) {

    return "";

  }


  return String(valor)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');

}


// ========================================
// REGRESAR AL MENÚ
// ========================================

function regresarMenu() {

  window.location.href =
    "Menu.html";

}