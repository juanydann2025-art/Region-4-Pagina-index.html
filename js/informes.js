// ========================================================
// INFORMES.JS
// ========================================================


// ========================================================
// URL APPS SCRIPT
// ========================================================

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";


// ========================================================
// DATOS DE SESIÓN
// ========================================================

const usuario =
    localStorage.getItem("usuario") || "";

const rol =
    (
        localStorage.getItem("rol") || ""
    )
    .trim()
    .toLowerCase();


// ========================================================
// INFORMES ACTUALES
// ========================================================

let informeFechasActual = null;

let informeSeccionActual = null;


// ========================================================
// INICIO
// ========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!verificarAcceso()) {
            return;
        }

        configurarPestanas();

        configurarBotones();

        establecerFechas();

    }
);


// ========================================================
// VERIFICAR ACCESO
// ========================================================

function verificarAcceso() {

    if (
        rol !== "administrador" &&
        rol !== "coordinador"
    ) {

        alert(
            "No tienes permiso para acceder a los informes."
        );

        window.location =
            "menu.html";

        return false;
    }

    return true;
}


// ========================================================
// PESTAÑAS
// ========================================================

function configurarPestanas() {

    const pestanas =
        document.querySelectorAll(
            ".pestana"
        );

    pestanas.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    const tab =
                        this.dataset.tab;

                    pestanas.forEach(
                        function (item) {

                            item.classList.remove(
                                "activa"
                            );

                        }
                    );

                    this.classList.add(
                        "activa"
                    );

                    const fechas =
                        document.getElementById(
                            "tabFechas"
                        );

                    const seccion =
                        document.getElementById(
                            "tabSeccion"
                        );

                    if (!fechas || !seccion) {
                        return;
                    }

                    if (
                        tab === "fechas"
                    ) {

                        fechas.classList.remove(
                            "oculto"
                        );

                        seccion.classList.add(
                            "oculto"
                        );

                    }

                    if (
                        tab === "seccion"
                    ) {

                        fechas.classList.add(
                            "oculto"
                        );

                        seccion.classList.remove(
                            "oculto"
                        );

                    }

                }
            );

        }
    );

}


// ========================================================
// CONFIGURAR BOTONES
// ========================================================

function configurarBotones() {

    const btnFechas =
        document.getElementById(
            "btnConsultarFechas"
        );

    const btnSeccion =
        document.getElementById(
            "btnConsultarSeccion"
        );

    const btnPdfFechas =
        document.getElementById(
            "btnPdfFechas"
        );

    const btnPdfSeccion =
        document.getElementById(
            "btnPdfSeccion"
        );


    if (btnFechas) {

        btnFechas.addEventListener(
            "click",
            generarInformeFechas
        );

    }


    if (btnSeccion) {

        btnSeccion.addEventListener(
            "click",
            generarInformeSeccion
        );

    }


    if (btnPdfFechas) {

        btnPdfFechas.addEventListener(
            "click",
            exportarPDFFechas
        );

        btnPdfFechas.disabled = true;

    }


    if (btnPdfSeccion) {

        btnPdfSeccion.addEventListener(
            "click",
            exportarPDFSeccion
        );

        btnPdfSeccion.disabled = true;

    }

}


// ========================================================
// ESTABLECER FECHAS
// ========================================================

function establecerFechas() {

    const hoy =
        new Date();

    const fecha =
        formatearFechaInput(
            hoy
        );

    const inicio =
        document.getElementById(
            "fechaInicio"
        );

    const fin =
        document.getElementById(
            "fechaFin"
        );

    if (inicio) {

        inicio.value =
            fecha;

    }

    if (fin) {

        fin.value =
            fecha;

    }

}


// ========================================================
// FORMATO FECHA INPUT
// ========================================================

function formatearFechaInput(
    fecha
) {

    const año =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        año +
        "-" +
        mes +
        "-" +
        dia
    );

}


// ========================================================
// GENERAR INFORME POR FECHAS
// ========================================================

function generarInformeFechas() {

    const elementoInicio =
        document.getElementById(
            "fechaInicio"
        );

    const elementoFin =
        document.getElementById(
            "fechaFin"
        );

    const elementoCategoria =
        document.getElementById(
            "categoria"
        );


    const fechaInicio =
        elementoInicio
            ? elementoInicio.value
            : "";

    const fechaFin =
        elementoFin
            ? elementoFin.value
            : "";

    const categoria =
        elementoCategoria
            ? elementoCategoria.value
            : "todas";


    if (!fechaInicio) {

        mostrarMensaje(
            "Seleccione la fecha inicial."
        );

        return;

    }


    if (!fechaFin) {

        mostrarMensaje(
            "Seleccione la fecha final."
        );

        return;

    }


    if (
        fechaInicio >
        fechaFin
    ) {

        mostrarMensaje(
            "La fecha inicial no puede ser mayor que la fecha final."
        );

        return;

    }


    mostrarCargando();


    llamarAppsScript(
        "obtenerInformeFechas",
        {

            usuario:
                usuario,

            fechaInicio:
                fechaInicio,

            fechaFin:
                fechaFin,

            categoria:
                categoria

        }
    )
    .then(
        function (respuesta) {

            ocultarCargando();

            console.log(
                "RESPUESTA INFORME FECHAS:",
                respuesta
            );


            if (
                !respuesta ||
                respuesta.ok !== true
            ) {

                mostrarMensaje(
                    respuesta &&
                    respuesta.mensaje
                        ? respuesta.mensaje
                        : "No fue posible generar el informe."
                );

                return;

            }


            informeFechasActual =
                respuesta;


            mostrarInformeFechas(
                respuesta
            );


            const botonPDF =
                document.getElementById(
                    "btnPdfFechas"
                );


            if (botonPDF) {

                botonPDF.disabled =
                    false;

            }

        }
    )
    .catch(
        function (error) {

            ocultarCargando();

            console.error(
                "ERROR INFORME FECHAS:",
                error
            );

            mostrarMensaje(
                "Ocurrió un error al comunicarse con Apps Script."
            );

        }
    );

}


// ========================================================
// MOSTRAR INFORME POR FECHAS
// ========================================================

function mostrarInformeFechas(
    respuesta
) {

    const resumen =
        document.getElementById(
            "resumenFechas"
        );

    const resultado =
        document.getElementById(
            "resultadoFechas"
        );


    if (!resultado) {

        return;

    }


    const resultados =
        respuesta.resultados || [];


    let totalGeneral =
        0;


    let totalHTML =
        "";


    resultados.forEach(
        function (grupo) {

            const filas =
                grupo.filas || [];


            totalGeneral +=
                filas.length;


            totalHTML +=
                `
                <div class="bloque-categoria">

                    <div class="cabecera-categoria">

                        <h3>
                            ${escapeHTML(
                                grupo.categoria ||
                                "Registros"
                            )}
                        </h3>

                        <span>
                            ${filas.length}
                            registros
                        </span>

                    </div>

                    ${crearTablaGrupo(
                        grupo
                    )}

                </div>
                `;

        }
    );


    if (resumen) {

        resumen.innerHTML =
            `
            <div class="tarjeta-resumen">

                <span>
                    Total de registros
                </span>

                <strong>
                    ${totalGeneral}
                </strong>

            </div>

            <div class="tarjeta-resumen">

                <span>
                    Categorías
                </span>

                <strong>
                    ${resultados.length}
                </strong>

            </div>
            `;

    }


    if (
        totalGeneral === 0
    ) {

        resultado.innerHTML =
            `
            <div class="sin-registros">

                <i class="fa-solid fa-circle-info"></i>

                No se encontraron registros
                en el rango seleccionado.

            </div>
            `;

        return;

    }


    resultado.innerHTML =
        totalHTML;

}


// ========================================================
// CREAR TABLA POR CATEGORÍA
// ========================================================

function crearTablaGrupo(
    grupo
) {

    const encabezados =
        grupo.encabezados || [];

    const filas =
        grupo.filas || [];


    if (
        filas.length === 0
    ) {

        return `
            <div class="sin-registros">
                Sin registros.
            </div>
        `;

    }


    const indiceFolio =
        buscarIndice(
            encabezados,
            [
                "folio"
            ]
        );


    const indiceFecha =
        buscarIndice(
            encabezados,
            [
                "fecha registro",
                "fecha de registro",
                "fecha"
            ]
        );


    const indiceUsuario =
        buscarIndice(
            encabezados,
            [
                "usuario que generó",
                "usuario que genero",
                "usuario"
            ]
        );


    const indiceNombre =
        buscarIndice(
            encabezados,
            [
                "nombre ciudadano",
                "nombre",
                "ciudadano"
            ]
        );


    const indiceSeccion =
        buscarIndice(
            encabezados,
            [
                "sección",
                "seccion"
            ]
        );


    let html =
        `
        <div class="tabla-informe-contenedor">

            <table class="tabla-informe">

                <thead>

                    <tr>

                        <th>Folio</th>

                        <th>Fecha</th>

                        <th>Usuario</th>

                        <th>Nombre</th>

                        <th>Sección</th>

                    </tr>

                </thead>

                <tbody>
        `;


    filas.forEach(
        function (fila) {

            html +=
                `
                <tr>

                    <td>
                        ${escapeHTML(
                            obtenerValor(
                                fila,
                                indiceFolio
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            formatearFechaTabla(
                                obtenerValor(
                                    fila,
                                    indiceFecha
                                )
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            obtenerValor(
                                fila,
                                indiceUsuario
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            obtenerValor(
                                fila,
                                indiceNombre
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            obtenerValor(
                                fila,
                                indiceSeccion
                            )
                        )}
                    </td>

                </tr>
                `;

        }
    );


    html +=
        `
                </tbody>

            </table>

        </div>
        `;


    return html;

}


// ========================================================
// INFORME POR SECCIÓN
// ========================================================

function generarInformeSeccion() {

    const elementoSeccion =
        document.getElementById(
            "seccion"
        );


    const seccion =
        elementoSeccion
            ? elementoSeccion.value.trim()
            : "";


    if (!seccion) {

        mostrarMensaje(
            "Escriba una sección."
        );

        return;

    }


    mostrarCargando();


    llamarAppsScript(
        "obtenerInformeSeccion",
        {

            usuario:
                usuario,

            seccion:
                seccion

        }
    )
    .then(
        function (respuesta) {

            ocultarCargando();


            console.log(
                "RESPUESTA INFORME SECCIÓN:",
                respuesta
            );


            if (
                !respuesta ||
                respuesta.ok !== true
            ) {

                mostrarMensaje(
                    respuesta &&
                    respuesta.mensaje
                        ? respuesta.mensaje
                        : "No fue posible consultar la sección."
                );

                return;

            }


            informeSeccionActual =
                respuesta;


            mostrarInformeSeccion(
                respuesta
            );


            const botonPDF =
                document.getElementById(
                    "btnPdfSeccion"
                );


            if (botonPDF) {

                botonPDF.disabled =
                    false;

            }

        }
    )
    .catch(
        function (error) {

            ocultarCargando();

            console.error(
                "ERROR INFORME SECCIÓN:",
                error
            );


            mostrarMensaje(
                "Ocurrió un error al consultar la sección."
            );

        }
    );

}


// ========================================================
// MOSTRAR INFORME POR SECCIÓN
// ========================================================

function mostrarInformeSeccion(
    respuesta
) {

    const resumen =
        document.getElementById(
            "resumenSeccion"
        );

    const resultado =
        document.getElementById(
            "resultadoSeccion"
        );


    if (!resultado) {

        return;

    }


    const resultados =
        respuesta.resultados || [];


    let total =
        0;


    let html =
        "";


    resultados.forEach(
        function (grupo) {

            const filas =
                grupo.filas || [];


            total +=
                filas.length;


            html +=
                `
                <div class="bloque-categoria">

                    <div class="cabecera-categoria">

                        <h3>
                            ${escapeHTML(
                                grupo.categoria ||
                                "Registros"
                            )}
                        </h3>

                        <span>
                            ${filas.length}
                            registros
                        </span>

                    </div>

                    ${crearTablaGrupo(
                        grupo
                    )}

                </div>
                `;

        }
    );


    if (resumen) {

        resumen.innerHTML =
            `
            <div class="tarjeta-resumen">

                <span>
                    Sección
                </span>

                <strong>
                    ${escapeHTML(
                        respuesta.seccion || ""
                    )}
                </strong>

            </div>

            <div class="tarjeta-resumen">

                <span>
                    Total de registros
                </span>

                <strong>
                    ${total}
                </strong>

            </div>
            `;

    }


    if (
        total === 0
    ) {

        resultado.innerHTML =
            `
            <div class="sin-registros">

                <i class="fa-solid fa-circle-info"></i>

                No se encontraron registros
                para la sección

                <strong>
                    ${escapeHTML(
                        respuesta.seccion || ""
                    )}
                </strong>.

            </div>
            `;

        return;

    }


    resultado.innerHTML =
        html;

}


// ========================================================
// EXPORTAR PDF POR FECHAS
// ========================================================

function exportarPDFFechas() {

    if (
        !informeFechasActual
    ) {

        mostrarMensaje(
            "Primero genere el informe."
        );

        return;

    }


    mostrarCargando();


    const elementoCategoria =
        document.getElementById(
            "categoria"
        );


    const categoria =
        elementoCategoria
            ? elementoCategoria.value
            : "todas";


    llamarAppsScript(
        "exportarInformePDF",
        {

            usuario:
                usuario,

            tipo:
                "fechas",

            fechaInicio:
                informeFechasActual.fechaInicio,

            fechaFin:
                informeFechasActual.fechaFin,

            categoria:
                categoria

        }
    )
    .then(
        function (respuesta) {

            ocultarCargando();


            console.log(
                "RESPUESTA PDF FECHAS:",
                respuesta
            );


            if (
                !respuesta ||
                respuesta.ok !== true
            ) {

                mostrarMensaje(
                    respuesta &&
                    respuesta.mensaje
                        ? respuesta.mensaje
                        : "No fue posible generar el PDF."
                );

                return;

            }


            mostrarPDF(
                respuesta
            );

        }
    )
    .catch(
        function (error) {

            ocultarCargando();

            console.error(
                "ERROR PDF FECHAS:",
                error
            );


            mostrarMensaje(
                "Ocurrió un error al generar el PDF."
            );

        }
    );

}


// ========================================================
// EXPORTAR PDF POR SECCIÓN
// ========================================================

function exportarPDFSeccion() {

    if (
        !informeSeccionActual
    ) {

        mostrarMensaje(
            "Primero genere el informe por sección."
        );

        return;

    }


    mostrarCargando();


    llamarAppsScript(
        "exportarInformePDF",
        {

            usuario:
                usuario,

            tipo:
                "seccion",

            seccion:
                informeSeccionActual.seccion

        }
    )
    .then(
        function (respuesta) {

            ocultarCargando();


            console.log(
                "RESPUESTA PDF SECCIÓN:",
                respuesta
            );


            if (
                !respuesta ||
                respuesta.ok !== true
            ) {

                mostrarMensaje(
                    respuesta &&
                    respuesta.mensaje
                        ? respuesta.mensaje
                        : "No fue posible generar el PDF."
                );

                return;

            }


            mostrarPDF(
                respuesta
            );

        }
    )
    .catch(
        function (error) {

            ocultarCargando();

            console.error(
                "ERROR PDF SECCIÓN:",
                error
            );


            mostrarMensaje(
                "Ocurrió un error al generar el PDF."
            );

        }
    );

}


// ========================================================
// MOSTRAR PDF
// ========================================================

function mostrarPDF(
    respuesta
) {

    console.log(
        "RESPUESTA PDF:",
        respuesta
    );


    if (
        !respuesta ||
        respuesta.ok !== true
    ) {

        mostrarMensaje(
            respuesta &&
            respuesta.mensaje
                ? respuesta.mensaje
                : "No se pudo generar el PDF."
        );

        return;

    }


    // ====================================================
    // PDF BASE64
    // ====================================================

    if (
        respuesta.base64
    ) {

        try {

            const enlace =
                document.createElement(
                    "a"
                );


            const datosPDF =
                "data:application/pdf;base64," +
                respuesta.base64;


            enlace.href =
                datosPDF;


            enlace.download =
                respuesta.nombre ||
                "Informe.pdf";


            enlace.target =
                "_blank";


            enlace.textContent =
                "📄 Descargar PDF";


            enlace.className =
                "btn-pdf";


            enlace.style.display =
                "inline-block";


            enlace.style.margin =
                "10px";


            enlace.style.textDecoration =
                "none";


            enlace.style.cursor =
                "pointer";


            // ==================================================
            // CONTENEDOR MENSAJE
            // ==================================================

            const mensaje =
                document.getElementById(
                    "mensaje"
                );


            if (mensaje) {

                mensaje.classList.remove(
                    "oculto"
                );


                mensaje.innerHTML =
                    "";


                const texto =
                    document.createElement(
                        "div"
                    );


                texto.innerHTML =
                    "<strong>PDF generado correctamente.</strong><br><br>";


                mensaje.appendChild(
                    texto
                );


                // ==================================================
                // BOTÓN DESCARGAR
                // ==================================================

                mensaje.appendChild(
                    enlace
                );


                // ==================================================
                // BOTÓN ABRIR
                // ==================================================

                const botonAbrir =
                    document.createElement(
                        "button"
                    );


                botonAbrir.type =
                    "button";


                botonAbrir.textContent =
                    "👁️ Ver PDF";


                botonAbrir.className =
                    "btn-pdf";


                botonAbrir.style.display =
                    "inline-block";


                botonAbrir.style.margin =
                    "10px";


                botonAbrir.style.cursor =
                    "pointer";


                botonAbrir.onclick =
                    function () {

                        const ventana =
                            window.open(
                                "",
                                "_blank"
                            );


                        if (!ventana) {

                            alert(
                                "El navegador bloqueó la ventana. Permite ventanas emergentes para este sitio."
                            );

                            return;

                        }


                        ventana.document.write(
                            `
                            <!DOCTYPE html>

                            <html>

                            <head>

                                <meta charset="UTF-8">

                                <title>
                                    ${escapeHTML(
                                        respuesta.nombre ||
                                        "Informe PDF"
                                    )}
                                </title>

                                <style>

                                    html,
                                    body {

                                        margin: 0;

                                        padding: 0;

                                        width: 100%;

                                        height: 100%;

                                        overflow: hidden;

                                    }

                                    iframe {

                                        width: 100%;

                                        height: 100%;

                                        border: none;

                                    }

                                </style>

                            </head>

                            <body>

                                <iframe
                                    src="${datosPDF}"
                                ></iframe>

                            </body>

                            </html>
                            `
                        );


                        ventana.document.close();

                    };


                mensaje.appendChild(
                    botonAbrir
                );


                return;

            }


            // ==================================================
            // SI NO EXISTE #MENSAJE
            // ==================================================

            document.body.appendChild(
                enlace
            );


            const botonAbrir =
                document.createElement(
                    "button"
                );


            botonAbrir.type =
                "button";


            botonAbrir.textContent =
                "👁️ Ver PDF";


            botonAbrir.className =
                "btn-pdf";


            botonAbrir.style.margin =
                "10px";


            botonAbrir.onclick =
                function () {

                    const ventana =
                        window.open(
                            "",
                            "_blank"
                        );


                    if (!ventana) {

                        alert(
                            "El navegador bloqueó la ventana."
                        );

                        return;

                    }


                    ventana.document.write(
                        `
                        <!DOCTYPE html>

                        <html>

                        <head>

                            <meta charset="UTF-8">

                            <title>
                                Informe PDF
                            </title>

                            <style>

                                html,
                                body {

                                    margin: 0;

                                    padding: 0;

                                    width: 100%;

                                    height: 100%;

                                    overflow: hidden;

                                }

                                iframe {

                                    width: 100%;

                                    height: 100%;

                                    border: none;

                                }

                            </style>

                        </head>

                        <body>

                            <iframe
                                src="${datosPDF}"
                            ></iframe>

                        </body>

                        </html>
                        `
                    );


                    ventana.document.close();

                };


            document.body.appendChild(
                botonAbrir
            );


            return;

        }
        catch (error) {

            console.error(
                "ERROR MOSTRANDO PDF:",
                error
            );


            mostrarMensaje(
                "El PDF fue generado, pero no se pudo mostrar."
            );

            return;

        }

    }


    // ====================================================
    // COMPATIBILIDAD CON URL
    // ====================================================

    if (
        respuesta.url
    ) {

        mostrarMensaje(
            `
            <strong>
                PDF generado correctamente.
            </strong>

            <br><br>

            <a
                href="${escapeHTML(
                    respuesta.url
                )}"
                target="_blank"
                class="btn-pdf">

                📄 Abrir PDF

            </a>
            `,
            true
        );

        return;

    }


    // ====================================================
    // SIN PDF
    // ====================================================

    mostrarMensaje(
        "El servidor confirmó que generó el PDF, pero no recibió el archivo."
    );

}


// ========================================================
// LLAMAR APPS SCRIPT
// ========================================================

function llamarAppsScript(
    accion,
    datos
) {

    console.log(
        "ENVIANDO A APPS SCRIPT:",
        accion,
        datos
    );


    return fetch(
        URL_APPS_SCRIPT,
        {

            method:
                "POST",

            headers:
                {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

            body:
                JSON.stringify({

                    accion:
                        accion,

                    ...datos

                })

        }
    )
    .then(
        function (respuesta) {

            console.log(
                "HTTP:",
                respuesta.status
            );


            if (
                !respuesta.ok
            ) {

                throw new Error(
                    "Error HTTP " +
                    respuesta.status
                );

            }


            return respuesta.json();

        }
    );

}


// ========================================================
// BUSCAR ÍNDICE DE COLUMNA
// ========================================================

function buscarIndice(
    encabezados,
    posibles
) {

    if (
        !Array.isArray(
            encabezados
        )
    ) {

        return -1;

    }


    if (
        !Array.isArray(
            posibles
        )
    ) {

        return -1;

    }


    const normalizados =
        encabezados.map(
            function (texto) {

                return normalizar(
                    texto
                );

            }
        );


    for (
        let i = 0;
        i < posibles.length;
        i++
    ) {

        const buscado =
            normalizar(
                posibles[i]
            );


        const indice =
            normalizados.indexOf(
                buscado
            );


        if (
            indice !== -1
        ) {

            return indice;

        }

    }


    return -1;

}


// ========================================================
// NORMALIZAR TEXTO
// ========================================================

function normalizar(
    texto
) {

    return String(
        texto || ""
    )
    .toLowerCase()
    .normalize(
        "NFD"
    )
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .trim();

}


// ========================================================
// OBTENER VALOR
// ========================================================

function obtenerValor(
    fila,
    indice
) {

    if (
        !Array.isArray(
            fila
        )
    ) {

        return "";

    }


    if (
        indice === -1 ||
        indice === undefined ||
        indice === null
    ) {

        return "";

    }


    if (
        indice < 0 ||
        indice >= fila.length
    ) {

        return "";

    }


    const valor =
        fila[indice];


    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    );

}


// ========================================================
// FORMATEAR FECHA TABLA
// ========================================================

function formatearFechaTabla(
    valor
) {

    if (!valor) {

        return "";

    }


    const fecha =
        new Date(
            valor
        );


    if (
        isNaN(
            fecha.getTime()
        )
    ) {

        return String(
            valor
        );

    }


    return (
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        ) +
        "/" +
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "/" +
        fecha.getFullYear()
    );

}


// ========================================================
// ESCAPAR HTML
// ========================================================

function escapeHTML(
    valor
) {

    return String(
        valor || ""
    )
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


// ========================================================
// MOSTRAR CARGANDO
// ========================================================

function mostrarCargando() {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (mensaje) {

        mensaje.classList.remove(
            "oculto"
        );


        mensaje.innerHTML =
            `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Generando informe, espere un momento...
            `;

    }

}


// ========================================================
// OCULTAR CARGANDO
// ========================================================

function ocultarCargando() {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (mensaje) {

        mensaje.classList.add(
            "oculto"
        );

    }

}


// ========================================================
// MOSTRAR MENSAJE
// ========================================================

function mostrarMensaje(
    texto,
    esHTML = false
) {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (!mensaje) {

        alert(
            String(texto)
                .replace(
                    /<[^>]*>/g,
                    ""
                )
        );

        return;

    }


    if (esHTML) {

        mensaje.innerHTML =
            texto;

    } else {

        mensaje.textContent =
            texto;

    }


    mensaje.classList.remove(
        "oculto"
    );


    setTimeout(
        function () {

            mensaje.classList.add(
                "oculto"
            );

        },
        8000
    );

}