var Http = (function () {
    function Http() {
    }
    Http.get = function (url, callback, tipoRpta, mensaje) {
        requestServer(url, "get", callback, null, tipoRpta, mensaje);
    }
    Http.post = function (url, callback, data, tipoRpta, mensaje) {
        requestServer(url, "post", callback, data, tipoRpta, mensaje);
    }
    function requestServer(url, metodoHttp, callback, data, tipoRpta, mensaje) {
        var xhr = new XMLHttpRequest();
        xhr.open(metodoHttp, hdfRaiz.value + url);
        if (tipoRpta != null) xhr.responseType = tipoRpta;
        xhr.onloadstart = function () {
            //if (mensaje) {
            //    divContainer.style.display = "inline";
            //    divMensaje.innerText = mensaje;
            //}
        }
        xhr.onreadystatechange = function () {
            if (xhr.status == 200 && xhr.readyState == 4) {
                //if (mensaje) {
                //    divContainer.style.display = "none";
                //    divMensaje.innerText = "";
                //}
                if (tipoRpta != null) callback(xhr.response);
                else callback(xhr.responseText);
            }
        }
        if (data != null) xhr.send(data);
        else xhr.send();
    }
    return Http;
})();

var GUI = (function () {
    function GUI() {
    }

    GUI.Combo = function (cbo, lista, primerItem) {
        var html = "";
        if (primerItem != null) {
            html += "<option value=''>";
            html += primerItem;
            html += "</option>";
        }
        var nRegistros = lista.length;
        var campos = [];
        for (var i = 0; i < nRegistros; i++) {
            campos = lista[i].split("|");
            html += "<option value='";
            html += campos[0];
            html += "'>";
            html += campos[1];
            html += "</option>";
        }
        cbo.innerHTML = html;
    }

    GUI.ComboUnaCol = function (cbo, lista, primerItem) {
        var html = "";
        if (primerItem != null) {
            html += "<option value=''>";
            html += primerItem;
            html += "</option>";
        }
        var nRegistros = lista.length;
        for (var i = 0; i < nRegistros; i++) {
            html += "<option value='";
            html += i;
            html += "'>";
            html += lista[i];
            html += "</option>";
        }
        cbo.innerHTML = html;
    }

    GUI.TreeViewCheck = function (lista, divMenu) {
        var listaGrupoCapas = {};
        var idGrupoPadre = "";
        nregistros = lista.length;
        var campos = [];
        var html = "<ul id='ulMenu' style='cursor:pointer' class='list-stilo'>";
        for (var i = 0; i < nregistros; i++) {
            campos = lista[i].split("|");
            if (campos[2] == "0") {
                idGrupoPadre = campos[0];
                listaGrupoCapas[idGrupoPadre] = campos[1];
                window["Grupo_" + idGrupoPadre] = {};

                html += "<li>";
                html += "<input type='checkbox' class='chk' data-id='";
                html += campos[0];
                html += "' id='";
                html += campos[0];
                html += "' data-param>";
                html += "<span class='caret'>";
                html += campos[1];
                html += "</span>";
                html += crearSubmenu(campos[0]);
                html += "</li>";
            }
        }
        html += "</ul>";
        divMenu.innerHTML = html;
        configurarMenus();

        function crearSubmenu(idPadre) {
            var html = "";
            var c = 0;
            for (var i = 0; i < nregistros; i++) {
                campos = lista[i].split("|");
                if (campos[2] == idPadre) {
                    if (campos[3] == "1") {
                        var clave = campos[0];
                        var obj = { "nombre": campos[1], "tipo": campos[4] };
                        window["Grupo_" + idGrupoPadre][clave] = obj;
                    }

                    html += "<li>";
                    html += "<input type='checkbox' class='chk' id='";
                    html += campos[0];
                    html += "' data-nivel='";
                    html += campos[3];
                    html += "' data-tipo='";
                    html += campos[4];
                    html += "' data-srv='";
                    html += campos[5];
                    html += "' data-url='";
                    html += campos[2];
                    html += "' data-param>";
                    html += "<label for='";
                    html += (campos[3] == "1"? campos[0] : "");
                    html += "' class='";
                    html += (campos[3] == "1" ? "puntero" : "caret caret-down");
                    html += "'>";
                    html += campos[1];
                    html += "</label>";
                    html += crearSubmenu(campos[0]);
                    html += "</li>";
                    c = c + 1;
                }
            }
            if (c > 0) html = "<ul class='nested active list-stilo'>" + html + "</ul>";
            return html;
        }

        function configurarMenus() {
            //Expandir y Colapsar usnado el Estilo
            var toggler = document.getElementsByClassName("caret");
            for (var i = 0; i < toggler.length; i++) {
                toggler[i].addEventListener("click", function () {
                    this.classList.toggle("caret-down");
                    var padre = this.parentElement.querySelector(".nested");
                    if (padre != null) padre.classList.toggle("active");
                });
            }
            //Marcar y Desmarcar los Checks
            var checks = document.getElementsByClassName("chk");
            for (var i = 0; i < checks.length; i++) {
                checks[i].addEventListener("click", function () {
                    marcarCheck(this.checked, this);
                });
            }
        }

        this.ObtenerListaGrupoCapas = function () {
            return listaGrupoCapas;
        }

        this.ObtenerListaChecks = function () {
            var listaChecks = {};
            var chks = document.getElementsByClassName("chk");
            var nChks = chks.length;
            var chk, nivel, tipo, srv;
            var obj = {};
            for (var i = 0; i < nChks; i++) {
                chk = chks[i];
                nivel = chk.getAttribute("data-nivel");
                tipo = chk.getAttribute("data-tipo");
                srv = chk.getAttribute("data-srv");
                if (chk.checked && nivel == "1") {
                    obj = { "nombre": chk.nextSibling.innerText, "tipo": tipo, "srv": srv };
                    listaChecks[chk.id]= obj;
                }
            }
            return listaChecks;
        }
    }

    return GUI;
})();

var Validacion = (function () {
    function Validacion() {
    }

    Validacion.ValidarNumerosEnLinea = function (claseNum) {
        if (claseNum == null) claseNum = "N";
        var controles = document.getElementsByClassName(claseNum);
        var nControles = controles.length;
        for (var i = 0; i < nControles; i++) {
            controles[i].onkeyup = function (event) {
                var keycode = ('which' in event ? event.which : event.keycode);
                var esValido = ((keycode > 47 && keycode < 58) || (keycode > 95 && keycode < 106) || keycode == 8 || keycode == 37 || keycode == 39 || keycode == 110 || keycode == 188 || keycode == 190);
                if (!esValido) this.value = this.value.removeCharAt(this.selectionStart);
            }
            controles[i].onpaste = function (event) {
                event.preventDefault();
            }
        }
    }

    Validacion.ValidarNumerosNegativoEnLinea = function (claseNum) {
        if (claseNum == null) claseNum = "NN";
        var controles = document.getElementsByClassName(claseNum);
        var nControles = controles.length;
        for (var i = 0; i < nControles; i++) {
            controles[i].onkeyup = function (event) {
                var keycode = ('which' in event ? event.which : event.keycode);
                //console.log(keycode);
                var esValido = ((keycode > 47 && keycode < 58) || (keycode > 95 && keycode < 106) || keycode == 8 || keycode == 37 || keycode == 39 || keycode == 109 || keycode == 110 || keycode == 189 || keycode == 190 || keycode == 219);
                esValido = esValido && contarCaracter(".", this.value) < 2 && contarCaracter("-", this.value) < 2;
                if (!esValido) this.value = this.value.removeCharAt(this.selectionStart);
            }
            controles[i].onpaste = function (event) {
                event.preventDefault();
            }
            controles[i].onblur = function (event) {
                var esValido = contarCaracter(".", this.value) < 2 && contarCaracter("-", this.value) < 2;
                if (!esValido) {
                    this.value = "";
                    this.focus();
                }
            }
        }
    }

    Validacion.ValidarIntervalo = function (numero, maximo, minimo) {
        return (numero <= maximo && numero >= minimo);
    }

    String.prototype.removeCharAt = function (i) {
        var tmp = this.split('');
        tmp.splice(i - 1, 1);
        return tmp.join('');
    }
    
    function contarCaracter(caracter, palabra) {
        var nCaracteres = 0;
        var nPalabras = palabra.length;
        for (var i = 0; i < nPalabras; i++) {
            if (palabra.substr(i,1)==caracter) {
                nCaracteres++;
            }
        }
        return nCaracteres;
    }

    return Validacion;
})();

var FileSystem = (function () {
    function FileSystem() {
    }

    FileSystem.getMime = function (archivo) {
        var mime = "";
        var campos = archivo.split(".");
        var extension = campos[campos.length - 1].toLowerCase();
        switch (extension) {
            case "txt":
                mime = "text/plain";
                break;
            case "csv":
                mime = "text/csv";
                break;
            case "json":
                mime = "application/json";
                break;
            case "xlsx":
                mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                break;
            case "docx":
                mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                break;
            case "pdf":
                mime = "application/pdf";
                break;
            default:
                mime = "application/octet-stream";
                break;
        }
        return mime;
    }

    FileSystem.download = function (data, archivo) {
        var mime = FileSystem.getMime(archivo);
        var blob = new Blob([data], { "type": mime });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = archivo;
        link.click();
    }

    return FileSystem;
})();

var Alerta = (function () {
    function Alerta() {
    }

    Alerta.Mensaje = function (div, titulo, mensaje, id, tieneCancelar) {
        tieneCancelar = (tieneCancelar == null ? true : tieneCancelar);
        var html = "";
        html += "<div id='Overlay' class='Overlay'></div>";
        html += "<div id='CustomAlert' class='CustomAlert'>";
        html += "<span class='CloseButton'><i class='fa - solid fa - rectangle - xmark' id='IconAlert'></i></span>";
        html += "<div id='MensajeAlertHeader'>";
        html += titulo;
        html += "</div>";
        html += "<div id='MensajeAlertBody'>";
        html += mensaje;
        html += "</div>";
        html += "<div class='CustonButton'>";
        html += "<button class='accept' id='btnAceptarAlerta'>Aceptar</button>";
        if (tieneCancelar) html += "<button class='cancel' id='btnCancelarAlerta'>Cancelar</button>";
        html += "</div>";
        html += "</div>";
        div.innerHTML = html;

        configurarAlertas();
        mostrarAlerta();
        function mostrarAlerta() {
            var overlay = document.getElementById("Overlay");
            var alerta = document.getElementById("CustomAlert");
            overlay.style.display = "block";
            alerta.classList.add("show");
        }

        function cerrarAlerta() {
            var overlay = document.getElementById("Overlay");
            var alerta = document.getElementById("CustomAlert");
            overlay.style.display = "none";
            alerta.classList.remove("show");
        }

        function configurarAlertas() {
            var btnAceptar = document.getElementById("btnAceptarAlerta");
            btnAceptar.onclick = function () {
                cerrarAlerta();
                aceptarAlerta(id);
            }

            var btnCancelar = document.getElementById("btnCancelarAlerta");
            if (btnCancelar != null) {
                btnCancelar.onclick = function () {
                    cerrarAlerta();
                }
            }
        }
    }

    return Alerta;
})();

var ValidaFecha = (function () {
    function ValidaFecha() {
    }

    ValidaFecha.Validacion = function (fecha, minAnio, maxAnio) {
        const date = new Date(fecha);
        const year = date.getFullYear();
        const fechaValida = !isNaN(date.getTime()) && fecha === date.toISOString().split('T')[0];
        const anioValido = year >= minAnio && year <= maxAnio;
        return fechaValida && anioValido;
    }

    return ValidaFecha;
})();
