
window.onload = function () {
    setteosPage();
    

}

function setteosPage() {
    const btn_submit = document.getElementById("btn-submit");
    const txt_usuario = document.getElementById("txt-usuario");
    const error_message_usuario = document.getElementById("error-message-usuario");
    const txt_clave = document.getElementById("txt-clave");
    const error_message_clave = document.getElementById("error-message-clave");
    const cbo_tipo_doc = document.getElementById("cbo-tipo-doc");
    const spnUsuario = document.getElementById("spnUsuario");

    cbo_tipo_doc.selectedIndex = 0;
    btn_submit.disabled = true;
    
    cbo_tipo_doc.addEventListener('change', aplicarRestricciones);

    btn_submit.onclick = function(event) {
        event.preventDefault();
        let isValidUser = false;
        let isValidClave = false;

        if (txt_usuario.value.trim() === '') {
            spnUsuario.innerText = "Debe ingresar un Usuario";
            error_message_usuario.classList.remove("hidden");
        } else if(txt_usuario.value.trim().length != 8 && cbo_tipo_doc.value == "1"){
            spnUsuario.innerText = "Usuario tiene 8 digitos";
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
            formData.append("data1", cbo_tipo_doc.value);
            formData.append("data2", txt_usuario.value.trim());
            formData.append("data3", txt_clave.value.trim());
            Http.post("Home/DataInicio", function(rpta){
                if (rpta === "OK") {
                    window.location.href = url;
                }
            }, formData);

        }

    }


    function onlyNumbersHandler(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }

    function aplicarRestricciones() {
        const value = cbo_tipo_doc.value;
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

        if(cbo_tipo_doc.value != ""){
            btn_submit.disabled = false;
        }
        
        txt_usuario.focus();
    }

    aplicarRestricciones();


}
