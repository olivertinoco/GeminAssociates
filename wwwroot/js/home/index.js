
window.onload = function () {
    setteosPage();
    

}

function setteosPage() {
    const btn_submit = document.getElementById("btn-boton");
    const txt_usuario = document.getElementById("txt-prueba");
    const error_message_usuario = document.getElementById("error-message-usuario");
    const txt_clave = document.getElementById("txt-saludo");
    const error_message_clave = document.getElementById("error-message-clave");
    const spnUsuario = document.getElementById("spnUsuario");

    // txt_usuario.onchange = function(){
    //     error_message_usuario.classList.add("hidden");
    //     btn_submit.disabled=false;
    // }
    txt_usuario.addEventListener("input", function () {
        error_message_usuario.classList.add("hidden");
        btn_submit.disabled = false;
    });

    txt_clave.addEventListener("input", function () {
        error_message_clave.classList.add("hidden");
        btn_submit.disabled = false;
    });
    
    // txt_clave.onchange = function(){
    //     error_message_clave.classList.add("hidden");
    //     btn_submit.disabled=false;
    // }

    btn_submit.onclick = function(event) {
        event.preventDefault();
        btn_submit.disabled=true;
        let isValidUser = false;
        let isValidClave = false;

        if (txt_usuario.value.trim() === '') {
            spnUsuario.innerText = "Debe ingresar un Usuario";
            error_message_usuario.classList.remove("hidden");
        } else {
            error_message_usuario.classList.add("hidden");
            isValidUser = true;
        }

        if (txt_clave.value.trim() === '') {
            error_message_clave.classList.remove("hidden");
        } else {
            error_message_clave.classList.add("hidden");
            isValidClave = true;
        }

        if (isValidUser && isValidClave) {
            const url = hdfRaiz.value + "Home/Datos";
            const formData = new FormData();
            formData.append("data1", txt_usuario.value.trim());
            formData.append("data2", txt_clave.value.trim());
            Http.post("Home/DataInicio", function(rpta){
                if (rpta === "OK") {
                    window.location.href = url;
                }else{
                    let mensaje;
                    switch(rpta){
                        case "error":
                            mensaje = "No es un DNI valido";
                            break;
                        case "existe":
                            mensaje = "Ya existe el DNI en los registros";
                            break;
                        default:
                            mensaje = rpta;
                    }
                    spnUsuario.innerText = mensaje;
                    error_message_usuario.classList.remove("hidden");
                }
            }, formData);

        }

    }


    function onlyNumbersHandler(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }

    function aplicarRestricciones() {
        const value = "1";
        txt_usuario.value = "";
        txt_clave.value = "";
        if (value === '1') {
            txt_usuario.setAttribute('inputmode', 'numeric');
            txt_usuario.setAttribute('maxlength', '8');
            txt_usuario.addEventListener('input', onlyNumbersHandler);
        } else {
            txt_usuario.removeAttribute('inputmode');
            txt_usuario.setAttribute('maxlength', '20');
            txt_usuario.removeEventListener('input', onlyNumbersHandler);
        }
        txt_usuario.focus();
    }



}
