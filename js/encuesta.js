function guardarEncuesta(){



let necesidades=[];


let checks=document.querySelectorAll(
"input[type='checkbox']:checked"
);



checks.forEach(function(item){


necesidades.push(item.value);


});



let encuesta={


conoce:

document.getElementById("conoce").value,


mejora:

document.getElementById("mejora").value,


necesidades:

necesidades,


otro:

document.getElementById("otro").value


};



localStorage.setItem(

"encuesta",

JSON.stringify(encuesta)

);



alert(
"Registro guardado correctamente"
);



window.location="menu.html";



}