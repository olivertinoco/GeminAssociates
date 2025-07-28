let lsDatos = [];
let files = [];
let originalFiles = [];
let filesArray = [];
var fileSize = 0;
var viajesContador = 0;
var viajesTotal = 0;
var filesContador = 0;
var filesTotal = 0;
var viajesPaquete = 1024 * 100; // 100kB
var viajesArchivo = "";
var nombreCarpeta = "";
let varTipoPersona;
let lsFilesUpload = [];
let objUbigeos = {};

window.onload = function () {
  seteosIniciales();
  asignarValores();
  grabacionData();
  subirArchivos();
};

function seteosIniciales() {
  const rpta = hdfRpta.value;
  if (hdfRpta && hdfRpta.value.trim() == "") {
    return;
  }
  const listas = rpta.split("^");
  const nroReg = listas.length;
  varTipoPersona = listas[0];
  lsDatos = listas[1].split("~");

  const cbo_condicion = document.getElementById("cbo-condicion");
  cbo_condicion.value = varTipoPersona;

  if (varTipoPersona === "2") {
    const lsData = lsDatos[0].split("|").map((el, item) => {
      switch (item) {
        case 6:
          return el.slice(0, 1);
        case 9:
          switch (el) {
            case "CASADO":
              return "CA";
            case "CONVIVIENTE":
              return "CO";
            case "DIVORCIADO":
              return "DI";
            case "SOLTERO":
              return "SO";
            case "VIUDO":
              return "VI";
            default:
              return "";
          }
        case 11:
          const [dia, mes, anio] = el.split("/");
          return `${anio}-${mes}-${dia}`;
        default:
          return el;
      }
    });
    var lsDataIni = lsData.join("|");
    lsDatos.shift();
    lsDatos.unshift(lsDataIni);
  }

  const modificarUbigeos = (datos) => {
    const nroReg = datos.length;
    for (let i = 0; i < nroReg; i++) {
      const [ubiCodigo, ubiReniec, dep, prov, dis] = datos[i].split("|");
      const ubigeo = varTipoPersona === "2" ? ubiReniec : ubiCodigo;
      objUbigeos[ubiReniec] = ubiCodigo;
      datos[i] = [ubigeo, dep, prov, dis].join("|");
    }
  };

  const result = [];
  for (let i = 2; i < nroReg; i++) {
    const [help, ...datos] = listas[i].split("~");
    const hlp = help.split("|");
    if (hlp[0] === "0") {
      hlp[1] === "201202203" && modificarUbigeos(datos);
      result.push({
        cab: hlp[1],
        datos: datos,
      });
    } else {
      const element = document.querySelector(`[data-hlp="${hlp[0]}"]`);
      if (i == 1) {
        GUI.Combo(element, datos);
      } else {
        GUI.Combo(element, datos, "Seleccione...");
      }
    }
  }

  const elUnidad = document.querySelector('[data-hlp="9"]');
  const elProyecto = document.querySelector('[data-hlp="51"]');
  const elvalidaciones = document.querySelectorAll(`
    input.solo-enteros[type="number"],
    input.solo-enteros[type="text"][inputmode="decimal"]
  `);

  elvalidaciones.forEach((input) => {
    input.addEventListener("input", (e) => {
      let valor = e.target.value;
      valor = valor.replace(",", ".");
      const usaGuion = input.hasAttribute("data-guion");
      const regex = usaGuion ? /[^0-9-]/g : /[^0-9.]/g;
      valor = valor.replace(regex, "");
      let nuevoValor;

      if (usaGuion) {
        nuevoValor = valor;
      } else {
        const partes = valor.split(".");
        if (partes.length > 2) {
          valor = partes[0] + "." + partes[1];
        }
        let longitudEnteros = parseInt(input.dataset.maximo);
        if (Number.isNaN(longitudEnteros)) {
          longitudEnteros = 2;
        }
        const parteEntera = partes[0].slice(0, longitudEnteros);
        const parteDecimal = partes[1]?.slice(0, 2);
        nuevoValor =
          parteDecimal !== undefined
            ? `${parteEntera}.${parteDecimal}`
            : parteEntera;
        const max = parseFloat(input.max);
        if (!Number.isNaN(max) && parseFloat(nuevoValor) > max) {
          nuevoValor = max.toString();
        }
      }
      input.value = nuevoValor;
    });
  });

  elUnidad.addEventListener("change", (e) => {
    const valor = e.target.value;

    //por cada iteracion carga las comunidades y los proyectos.
    for (let item = 0; item < 2; item++) {
      const id = (item + 50).toString();
      const { cab, datos } = result.find((item) => item.cab === id);

      const datosFiltrados = datos
        .filter((item) => item.split("|")[2] === valor)
        .map((item) => {
          const [col1, col2] = item.split("|");
          return `${col1}|${col2}`;
        });

      const elemento = document.querySelector(`[data-hlp="${cab}"]`);
      GUI.Combo(elemento, datosFiltrados, "Seleccione...");
    }

    elProyecto.dispatchEvent(new Event("change"));
  });

  elProyecto.addEventListener("change", (e) => {
    const valor = e.target.value;
    const { cab, datos } = result.find((item) => item.cab === "52");

    const datosFiltrados = datos
      .filter((item) => item.split("|")[2] === valor)
      .map((item) => {
        const [col1, col2] = item.split("|");
        return `${col1}|${col2}`;
      });

    const elPuestos = document.querySelector(`[data-hlp="${cab}"]`);
    GUI.Combo(elPuestos, datosFiltrados, "Seleccione...");
  });

  let ubigeos = [];
  const { cab = "", datos = [] } =
    result.find((item) => item.cab === "201202203") || {};
  if (cab != "") {
    const claves = cab.match(/.{1,3}/g);
    ubigeos = claves.map((clave) =>
      document.querySelector(`[data-hlp="${clave}"]`),
    );
  }

  const dataDpto = Array.from(
    datos.reduce((acc, item) => {
      const [codigo, departamento] = item.split("|");
      const clave = `${codigo.slice(0, 2)}|${departamento}`;
      acc.add(clave);
      return acc;
    }, new Set()),
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
    }, new Set()),
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
    }, new Set()),
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

  if (ubigeos.length) {
    GUI.Combo(ubigeos[0], dataDpto, "Seleccione...");

    ubigeos[0].addEventListener("change", (e) => {
      const valor = e.target.value;

      const dataFilterProv = dataProv.filter((item) => {
        const [codigoProv] = item.split("|");
        return codigoProv.startsWith(valor);
      });

      GUI.Combo(ubigeos[1], dataFilterProv, "Seleccione...");
      if (valor === "") {
        ubigeos[1].innerHTML = "";
      }
      ubigeos[2].innerHTML = "";
    });

    ubigeos[1].addEventListener("change", (e) => {
      const valor = e.target.value;

      const dataFilterDist = dataDist.filter((item) => {
        const [codigoDist] = item.split("|");
        return codigoDist.startsWith(valor);
      });

      GUI.Combo(ubigeos[2], dataFilterDist, "Seleccione...");
    });
  }

  const { datos: lsEppCheck = [] } =
    result.find((item) => item.cab === "200") || {};
  if (lsEppCheck.length) {
    creandoChecksEPP(lsEppCheck);
  }

  const { datos: lsFile = [] } =
    result.find((item) => item.cab === "300") || {};
  lsFilesUpload = Array.from(lsFile);

  document.querySelectorAll("input.uppercase").forEach((el) => {
    el.addEventListener("input", () => {
      el.value = el.value.toUpperCase();
    });
  });

  const lsGrupoSangre = (
    (result.find((item) => item.cab === "301")?.datos ?? [])[0] ?? ""
  ).split("|");

  const elGrupoSangre = document.querySelector('[data-item="109"]');

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "SELECCIONE...";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  elGrupoSangre.appendChild(defaultOption);

  lsGrupoSangre.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    elGrupoSangre.appendChild(option);
  });
}

function creandoChecksEPP(lsEppCheck) {
  const contenedor = document.getElementById("grupoEPP");

  lsEppCheck.forEach((item, index) => {
    const [valor, etiqueta] = item.split("|");

    const label = document.createElement("label");
    label.setAttribute("data-item-grupo", `${index}`);
    label.setAttribute("data-item", `${valor}D`);
    label.setAttribute("data-campo", "3.1");
    label.setAttribute("data-value", "");
    label.classList.add(
      "flex",
      "flex-col",
      "items-start",
      "space-y-1",
      "cursor-pointer",
      "mb-4",
      "grupo-epp",
    );

    const spanTexto = document.createElement("span");
    spanTexto.setAttribute("data-item-grupo", `${index}`);
    spanTexto.setAttribute("data-item", `${valor}B`);
    spanTexto.setAttribute("data-campo", "3.3");
    spanTexto.setAttribute("data-value", valor);
    spanTexto.textContent = etiqueta;
    spanTexto.classList.add(
      "text-sm",
      "font-medium",
      "text-gray-700",
      "grupo-epp",
    );

    const contenedorInline = document.createElement("div");
    contenedorInline.setAttribute("data-item-grupo", `${index}`);
    contenedorInline.setAttribute("data-item", `${valor}A`);
    contenedorInline.setAttribute("data-campo", "3.2");
    contenedorInline.setAttribute("data-value", "");
    contenedorInline.classList.add(
      "flex",
      "items-center",
      "space-x-3",
      "grupo-epp",
    );

    const inputTexto = document.createElement("input");
    inputTexto.type = "text";
    inputTexto.placeholder = "Coloca la Talla ...";
    inputTexto.disabled = false;
    inputTexto.setAttribute("data-item-grupo", `${index}`);
    inputTexto.setAttribute("data-item", `${valor}C`);
    inputTexto.setAttribute("data-campo", "3.4");
    inputTexto.setAttribute("data-valor", "");
    inputTexto.setAttribute("required", "");
    inputTexto.setAttribute("maxlength", "10");
    inputTexto.classList.add(
      "px-2",
      "py-1",
      "border",
      "border-gray-300",
      "rounded-md",
      "text-sm",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-purple-500",
      "disabled:bg-gray-100",
      "disabled:cursor-not-allowed",
      "grupo-epp",
    );

    const asterisco = document.createElement("span");
    asterisco.textContent = "*";
    asterisco.classList.add("text-red-500", "text-lg");

    contenedorInline.appendChild(inputTexto);
    contenedorInline.appendChild(asterisco);

    label.appendChild(spanTexto);
    label.appendChild(contenedorInline);
    contenedor.appendChild(label);
  });
}

function asignarValores() {
  if (lsDatos != "") {
    const lsData = lsDatos[0].split("|");
    const lsMeta = lsDatos[1].split("|");
    const TAGS_VALIDOS = ["INPUT", "SELECT"];
    let itera = true;
    let lsEpp = [];

    lsMeta.forEach((item, index) => {
      const [campo = "", pos = "", len = ""] = item.split("¦");
      const el = document.querySelector(`[data-item="${pos}"]`);
      const valor = (lsData?.[index] ?? "").trim();
      if (el instanceof HTMLElement) {
        if (TAGS_VALIDOS.includes(el.tagName)) {
          const elValor = varTipoPersona === "2" ? "" : valor;
          el.setAttribute("data-valor", elValor);
          const maxLen = parseInt(len);
          if (!Number.isNaN(maxLen)) {
            el.maxLength = maxLen;
          }
          el.required = !el.classList.contains("no-req");
          pos === "16" && asignarUbigeo(valor);
        }
        el.setAttribute("data-campo", campo);
        setValue(el, valor);
        if (varTipoPersona === "1") {
          el.setAttribute("disabled", "");
        }
      } else {
        if (valor != "") {
          lsEpp = valor.split("¯");
          asignarEpps(lsEpp);
        }
      }
    });

    if (varTipoPersona === "1") {
      eliminarEnvio();
    }

    const elUnidad = document.querySelector('[data-hlp="9"]');
    const elProyecto = document.querySelector('[data-hlp="51"]');
    const elPuestos = document.querySelector('[data-hlp="52"]');
    const elDist = document.querySelector('[data-hlp="203"]');
    elDist.addEventListener("change", (e) => {
      const valor = elDist.value;
      if (varTipoPersona === "2" && valor !== "") {
        elDist.dataset.aux = objUbigeos[valor] ?? "";
      }
    });

    if (elDist.value !== "") {
      elDist.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (elUnidad.value !== "") {
      elUnidad.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (elProyecto.dataset.valor !== "") {
      elProyecto.value = elProyecto.dataset.valor;
      elProyecto.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (elPuestos.dataset.valor !== "") {
      elPuestos.value = elPuestos.dataset.valor;
      elPuestos.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}

function asignarUbigeo(valor) {
  if (valor.trim() != "") {
    const elDpto = document.querySelector('[data-hlp="201"]');
    const elProv = document.querySelector('[data-hlp="202"]');
    const codDpto = valor.slice(0, 2);
    const codProv = valor.slice(0, 4);

    elDpto.value = codDpto;
    elDpto.dispatchEvent(new Event("change", { bubbles: true }));

    if (elProv instanceof HTMLElement) {
      elProv.value = codProv;
      elProv.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}

function setValue(el, valor) {
  if (el instanceof HTMLElement) {
    if ("value" in el) {
      el.value = valor;
    } else {
      el.dataset.value = valor;
    }
  }
}

function getValue(el) {
  if (el instanceof HTMLElement) {
    if ("value" in el) {
      return el.value.trim();
    }
    const raw = el.dataset.value;
    return typeof raw === "string" ? raw.trim() : raw;
  }
  return null;
}

function asignarEpps(lsEpp) {
  if (lsEpp.length) {
    lsEpp.forEach((item) => {
      const [eppSecId, eppSec, eppId, eppTalla] = item.split("¦");
      const elId = document.querySelector(`[data-item="${eppId}D"]`);
      const elSec = document.querySelector(`[data-item="${eppId}A"]`);
      const elTalla = document.querySelector(`[data-item="${eppId}C"]`);
      elId.dataset.value = eppSecId;
      elSec.dataset.value = eppSec;
      elTalla.value = eppTalla;
      elTalla.dataset.valor = eppTalla;
      if (varTipoPersona === "1") {
        elTalla.setAttribute("disabled", "");
      }
    });
  }
  const elPosId = document.querySelector('[data-item="1"]');
  const elements = document.querySelectorAll('[data-item$="D"].grupo-epp');
  const pos_id = getValue(elPosId);
  elements.forEach((el) => {
    if (getValue(el) === "") {
      setValue(el, pos_id);
    }
  });
}

function grabacionData() {
  const bnt_enviar = document.getElementById("bnt-enviar");
  const cbo_condicion = document.getElementById("cbo-condicion");
  const dni = document.querySelector('[data-item="4"]');
  const postulante = cbo_condicion.value == "2" ? dni.value : "";

  bnt_enviar.addEventListener("click", (e) => {
    e.preventDefault();
    bnt_enviar.disabled = true;
    bnt_enviar.classList.add("pointer-events-none", "opacity-50");
    let results = [];

    results = [
      validarRequeridos(
        "[data-item]:not(.grupo-epp):not(.grupo-direcc)",
        "postulante",
      ),
      validarRequeridos("[data-item].grupo-direcc", "direccion"),
      validarRequeridos("[data-item].grupo-epp", "EPPs"),
    ];

    const invalidos = results.find((r) => !r.valido);
    if (invalidos) {
      bnt_enviar.disabled = false;
      bnt_enviar.classList.remove("pointer-events-none", "opacity-50");
      alert(`Existen campos requeridos en el grupo: ${invalidos.grupo}`);
      invalidos.primerInvalido?.focus();
      return;
    }
    const resultado = results.flatMap((r) => r.datos);

    const eppsFiltrados = filtrarEPPsInvalidos(resultado);
    const otrosDatos = resultado.filter((linea) => !linea.startsWith("EPPs|"));

    const datosFinales = [...otrosDatos, ...eppsFiltrados];

    const grupos = ["postulante", "direccion"];
    const lsData = [];
    const lsMeta = [];

    const elDist = document.querySelector('[data-hlp="203"]');
    datosFinales.forEach((item) => {
      const valido = grupos.some((grupo) => item.startsWith(grupo));
      if (valido) {
        let [, campo, valor] = item.split("|");
        if (varTipoPersona === "2" && campo === "2.9") {
          valor = elDist.dataset.aux;
        }
        if (campo !== "0.0") {
          lsData.push(valor);
          lsMeta.push(`1.${campo}`);
        }
      } else {
        const [, grupo, campo, , valor2] = item.split("|");
        lsData.push(valor2);
        lsMeta.push(`${grupo}.${campo}`);
      }
    });

    if (postulante != "") {
      lsData.push(postulante);
      lsMeta.push("1.4.4");
    }

    const salida = lsData.join("|") + "|" + lsMeta.join("|");
    console.log(salida);

    probarEnvioFiles(salida);

    // const formData = new FormData();
    // formData.append("campos", salida);
    // Http.post(
    //   "Home/GrabarPostulante",
    //   function (rpta) {
    //     if (rpta === "ok") {
    //       alert("Exito, se envio el formulario ...");
    //     } else {
    //       alert("ERROR... no se pudo enviar la informacion...");
    //     }
    //   },
    //   formData,
    // );
  });
}

const validarRequeridos = (selector, grupo) => {
  let valido = true;
  let primerInvalido = null;
  const datosValidados = [];

  [...new Set(document.querySelectorAll(selector))].forEach((el) => {
    el.classList.remove(
      "border-red-500",
      "bg-red-50",
      "placeholder-red-400",
      "animate-shake",
    );
    if (el.hasAttribute("required") && !el.checkValidity()) {
      valido = false;
      el.classList.add(
        "border-red-500",
        "bg-red-50",
        "placeholder-red-400",
        "animate-shake",
        "rounded-md",
        "border-2",
      );
      if (!primerInvalido) primerInvalido = el;
    } else {
      if (grupo === "EPPs") {
        datosValidados.push(
          grupo +
            "|" +
            el.dataset.itemGrupo +
            "|" +
            el.dataset.campo +
            "|" +
            el.dataset.valor +
            "|" +
            getValue(el),
        );
      } else {
        if (el.dataset.valor != getValue(el)) {
          datosValidados.push(
            grupo +
              "|" +
              el.dataset.campo +
              "|" +
              (getValue(el) === undefined ? el.dataset.valor : getValue(el)),
          );
        }
      }
    }
  });

  const conteo = {};

  datosValidados.forEach((linea) => {
    const grupo = linea.split("|")[0];
    conteo[grupo] = (conteo[grupo] || 0) + 1;
  });

  const resultado = datosValidados.filter((linea) => {
    const grupo = linea.split("|")[0];
    return conteo[grupo] > 2;
  });

  return {
    grupo,
    valido,
    datos: resultado,
    primerInvalido,
  };
};

function filtrarEPPsInvalidos(lines) {
  const soloEPPs = lines.filter((linea) => linea.startsWith("EPPs|"));

  const grupos = new Map();
  soloEPPs.forEach((linea) => {
    const partes = linea.split("|");
    const indiceGrupo = partes[1];
    if (!grupos.has(indiceGrupo)) grupos.set(indiceGrupo, []);
    grupos.get(indiceGrupo).push(partes);
  });

  const gruposFiltrados = [...grupos.entries()].filter(([_, filas]) => {
    return !filas.some((p) => p[2] === "3.4" && p[3] === p[4]);
  });

  return gruposFiltrados.flatMap(([_, filas]) => filas.map((p) => p.join("|")));
}

function insertaDeshabilitados(lsData, lsMeta) {
  const elements = document.querySelectorAll("[data-item][disabled]");
  const elementsOrdenDesc = Array.from(elements).sort((a, b) => {
    const itemA = parseFloat(a.dataset.item);
    const itemB = parseFloat(b.dataset.item);
    return itemB - itemA;
  });
  elementsOrdenDesc.forEach((item) => {
    lsData.unshift(item.dataset.valor);
    lsMeta.unshift(`1.${item.dataset.campo}`);
  });
}

function subirArchivos() {
  const multiUploadButton = document.getElementById("multi-upload-button");
  const multiUploadInput = document.getElementById("multi-upload-input");
  const imagesContainer = document.getElementById("images-container");
  const multiUploadDisplayText = document.getElementById("multi-upload-text");
  const multiUploadDeleteButton = document.getElementById(
    "multi-upload-delete",
  );
  const bnt_enviar = document.getElementById("bnt-enviar");

  multiUploadButton.onclick = function () {
    bnt_enviar.disabled = true;
    bnt_enviar.classList.add("cursor-not-allowed", "opacity-50");
    multiUploadInput.click();
  };

  const objectUrls = [];

  multiUploadInput.addEventListener("change", function (e) {
    if (multiUploadInput.files && multiUploadInput.files.length > 0) {
      // files = Array.from(multiUploadInput.files);
      // const filesArray = [...files];
      originalFiles = Array.from(e.target.files);
      files = [...originalFiles];
      filesArray = [...originalFiles];

      const totalFiles = filesArray.length;
      let loadedFiles = 0;

      multiUploadDisplayText.innerHTML = `${totalFiles} archivos seleccionados`;

      imagesContainer.innerHTML = "";
      imagesContainer.classList.remove(
        "w-full",
        "max-w-[500px]",
        "mx-auto",
        "flex",
        "flex-col",
        "gap-4",
      );
      imagesContainer.classList.add(
        "w-full",
        "max-w-[500px]",
        "mx-auto",
        "flex",
        "flex-col",
        "gap-4",
      );
      multiUploadDeleteButton.classList.remove("hidden");
      multiUploadDeleteButton.classList.add("z-100", "p-2", "my-auto");
      const containerList = [];

      const selects = [];
      const selectedValues = new Map();
      const dni = document.querySelector('[data-item="4"]');

      filesArray.forEach((file, index) => {
        const container = document.createElement("div");
        container.classList.add(
          "w-full",
          "max-h-64",
          "overflow-y-auto", //scroll vertical
          "flex",
          "flex-col",
          "items-stretch",
          "justify-start",
          "bg-gray-100",
          "rounded-lg",
          "shadow",
          "p-2",
          "gap-2",
          "mb-3",
        );

        const label = document.createElement("label");
        label.textContent = `Archivo (${index + 1}):`;
        label.classList.add("text-sm", "font-semibold", "text-gray-700");
        container.appendChild(label);

        const select = document.createElement("select");
        select.classList.add(
          "w-full",
          "border",
          "rounded",
          "p-1",
          "text-sm",
          "bg-white",
          "uploadFiles",
        );

        const optionsMap = new Map();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "SELECCIONE TIPO DOC...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        lsFilesUpload.forEach((item) => {
          const [valor, text, dato] = item.split("|");
          const option = document.createElement("option");
          option.value = valor;
          option.textContent = text;
          option.dataset.valor = dato;
          select.appendChild(option);
          optionsMap.set(valor, option);
        });

        // NOTA: VALIDACIONES DE COMBOS NO DUPLICADOS EN SU DATA
        // =======================================================
        selects.push({ select, optionsMap });

        select.addEventListener("change", (event) => {
          const currentSelect = event.target;
          const newValue = currentSelect.value;
          const prevValue = selectedValues.get(currentSelect);
          const selectedOption = currentSelect.selectedOptions[0];

          selectedValues.set(currentSelect, newValue);
          const index = selects.findIndex(
            ({ select }) => select === currentSelect,
          );

          if (
            selectedOption &&
            selectedOption.dataset.valor &&
            originalFiles[index]
          ) {
            const originalFile = originalFiles[index];
            const originalName = originalFile.name;
            const extension = originalName.includes(".")
              ? "." + originalName.split(".").pop().toLowerCase()
              : "";
            const newFileName =
              dni.value.trim() + "-" + selectedOption.dataset.valor + extension;
            // Crear un nuevo archivo con el nuevo nombre
            const renamedFile = new File([originalFile], newFileName, {
              type: originalFile.type,
            });
            files[index] = renamedFile;
            filesArray[index] = renamedFile;
          }

          if (prevValue) {
            selects.forEach(({ select: otherSelect, optionsMap }) => {
              if (otherSelect !== currentSelect && optionsMap.has(prevValue)) {
                optionsMap.get(prevValue).disabled = false;
              }
            });
          }

          if (newValue) {
            selects.forEach(({ select: otherSelect, optionsMap }) => {
              if (otherSelect !== currentSelect && optionsMap.has(newValue)) {
                optionsMap.get(newValue).disabled = true;
              }
            });
          }
        });

        container.appendChild(select);
        containerList[index] = container;
        imagesContainer.appendChild(container);
      });

      filesArray.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function () {
          const container = containerList[index];
          const url = URL.createObjectURL(file);
          objectUrls.push(url);

          if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = url;
            img.classList.add(
              "w-full",
              "h-auto",
              "object-cover",
              "rounded",
              "border",
            );
            container.appendChild(img);
          } else if (file.type === "application/pdf") {
            const pdfName = file.name.toLowerCase();
            const risky =
              file.size > 1024 * 1024 * 2 ||
              pdfName.includes("firma") ||
              pdfName.includes("plantilla");

            if (risky) {
              const label = document.createElement("label");
              label.classList.add(
                "text-red-600",
                "text-sm",
                "text-center",
                "block",
                "mt-2",
              );
              label.innerText = `No se previsualiza PDF "${file.name}".`;
              container.appendChild(label);
            } else {
              // si no es archivo riesgoso, mostrar el embed normalmente
              const embed = document.createElement("embed");
              embed.src = url;
              embed.type = "application/pdf";
              embed.classList.add("w-full", "h-48", "border", "rounded");
              container.appendChild(embed);
            }
          } else {
            const object = document.createElement("object");
            object.data = url;
            object.type = file.type || "application/octet-stream";
            object.classList.add(
              "w-full",
              "h-32",
              "border",
              "rounded",
              "bg-white",
              "shadow",
              "text-sm",
              "text-gray-600",
              "text-center",
            );

            const fallback = document.createElement("p");
            fallback.textContent = `Preview No Disponible: ${file.name}`;
            fallback.classList.add(
              "text-center",
              "p-2",
              "text-gray-600",
              "text-sm",
            );

            object.appendChild(fallback);
            container.appendChild(object);
          }

          loadedFiles++;
          if (loadedFiles === totalFiles) {
            bnt_enviar.disabled = false;
            bnt_enviar.classList.remove("cursor-not-allowed", "opacity-50");
          }
        };

        reader.onerror = function () {
          console.error("Error leyendo archivo:", file.name);
          loadedFiles++;
          if (loadedFiles === totalFiles) {
            bnt_enviar.disabled = false;
            bnt_enviar.classList.remove("cursor-not-allowed", "opacity-50");
          }
        };

        reader.readAsDataURL(file);
      });
    }
  });

  multiUploadDeleteButton.addEventListener("click", () => {
    imagesContainer.innerHTML = "";
    imagesContainer.classList.remove(
      "w-full",
      "max-w-[500px]",
      "mx-auto",
      "flex",
      "flex-col",
      "gap-4",
    );

    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.length = 0; // limpiar Arreglo

    multiUploadInput.value = "";
    multiUploadDisplayText.innerHTML = "";
    multiUploadDeleteButton.classList.add("hidden");
    multiUploadDeleteButton.classList.remove("z-100", "p-2", "my-auto");
  });
}

function probarEnvioFiles(data) {
  let viajeCadena = 0;
  const multiUploadDeleteButton = document.getElementById(
    "multi-upload-delete",
  );
  const bnt_enviar = document.getElementById("bnt-enviar");
  const elDocumento = document.querySelector('[data-item="4"]');
  nombreCarpeta = elDocumento.value;

  const iniciarVariablesViajesFiles = () => {
    viajesContador = 0;
    viajesTotal = 0;
    filesContador = 0;
    filesTotal = files.length;
  };

  const iniciarFile = () => {
    const currentFile = files[filesContador];
    fileSize = currentFile.size;
    viajesContador = 0;
    viajesTotal = Math.floor(fileSize / viajesPaquete);
    if (fileSize % viajesPaquete > 0) viajesTotal++;
    viajesArchivo = currentFile.name;
  };

  const enviarFiles = async () => {
    var inicio = viajesContador * viajesPaquete;
    var fin = inicio + viajesPaquete;
    var file = files[filesContador];
    var blob = file.slice(inicio, fin);
    var flag = filesContador == 0 && viajesContador == 0 ? "1" : "0";
    var cadena = viajeCadena == 0 ? data : "";
    viajeCadena = 1;

    const formData = new FormData();
    formData.append("chunk", blob);
    formData.append("cadena", cadena);
    formData.append("nombreCarpeta", nombreCarpeta);
    formData.append("nombreArchivo", viajesArchivo);
    formData.append("viajeActual", viajesContador + 1);
    formData.append("flgInicio", flag);

    const url = hdfRaiz.value + "Home/SubirArchivo";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error en la solicitud ${response.status}`);
      }
      const rpta = await response.text();
      mostrarRptSubirArchivo(rpta === "ok");
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Error en la carga del archivo.");
      files = [];
    }
  };

  const mostrarRptSubirArchivo = (rpta) => {
    if (rpta) {
      viajesContador++;
      if (viajesContador < viajesTotal) {
        enviarFiles();
      } else {
        filesContador++;
        if (filesContador < filesTotal) {
          iniciarFile();
          enviarFiles();
        } else {
          alert("Todos los archivos se han subido correctamente.");
          multiUploadDeleteButton.click();
          bnt_enviar.disabled = false;
          bnt_enviar.classList.remove("pointer-events-none", "opacity-50");
          files = [];
          const elements = document.querySelectorAll("[data-item]");
          elements.forEach((el) => {
            ((el.value = ""), (el.dataset.valor = ""));
          });
          eliminarEnvio();
          const url = hdfRaiz.value + "Home/Index";
          window.location.href = url;
        }
      }
    } else {
      alert("Error en la respuesta del servidor al subir el archivo.");
      files = [];
    }
  };

  const validaSeleccionados = () => {
    const select = document.querySelectorAll(".uploadFiles");
    const filtrados = Array.from(select).filter((el) => el.value === "");
    return filtrados.length;
  };

  if (!files || files.length === 0) {
    alert("No hay archivos para enviar.");
    bnt_enviar.disabled = false;
    bnt_enviar.classList.remove("pointer-events-none", "opacity-50");
  } else {
    const longitud = validaSeleccionados();
    if (longitud !== 0) {
      alert("Existen Archivos sin Asignar Nombre.");
      bnt_enviar.disabled = false;
      bnt_enviar.classList.remove("pointer-events-none", "opacity-50");
    } else {
      iniciarVariablesViajesFiles();
      iniciarFile();
      enviarFiles();
    }
  }
}

function eliminarEnvio() {
  let bntEnviar = document.getElementById("bnt-enviar");
  bntEnviar.style.display = "none";
  let divSubirArchivos = document.getElementById("divSubirArchivos");
  divSubirArchivos.style.display = "none";
}
