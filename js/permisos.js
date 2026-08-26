// ========================================
// OBTENER ROL DEL USUARIO
// ========================================

const rolUsuario =
    (
        localStorage.getItem("rol") || ""
    )
    .trim()
    .toLowerCase();


// ========================================
// OCULTAR ELEMENTO
// ========================================

function ocultar(id) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.style.display =
            "none";

    }

}


// ========================================
// VERIFICAR PERMISOS
// ========================================

window.onload =
    function () {

        console.log(
            "ROL DEL USUARIO:",
            rolUsuario
        );


        // ==================================
        // ADMINISTRADOR
        // ==================================

        if (
            rolUsuario ===
            "administrador"
        ) {

            /*
             * ADMINISTRADOR
             * Tiene acceso a todo.
             */

            return;

        }


        // ==================================
        // COORDINADOR
        // ==================================

        if (
            rolUsuario ===
            "coordinador"
        ) {

            /*
             * COORDINADOR
             *
             * Puede:
             * - Estadísticas
             * - Validaciones
             * - Informes
             *
             * No puede:
             * - Administrar usuarios
             */

            ocultar(
                "btnUsuarios"
            );


            return;

        }


        // ==================================
        // BRIGADISTA
        // ==================================

        if (
            rolUsuario ===
            "brigadista"
        ) {

            /*
             * No puede administrar usuarios
             */

            ocultar(
                "btnUsuarios"
            );


            /*
             * No puede ver estadísticas
             */

            ocultar(
                "btnEstadisticas"
            );


            /*
             * No puede ver validaciones
             */

            ocultar(
                "btnConfiguracion"
            );


            /*
             * NO PUEDE VER INFORMES
             */

            ocultar(
                "btnInformes"
            );


            return;

        }


        // ==================================
        // CUALQUIER OTRO ROL
        // ==================================

        ocultar(
            "btnUsuarios"
        );


        ocultar(
            "btnEstadisticas"
        );


        ocultar(
            "btnConfiguracion"
        );


        ocultar(
            "btnInformes"
        );

    };