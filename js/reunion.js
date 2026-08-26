// ========================================
// URL GOOGLE APPS SCRIPT
// ========================================

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";




// ========================================
// ELEMENTOS
// ========================================

const seccion =
    document.getElementById("seccion");

const comunidad =
    document.getElementById("comunidad");


// ========================================
// SECCIONES Y COMUNIDADES
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


            const lista =
                comunidades[
                    valorSeccion
                ] || [];


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


            // Seleccionar automáticamente
            // si solamente existe una comunidad

            if (lista.length === 1) {

                comunidad.value =
                    lista[0];

            }

        }
    );

}


// ========================================
// GUARDAR REUNIÓN
// ========================================

async function guardarReunion() {

    console.log(
        "INICIANDO REGISTRO DE REUNIÓN"
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


    // =====================================
    // ELEMENTOS
    // =====================================

    const fecha =
        document.getElementById(
            "fecha"
        ).value.trim();


    const hora =
        document.getElementById(
            "hora"
        ).value.trim();


    const personas =
        document.getElementById(
            "personas"
        ).value.trim();


    const valorSeccion =
        document.getElementById(
            "seccion"
        ).value.trim();


    const valorComunidad =
        document.getElementById(
            "comunidad"
        ).value.trim();


    const calle =
        document.getElementById(
            "calle"
        ).value.trim();


    const numero =
        document.getElementById(
            "numero"
        ).value.trim();


    const responsable =
        document.getElementById(
            "responsable"
        ).value.trim();


    const telefono =
        document.getElementById(
            "telefono"
        ).value.trim();


    // =====================================
    // VALIDAR SESIÓN
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
    // VALIDACIONES
    // =====================================

    if (!fecha) {

        alert(
            "Selecciona la fecha de la reunión."
        );

        return;

    }


    if (!hora) {

        alert(
            "Selecciona la hora de la reunión."
        );

        return;

    }


    if (!personas) {

        alert(
            "Indica cuántas personas asistirán."
        );

        return;

    }


    if (
        parseInt(personas) <= 0
    ) {

        alert(
            "El número de personas debe ser mayor que cero."
        );

        return;

    }


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


    if (!calle) {

        alert(
            "Escribe la calle."
        );

        return;

    }


    if (!numero) {

        alert(
            "Escribe el número."
        );

        return;

    }


    if (!responsable) {

        alert(
            "Escribe el nombre del responsable."
        );

        return;

    }


    if (!telefono) {

        alert(
            "Escribe el teléfono del responsable."
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


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    // =====================================
    // DATOS
    // =====================================

    const datos = {

        accion:
            "registrarReunion",

        usuario:
            usuario,

        nombreUsuario:
            nombre,

        rol:
            rol,

        fecha:
            fecha,

        hora:
            hora,

        personas:
            personas,

        seccion:
            valorSeccion,

        comunidad:
            valorComunidad,

        calle:
            calle,

        numero:
            numero,

        responsable:
            responsable,

        telefono:
            telefono

    };


    console.log(
        "DATOS DE REUNIÓN:",
        datos
    );


    try {

        // =================================
        // ENVIAR A GOOGLE APPS SCRIPT
        // =================================

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


        const texto =
            await respuesta.text();


        console.log(
            "RESPUESTA:",
            texto
        );


        let resultado;


        try {

            resultado =
                JSON.parse(
                    texto
                );

        }

        catch(error) {

            throw new Error(
                "La respuesta de Google Apps Script no es válida."
            );

        }


        // =================================
        // RESULTADO
        // =================================

        if (
            resultado.ok === true
        ) {

            alert(

                "Reunión registrada correctamente.\n\n" +

                "Folio: " +

                resultado.folio

            );


            // =================================
            // LIMPIAR FORMULARIO
            // =================================

            document.getElementById(
                "fecha"
            ).value = "";


            document.getElementById(
                "hora"
            ).value = "";


            document.getElementById(
                "personas"
            ).value = "";


            document.getElementById(
                "seccion"
            ).value = "";


            document.getElementById(
                "comunidad"
            ).innerHTML =
                '<option value="">Seleccione primero una sección</option>';


            document.getElementById(
                "calle"
            ).value = "";


            document.getElementById(
                "numero"
            ).value = "";


            document.getElementById(
                "responsable"
            ).value = "";


            document.getElementById(
                "telefono"
            ).value = "";


        }

        else {

            alert(

                resultado.mensaje ||

                "No se pudo registrar la reunión."

            );

        }


    }

    catch(error) {

        console.error(
            "ERROR:",
            error
        );


        alert(

            "Error al guardar la reunión:\n\n" +

            error.message

        );

    }


    finally {

        boton.disabled =
            false;


        boton.textContent =
            "Guardar Reunión";

    }

}