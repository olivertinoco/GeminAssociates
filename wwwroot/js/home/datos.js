window.onload = function () {
    seteosIniciales();

    let rpta = hdfRpta.value;

    //alert(rpta);
}

function seteosIniciales(){
    let cred = hdfCred.value;
    let credential = cred.split('|');
    let tipo = credential[0];
    let nro = credential[1];

    const txt_usuario = document.getElementById("txt-usuario");
    const cbo_tipo_doc = document.getElementById("cbo-tipo-doc");

    cbo_tipo_doc.selectedIndex = tipo;
    txt_usuario.value = nro;

    document.querySelectorAll('input.uppercase').forEach(el => {
        el.addEventListener('input',()=>{
            el.value = el.value.toUpperCase();
        });
    });

}