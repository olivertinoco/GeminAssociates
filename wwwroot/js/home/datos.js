let lsDatos = [];
var files = [];
var fileSize = 0;
var viajesContador = 0;
var viajesTotal = 0;
var filesContador = 0;
var filesTotal = 0;
var viajesPaquete = 1024 * 100; // 100kB
var viajesArchivo = "";

window.onload = function () {
  seteosIniciales();
  asignarValores();
  grabacionData();
  subirArchivos();
};

function seteosIniciales() {
  const rpta = hdfRpta.value;
  const listas = rpta.split("^");
  const nroReg = listas.length;
  lsDatos = listas[0].split("~");

  const cbo_condicion = document.getElementById("cbo-condicion");
  cbo_condicion.value = lsDatos[0].split("|").length < 6 ? "1" : "2";

  const result = [];
  for (let i = 1; i < nroReg; i++) {
    const [help, ...datos] = listas[i].split("~");
    const hlp = help.split("|");
    if (hlp[0] === "0") {
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
  const elAnnoPuesto = document.querySelectorAll(
    'input.solo-enteros[type="number"]',
  );

  elAnnoPuesto.forEach((input) => {
    input.addEventListener("input", (e) => {
      let valor = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
      const max = parseInt(e.target.max) || 50;
      if (parseInt(valor) > max) {
        valor = max.toString();
      }
      e.target.value = valor;
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

  document.querySelectorAll("input.uppercase").forEach((el) => {
    el.addEventListener("input", () => {
      el.value = el.value.toUpperCase();
    });
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
          el.setAttribute("data-valor", valor);
          el.maxLength = parseInt(len) || 0;
          el.required = !el.classList.contains("no-req");
          pos === "16" && asignarUbigeo(valor);
        }
        el.setAttribute("data-campo", campo);
        setValue(el, valor);
      } else {
        if (valor != "") {
          lsEpp = valor.split("¯");
          asignarEpps(lsEpp);
        }
      }
    });
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
  const postulante = cbo_condicion.value == "1" ? dni.value : "";

  bnt_enviar.addEventListener("click", (e) => {
    const boton = e.target;
    e.preventDefault();
    boton.disabled = true;
    boton.classList.add("pointer-events-none", "opacity-50");
    let results = [];

    probarEnvioFiles();
    return;

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
      boton.disabled = false;
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

    datosFinales.forEach((item) => {
      const valido = grupos.some((grupo) => item.startsWith(grupo));
      if (valido) {
        const [, campo, valor] = item.split("|");
        lsData.push(valor);
        lsMeta.push(`1.${campo}`);
      } else {
        const [, grupo, campo, , valor2] = item.split("|");
        lsData.push(valor2);
        lsMeta.push(`${grupo}.${campo}`);
      }
    });
    const elNuevo = document.getElementById("cbo-condicion");
    if (elNuevo.value === "1") {
      insertaDeshabilitados(lsData, lsMeta);
    }

    if (postulante != "") {
      lsData.push(postulante);
      lsMeta.push("1.4.4");
    }

    const salida = lsData.join("|") + "|" + lsMeta.join("|");

    // probarEnvioFiles();

    const formData = new FormData();
    formData.append("campos", salida);
    Http.post(
      "Home/GrabarPostulante",
      function (rpta) {
        if (rpta === "ok") {
          alert("Exito, se envio el formulario ...");
        } else {
          alert("ERROR... no se pudo enviar la informacion...");
        }
      },
      formData,
    );

    console.log(salida);

    boton.disabled = false;
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

  multiUploadInput.addEventListener("change", function () {
    if (multiUploadInput.files && multiUploadInput.files.length > 0) {
      const filesArray = Array.from(multiUploadInput.files);
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

      filesArray.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function () {
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
          );

          // Opciones ejemplo
          const options = ["Opción 1", "Opción 2", "Opción 3"];
          options.forEach((text, i) => {
            const option = document.createElement("option");
            option.value = `opt${i}`;
            option.textContent = text;
            select.appendChild(option);
          });
          container.appendChild(select);

          if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = reader.result;
            img.classList.add(
              "w-full",
              "h-auto",
              "object-cover",
              "rounded",
              "border",
            );
            container.appendChild(img);
          } else if (file.type === "application/pdf") {
            let embed = document.createElement("embed");
            embed.src = reader.result;
            embed.type = "application/pdf";
            embed.classList.add("w-full", "h-48", "border", "rounded");
            container.appendChild(embed);
          } else {
            const object = document.createElement("object");
            object.data = reader.result;
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

          imagesContainer.appendChild(container);
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
    multiUploadInput.value = "";
    multiUploadDisplayText.innerHTML = "";
    multiUploadDeleteButton.classList.add("hidden");
    multiUploadDeleteButton.classList.remove("z-100", "p-2", "my-auto");
  });
}

function probarEnvioFiles() {
  const multiUploadInput = document.getElementById("multi-upload-input");
  const multiUploadDeleteButton = document.getElementById(
    "multi-upload-delete",
  );
  const bnt_enviar = document.getElementById("bnt-enviar");

  const iniciarVariablesViajesFiles = () => {
    viajesContador = 0;
    viajesTotal = 0;
    filesContador = 0;
    filesTotal = files.length;
  };
  const iniciarFile = () => {
    fileSize = files[filesContador].size;
    viajesContador = 0;
    viajesTotal = Math.floor(fileSize / viajesPaquete);
    if (fileSize % viajesPaquete > 0) viajesTotal++;
    viajesArchivo = files[filesContador].name;
  };
  const enviarFiles = () => {
    var inicio = viajesContador * viajesPaquete;
    var fin = inicio + viajesPaquete;
    var file = files[filesContador];
    var blob = file.slice(inicio, fin);
    var flag = filesContador == 0 && viajesContador == 0 ? "1" : "0";
    var url =
      "Home/SubirArchivo?nombreArchivo=" +
      viajesArchivo +
      "&viajeActual=" +
      (viajesContador + 1) +
      "&flgInicio=" +
      flag;
    Http.post(url, mostrarRptSubirArchivo, blob);
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
        }
      }
    }
  };

  files = multiUploadInput.files;
  if (files.length === 0) {
    alert("No hay archivos para enviar.");
    bnt_enviar.disabled = false;
    bnt_enviar.classList.remove("pointer-events-none", "opacity-50");
  } else {
    iniciarVariablesViajesFiles();
    iniciarFile();
    enviarFiles();
  }
}
