const rol = localStorage.getItem("rol");

function ocultar(id){
    const elemento = document.getElementById(id);
    if(elemento){
        elemento.style.display="none";
    }
}

window.onload=function(){

    if(rol==="Administrador"){
        return;
    }

    if(rol==="Coordinador"){

        ocultar("btnUsuarios");

    }

    if(rol==="Brigadista"){

        ocultar("btnUsuarios");
        ocultar("btnEstadisticas");
        ocultar("btnConfiguracion");

    }

}