(function () {
  'use strict';

  function obtenerSesion() {
    return {
      usuario: (localStorage.getItem('usuario') || '').trim(),
      nombreUsuario: (localStorage.getItem('nombreUsuario') || localStorage.getItem('nombre') || '').trim(),
      rol: (localStorage.getItem('rol') || '').trim()
    };
  }

  window.abrir = function (pagina) {
    if (!pagina) return;
    window.location.href = pagina;
  };

  window.cerrarSesion = function () {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
  };

  function mostrarUsuario() {
    const sesion = obtenerSesion();
    const elemento = document.getElementById('usuarioActivo');

    if (!elemento) return;

    if (!sesion.usuario) {
      elemento.textContent = 'Sesión no identificada';
      return;
    }

    const nombre = sesion.nombreUsuario || sesion.usuario;
    elemento.textContent = 'Bienvenido: ' + nombre;
  }

  function protegerMenu() {
    const sesion = obtenerSesion();

    if (!sesion.usuario) {
      window.location.href = 'index.html';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    protegerMenu();
    mostrarUsuario();
  });
})();
