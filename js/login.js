const URL_APPS_SCRIPT =
  "https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";

const boton = document.getElementById("login");
const mensaje = document.getElementById("mensaje");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const botonVer = document.getElementById("ver");


// ========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ========================================

if (botonVer) {

    botonVer.addEventListener("click", function (event) {

        event.preventDefault();

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            botonVer.innerHTML =
                '<i class="fa fa-eye-slash"></i>';

        } else {

            passwordInput.type = "password";

            botonVer.innerHTML =
                '<i class="fa fa-eye"></i>';

        }

    });

}


// ========================================
// INICIAR SESIÓN
// ========================================

async function iniciarSesion() {

    const usuario =
        usuarioInput.value.trim();

    const password =
        passwordInput.value.trim();


    // ====================================
    // VALIDAR CAMPOS
    // ====================================

    if (!usuario || !password) {

        mensaje.textContent =
            "Escribe usuario y contraseña.";

        return;

    }


    boton.disabled = true;

    boton.textContent =
        "Conectando...";

    mensaje.textContent =
        "Verificando usuario y contraseña...";


    try {

        console.log("USUARIO:", usuario);


        // ====================================
        // ENVIAR A APPS SCRIPT
        // ====================================

        const respuesta = await fetch(
            URL_APPS_SCRIPT,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    accion: "login",

                    usuario: usuario,

                    password: password

                })

            }
        );


        console.log(
            "HTTP:",
            respuesta.status
        );


        // ====================================
        // LEER RESPUESTA
        // ====================================

        const texto =
            await respuesta.text();


        console.log(
            "RESPUESTA RAW:",
            texto
        );


        let resultado;


        try {

            resultado =
                JSON.parse(texto);

        } catch (error) {

            console.error(
                "RESPUESTA NO JSON:",
                texto
            );

            mensaje.textContent =
                "El servidor devolvió una respuesta inválida.";

            boton.disabled = false;

            boton.textContent =
                "Iniciar Sesión";

            return;

        }


        console.log(
            "RESULTADO:",
            resultado
        );


        // ====================================
        // LOGIN CORRECTO
        // ====================================

        if (resultado.ok === true) {

            console.log(
                "LOGIN CORRECTO"
            );


            // ==================================
            // GUARDAR SESIÓN
            // ==================================

            localStorage.setItem(
                "usuario",
                resultado.usuario || usuario
            );

            localStorage.setItem(
                "nombre",
                resultado.nombre || ""
            );

            localStorage.setItem(
                "rol",
                resultado.rol || ""
            );


            console.log(
                "USUARIO GUARDADO:",
                localStorage.getItem("usuario")
            );

            console.log(
                "NOMBRE GUARDADO:",
                localStorage.getItem("nombre")
            );

            console.log(
                "ROL GUARDADO:",
                localStorage.getItem("rol")
            );


            mensaje.textContent =
                "Inicio de sesión correcto.";


            // ==================================
            // IR AL MENÚ
            // ==================================

           window.location.href =
    "./Menu.html";

            return;

        }


        // ====================================
        // LOGIN INCORRECTO
        // ====================================

        mensaje.textContent =
            resultado.mensaje ||
            "Usuario o contraseña incorrectos.";


        boton.disabled = false;

        boton.textContent =
            "Iniciar Sesión";


    } catch (error) {

        console.error(
            "ERROR COMPLETO:",
            error
        );


        mensaje.textContent =
            "Error de conexión con Google Apps Script.";


        boton.disabled = false;

        boton.textContent =
            "Iniciar Sesión";

    }

}


// ========================================
// BOTÓN LOGIN
// ========================================

if (boton) {

    boton.addEventListener(
        "click",
        iniciarSesion
    );

}


// ========================================
// ENTER
// ========================================

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                iniciarSesion();

            }

        }
    );

}