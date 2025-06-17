const lsEppCheck = [];
const lsData_item = [];
let lsDatos = [];

window.onload = function () {
    seteosIniciales();
    asignarValores();

}

function seteosIniciales(){
    const rpta = hdfRpta.value;
    const listas = rpta.split('^');
    const nroReg = listas.length;
    lsDatos = listas[0].split('~');

    const cbo_condicion = document.getElementById("cbo-condicion");
    cbo_condicion.value = lsDatos[0].split('|').length < 6 ? "1" : "2";
    
    const result = [];
    for(let i=1; i<nroReg; i++){
        const [help, ...datos] = listas[i].split('~');
        const hlp = help.split('|');
        if(hlp[0] == "0"){
            result.push({
                cab:hlp[1],
                datos: datos
            });
        }else{
            const element = document.querySelector(`[data-hlp="${hlp[0]}"]`);
            if(i==1){
                GUI.Combo(element, datos);
            }else{
                GUI.Combo(element, datos, "Seleccione...");
            }
        }
    }

    const elUnidad = document.querySelector('[data-hlp="9"]');
    const elProyecto = document.querySelector('[data-hlp="51"]');
    const elAnnoPuesto = document.querySelectorAll('input.solo-enteros[type="number"]');

    elAnnoPuesto.forEach(input =>{
        input.addEventListener('input',(e)=>{
            let valor = e.target.value.replace(/[^\d]/g, '').slice(0,2);
            const max = parseInt(e.target.max) || 50;
            if(parseInt(valor) > max){
                valor = max.toString();
            }
            e.target.value = valor;
        });
    });


    elUnidad.addEventListener("change",(e)=>{
        const valor = e.target.value;

        //por cada iteracion carga las comunidades y los proyectos.
        for(let item = 0; item<2; item++){
            const id = (item + 50).toString();
            const {cab, datos} = result.find(item => item.cab === id);

            const datosFiltrados = datos
                .filter(item => item.split("|")[2] === valor)
                .map(item => {
                    const [col1, col2] = item.split("|");
                    return `${col1}|${col2}`;
                });
            
            const elemento = document.querySelector(`[data-hlp="${cab}"]`);
            GUI.Combo(elemento, datosFiltrados, "Seleccione...");
        }

        elProyecto.dispatchEvent(new Event("change"));
    });

    elProyecto.addEventListener("change",(e)=>{
        const valor = e.target.value;
        const {cab, datos} = result.find(item => item.cab === "52");

        const datosFiltrados = datos
            .filter(item => item.split("|")[2] === valor)
            .map(item => {
                const [col1, col2] = item.split("|");
                return `${col1}|${col2}`;
            });
        
        const elPuestos = document.querySelector(`[data-hlp="${cab}"]`);
        GUI.Combo(elPuestos, datosFiltrados, "Seleccione...");
    });

    const {cab, datos} = result.find(item => item.cab === "201202203");
    const claves = cab.match(/.{1,3}/g);
    const ubigeos = claves.map(clave => document.querySelector(`[data-hlp="${clave}"]`));


    const dataDpto = Array.from(
        datos.reduce((acc, item) => {
                const [codigo, departamento] = item.split("|");
                const clave = `${codigo.slice(0, 2)}|${departamento}`;
                acc.add(clave);
                return acc;
            }, new Set())
        ).sort((a, b) => {
            const depA = a.split("|")[1];
            const depB = b.split("|")[1];
            return depA.localeCompare(depB);
        });
    

    const dataProv = Array.from(
        datos.reduce((acc, item) => {
                const [codigo, , provincia] = item.split("|");
                const clave = `${codigo.slice(0, 4)}|${provincia}`; 
                acc.add(clave);
                return acc;
            }, new Set())
        ).sort((a, b) => {
            const [codA, provA] = a.split("|");
            const [codB, provB] = b.split("|");

            const depA = codA.slice(0, 2);
            const depB = codB.slice(0, 2);

            if (depA === depB) {
                return provA.localeCompare(provB);
            }
            return depA.localeCompare(depB);
        });


    const dataDist = Array.from(
        datos.reduce((acc, item) => {
                const [codigo, , , distrito] = item.split("|");
                const clave = `${codigo}|${distrito}`;
                acc.add(clave);
                return acc;
            }, new Set())
        ).sort((a, b) => {
            const [codA, distA] = a.split("|");
            const [codB, distB] = b.split("|");

            const provCodA = codA.slice(0, 4);
            const provCodB = codB.slice(0, 4);

            if (provCodA === provCodB) {
                return distA.localeCompare(distB);
            }
            return provCodA.localeCompare(provCodB);
        });


    GUI.Combo(ubigeos[0], dataDpto, "Seleccione...");

    ubigeos[0].addEventListener("change",(e)=>{
        const valor = e.target.value;

        const dataFilterProv = dataProv.filter(item => {
            const [codigoProv] = item.split("|");
            return codigoProv.startsWith(valor);
        });

        GUI.Combo(ubigeos[1], dataFilterProv, "Seleccione...");
        if(valor === ""){
            ubigeos[1].innerHTML = "";
        }
        ubigeos[2].innerHTML = "";
    });


    ubigeos[1].addEventListener("change",(e)=>{
        const valor = e.target.value;

        const dataFilterDist = dataDist.filter(item => {
            const [codigoDist] = item.split("|");
            return codigoDist.startsWith(valor);
        });

        GUI.Combo(ubigeos[2], dataFilterDist, "Seleccione...");
    });

    
    const {datos: lsEpp = []} = result.find(item => item.cab === "200") || {};
    if(lsEpp.length){
        for(const item of lsEpp){
            const [col1, col2, col3] = item.split('|');
            lsEppCheck.push(`${col1}|${col2}`);
            lsData_item.push(col3);
        }
        creandoChecksEPP();
    }


    document.querySelectorAll('input.uppercase').forEach(el => {
        el.addEventListener('input',()=>{
            el.value = el.value.toUpperCase();
        });
    });

}

function creandoChecksEPP(){
    const contenedor = document.querySelector('[data-item="32"]');

    lsEppCheck.forEach((item, index) => {
        const [valor, etiqueta] = item.split("|");
        const itera = lsData_item[index];

        const label = document.createElement("label");
        label.classList.add(
            "flex", "flex-col", "items-start", "space-y-1", 
            "cursor-pointer", "mb-4"
        );

        const spanTexto = document.createElement("span");
        spanTexto.classList.add(
            "text-sm", "font-medium", "text-gray-700"
        );
        spanTexto.textContent = etiqueta;

        const contenedorInline = document.createElement("div");
        contenedorInline.setAttribute("data-item", Number(itera) + 20);
        contenedorInline.classList.add(
            "flex", "items-center", "space-x-3"
        );


        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "equipos[]";
        checkbox.value = valor;
        checkbox.setAttribute("data-item", itera);
        checkbox.classList.add(
            "w-5", "h-5", "text-purple-600", "bg-white",
            "border-2", "border-purple-500", "rounded",
            "focus:ring-purple-500", "focus:ring-offset-1"
        );

        const inputTexto = document.createElement("input");
        inputTexto.type = "text";
        inputTexto.placeholder = "Coloca aqui la Talla ...";
        inputTexto.disabled = true;
        inputTexto.setAttribute("data-item", Number(itera) + 10);
        inputTexto.classList.add(
            "px-2", "py-1", "border", "border-gray-300", "rounded-md", "text-sm",
            "focus:outline-none", "focus:ring-2", "focus:ring-purple-500",
            "disabled:bg-gray-100", "disabled:cursor-not-allowed"
        );

        const asterisco = document.createElement("span");
        asterisco.textContent = "*";
        asterisco.classList.add(
            "text-red-500", "text-lg", "hidden"
        );

        checkbox.addEventListener("change", (e) => {
            const idRelacionado = Number(e.target.getAttribute("data-item")) + 10;
            const inputRelacionado = contenedor.querySelector(`[data-item="${idRelacionado}"]`);
            if (inputRelacionado) {
                const activo = e.target.checked;
                inputRelacionado.disabled = !activo;
                if (!activo) {
                    inputRelacionado.value = "";
                }
                asterisco.classList.toggle("hidden", !activo);
            }
        });

        contenedorInline.appendChild(checkbox);
        contenedorInline.appendChild(inputTexto);
        contenedorInline.appendChild(asterisco);

        label.appendChild(spanTexto);
        label.appendChild(contenedorInline);
        contenedor.appendChild(label);
    });
}

function asignarValores(){
    const lsData = lsDatos[0].split('|');
    const lsMeta = lsDatos[1].split('|');

    lsMeta.forEach((item, index)=>{
        const [campo = "", pos = "", len = ""] = item.split('¦');
        const el = document.querySelector(`[data-item="${pos}"]`);
        const valor = (lsData?.[index] ?? "").trim();
        if(el instanceof HTMLElement){
            el.setAttribute("data-campo", campo);
            el.setAttribute("data-valor", valor);
            el.maxLength = parseInt(len) || 0;
            el.required = el.classList.contains("no-req")? false:true;
            if(pos == "16"){
                asignarUbigeo(valor);
            }
            el.value = valor;
        }else{
            console.log('no existe elemento')
        }
    });

}

function asignarUbigeo(valor){
    if(valor.trim() != ""){
        const elDpto = document.querySelector('[data-hlp="201"]');
        const elProv = document.querySelector('[data-hlp="202"]');
        const codDpto = valor.slice(0, 2);
        const codProv = valor.slice(0, 4);

        elDpto.value = codDpto;
        elDpto.dispatchEvent(new Event('change', {bubbles:true}));

        if(elProv instanceof HTMLElement){
            elProv.value = codProv;
            elProv.dispatchEvent(new Event('change', {bubbles:true}));
        }
    }
}
