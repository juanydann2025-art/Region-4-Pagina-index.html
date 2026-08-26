const URL_SHEETS =
"https://script.google.com/macros/s/AKfycbz4aSiP7oXgtImRy6fwZPq2i0ad5rIFwcxa1pDczW79uzhh47FQhWqZ1rUgeQQOUgQ5SQ/exec";





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