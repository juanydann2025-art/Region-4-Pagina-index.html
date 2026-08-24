function abrir(pagina){

window.location=pagina;

}



function cerrarSesion(){

localStorage.clear();

window.location="index.html";

}



let usuario=localStorage.getItem("usuario");


if(usuario){

document.getElementById("usuarioActivo").innerHTML=

"Bienvenido: "+usuario;

}