const URL_SHEETS =
"https://script.google.com/macros/s/AKfycbxUelpTEjnHbTydhocgvk9BPC-uJWlJ8w58qgi8A098RmPDNq2t8JzXsNE3JAaZZ4ge7Q/exec";



function enviarDatos(tipo,registro){



fetch(URL_SHEETS,{

method:"POST",

body:JSON.stringify({

tipo:tipo,

registro:registro

})

})


.then(res=>res.text())


.then(data=>{


console.log(data);


alert(
"Información enviada correctamente"
);


})


.catch(error=>{


alert(
"Error al enviar datos"
);


});


}