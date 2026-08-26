// ========================================
// ABRIR PÁGINA
// ========================================

function abrir(pagina) {

    window.location = pagina;

}


// ========================================
// CERRAR SESIÓN
// ========================================

function cerrarSesion() {

    localStorage.clear();

    window.location = "index.html";

}


// ========================================
// MOSTRAR USUARIO ACTIVO
// ========================================

let usuario =
    localStorage.getItem("usuario");


if (usuario) {

    const elemento =
        document.getElementById("usuarioActivo");


    if (elemento) {

        elemento.innerHTML =
            "Bienvenido: " + usuario;

    }

}