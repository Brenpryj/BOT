console.log("VERSION NUEVA 24-02-2026");
(function () {

  // ======================
  // Config / Data fallback
  // ======================
  let DATA = {
    whatsappLink: "https://wa.me/5490000000000",
    mailLink: "mailto:equipo@ejemplo.com",
    redes: [],
    ejesGestion: [],
    leyes: [],
    proyectosEnTratamiento: [],
    accionesTerritoriales: [],
    legislaturaInfo: {
      funciona: "🏛️ La Legislatura debate y aprueba leyes provinciales…",
      integran: "👥 Integrada por diputadas y diputados provinciales…",
      comisiones: "🧩 Comisiones: analizan proyectos por tema…"
    },
    infoCiudadana: []
  };

  // ======================
  // UI
  // ======================
  rootElement.innerHTML = `
    <div class="vb-panel" id="vbPanel" aria-live="polite">
      <div class="vb-header">
        <div class="vb-avatar" title="Vicuñita">🦙</div>
        <div class="vb-title">
          <strong>Vicuñita</strong>
          <small>Asistente virtual • Equipo</small>
        </div>
        <div class="vb-header-actions">
          <button class="vb-icon-btn" id="vbHome" title="Menú principal">🏠</button>
          <button class="vb-icon-btn" id="vbClose" title="Cerrar">✕</button>
        </div>
      </div>

      <div class="vb-body" id="vbBody"></div>

      <div class="vb-quick" id="vbQuick"></div>

      <div class="vb-footer">
        <input class="vb-input" id="vbInput" type="text" placeholder="Escribí aquí (ej: salud, educación, 10585)…" />
        <button class="vb-send" id="vbSend">Enviar</button>
      </div>
      <div class="vb-note">Tip: podés buscar por palabra clave o por número de ley (ej: “salud”, “10585”).</div>
    </div>

    <button class="vb-fab" id="vbFab" aria-label="Abrir chat">
      <span>💬</span>
    </button>
  `;

  const elPanel = document.getElementById("vbPanel");
  const elBody = document.getElementById("vbBody");
  const elQuick = document.getElementById("vbQuick");
  const elFab = document.getElementById("vbFab");
  const elClose = document.getElementById("vbClose");
  const elHome = document.getElementById("vbHome");
  const elInput = document.getElementById("vbInput");
  const elSend = document.getElementById("vbSend");

  const STATE = {
    mode: "menu", // menu | awaiting_keyword | chat
    subscribedWeekly: localStorage.getItem("vb_weekly") === "true",
    welcomeHidden: false
  };

  // ======================
  // Helpers UX
  // ======================
  function scrollToBottom() {
    elBody.scrollTop = elBody.scrollHeight;
  }

  function addDivider(text) {
    const div = document.createElement("div");
    div.className = "vb-divider";
    div.textContent = text;
    elBody.appendChild(div);
    scrollToBottom();
  }

  function pushMsg(text, who = "bot", opts = {}) {
    const div = document.createElement("div");
    div.className = `vb-msg ${who === "user" ? "vb-user" : "vb-bot"} ${opts.extraClass || ""}`;
    if (opts.id) div.id = opts.id;
    div.textContent = text;
    elBody.appendChild(div);
    scrollToBottom();
  }

  function setQuickButtons(buttons) {
    elQuick.innerHTML = "";
    (buttons || []).forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "vb-chip";
      btn.type = "button";
      btn.textContent = b.label;

      btn.addEventListener("click", () => {
        if (b._isMenu !== true) hideWelcome();
        if (b._divider && b._isMenu !== true) addDivider(b._divider);
        b.onClick();
      });

      elQuick.appendChild(btn);
    });
  }

  function openLink(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ======================
  // Puente a Proyectos
  // ======================
  const PROYECTOS_PAGE = "proyectos.html";

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  // Detecta números en formatos: "10585", "ley 10585", "ley n° 10585", "L10585"
  function extraerNumeroLey(texto) {
    const t = normalize(texto);
    const match = t.match(/\b(?:ley\s*(?:n|nro|n°|no|num|numero)?\s*)?(?:l\s*)?(\d{4,6})\b/);
    return match ? match[1] : null;
  }

  // Si hay número, mandamos SOLO el número. Si no, palabra clave.
  function limpiarConsultaParaProyectos(texto) {
    const num = extraerNumeroLey(texto);
    return num ? num : (texto || "").trim();
  }

  function buildProyectosURL(query) {
    // Esto funciona bien tanto en file:/// como en GitHub Pages
    const base = new URL(PROYECTOS_PAGE, window.location.href);
    if (query && query.trim()) base.searchParams.set("q", query.trim());
    return base.toString();
  }

  function openProyectosConBusqueda(keywordRaw) {
    const query = limpiarConsultaParaProyectos(keywordRaw || "");
    const url = buildProyectosURL(query);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openProyectosSinBusqueda() {
    const url = buildProyectosURL("");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ======================
  // Menú principal
  // ======================
  const WELCOME_ID = "vbWelcome";

  function renderWelcome() {
    elBody.innerHTML = "";
    STATE.welcomeHidden = false;

    pushMsg(
`👋 ¡Hola! Soy Vicuñita, la asistente virtual del equipo de la Diputada Lourdes Ortiz.
Estoy acá para ayudarte a conocer más sobre nuestro trabajo, las leyes que impulsamos y nuestras acciones dentro y fuera de la Legislatura Provincial.

¿Qué te gustaría hacer hoy?`,
      "bot",
      { id: WELCOME_ID, extraClass: "vb-welcome" }
    );

    setQuickButtons([
      { label: "1️⃣ Trabajo Territorial", onClick: option1, _divider: "Trabajo Territorial" },
      { label: "2️⃣ Leyes y proyectos", onClick: option2, _divider: "Leyes y proyectos" },
      { label: "3️⃣ Sobre la Legislatura", onClick: option3, _divider: "Sobre la Legislatura" },
      { label: "4️⃣ Noticias recientes", onClick: option4, _divider: "Noticias recientes" },
      { label: "5️⃣ Contactar equipo", onClick: option5, _divider: "Contactar equipo" },
      { label: "6️⃣ Info ciudadana útil", onClick: option6, _divider: "Info ciudadana útil" }
    ]);

    STATE.mode = "menu";
  }

  function hideWelcome() {
    if (STATE.welcomeHidden) return;
    const w = document.getElementById(WELCOME_ID);
    if (w) w.classList.add("vb-hidden");
    STATE.welcomeHidden = true;
  }

  function backToMenu() {
    renderWelcome();
  }

  function formatDate(iso) {
    try {
      const [y, m, d] = iso.split("-").map(Number);
      return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    } catch {
      return iso;
    }
  }

  // ======================
  // Opción 1
  // ======================
  function option1() {
    pushMsg("🌿 Perfecto. ¿Qué querés conocer del trabajo legislativo?");
    setQuickButtons([
      { label: "🧭 Principales ejes", onClick: option1_ejes, _divider: "Principales ejes" },
      { label: "🤝 Acciones territoriales", onClick: option1_acciones, _divider: "Acciones territoriales" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function option1_ejes() {
    pushMsg("🧭 Estos son algunos ejes prioritarios de gestión:");
    (DATA.ejesGestion || []).forEach((e) => pushMsg(e));
    setQuickButtons([
      { label: "📜 Ver leyes impulsadas", onClick: option1_leyes, _divider: "Leyes impulsadas" },
      { label: "⬅️ Volver", onClick: option1, _divider: "Trabajo Territorial" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function option1_leyes() {
    pushMsg("📜 Te muestro una lista de leyes (con fecha). Si querés, también podés buscar por palabra clave o número de ley:");
    const lista = (DATA.leyes || []).slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    if (!lista.length) pushMsg("Aún no hay leyes cargadas en el bot. (Se cargan en bot/leyes.json)");
    lista.forEach((l) => {
      pushMsg(`✅ ${l.titulo}\n📅 ${formatDate(l.fecha)}\n🔗 Abrir: ${l.enlace}`);
    });

    setQuickButtons([
      { label: "🔎 Buscar (palabra o número)", onClick: option2_buscar, _divider: "Buscar" },
      { label: "⬅️ Volver", onClick: option1, _divider: "Trabajo Territorial" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function option1_acciones() {
    pushMsg("🤝 Algunas acciones territoriales y comunitarias:");
    const acc = DATA.accionesTerritoriales || [];
    if (!acc.length) pushMsg("Aún no hay acciones cargadas. (Se agregan en bot/leyes.json)");
    acc.forEach((a) => pushMsg(`📸 ${a.title}\n🖼️ ${a.img}`));
    setQuickButtons([
      { label: "🧭 Ver ejes", onClick: option1_ejes, _divider: "Principales ejes" },
      { label: "📜 Ver leyes", onClick: option1_leyes, _divider: "Leyes impulsadas" },
      { label: "⬅️ Volver", onClick: option1, _divider: "Trabajo Territorial" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  // ======================
  // Opción 2
// ======================
function option2() {
  pushMsg("📜 Bien. ¿Cómo querés consultar?");
  setQuickButtons([
    { label: "🔎 Buscar (palabra o número)", onClick: option2_buscar, _divider: "Buscar" },
    { label: "📚 Ver Proyectos Legislativos", onClick: openProyectosSinBusqueda, _divider: "Proyectos Legislativos" },
    { label: "🆕 Leyes sancionadas recientes", onClick: option2_recientes, _divider: "Leyes recientes" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

function option2_buscar() {
  pushMsg("🔎 Escribí una palabra o un número de ley (ej: salud, educación, 10585) y tocá Enviar.");
  STATE.mode = "awaiting_keyword";
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option2, _divider: "Leyes y proyectos" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
  elInput.focus();
}

/*
 */
function option2_recientes() {
  pushMsg("🆕 Leyes sancionadas recientemente (últimas 5):");

  const recientes = [
    { numero: "10.841", titulo: "Donación inmueble Munay", enlace: "proyectos_legislativos/DONACIÓN INMUEBLE MUNAY.pdf" },
    { numero: "10.824", titulo: "Educación Financiera", enlace: "proyectos_legislativos/EDUCACIÓN FINANCIERA.pdf" },
    { numero: "10.806", titulo: "Ejercicio profesional de Psicólogos", enlace: "proyectos_legislativos/EJERCICIO PSICOLOGOS.pdf" },
    { numero: "10.819", titulo: "Pirotecnia Cero", enlace: "proyectos_legislativos/PIROTECNIA CERO.pdf" },
    { numero: "10.826", titulo: "Juventudes", enlace: "proyectos_legislativos/JUVENTUDES.pdf" }
  ];

  // ✅ Tarjetas dentro del chat con botón clickeable
  recientes.forEach((l) => {
    const card = document.createElement("div");
    card.className = "vb-msg vb-bot";
    card.style.border = "1px solid rgba(0,0,0,.08)";
    card.style.borderRadius = "12px";
    card.style.padding = "10px 12px";
    card.style.margin = "8px 0";
    card.style.background = "#fff";

    const title = document.createElement("div");
    title.style.fontWeight = "700";
    title.style.marginBottom = "4px";
    title.textContent = `✅ Ley ${l.numero} — ${l.titulo}`;

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.gap = "8px";
    btnRow.style.marginTop = "8px";
    btnRow.style.flexWrap = "wrap";

    const btnVer = document.createElement("button");
    btnVer.type = "button";
    btnVer.textContent = "📄 Ver PDF";
    btnVer.className = "vb-chip";
    btnVer.addEventListener("click", () => openLink(l.enlace));

    // (opcional) botón descargar — si lo querés, lo activo también
    const btnDescargar = document.createElement("button");
    btnDescargar.type = "button";
    btnDescargar.textContent = "⬇️ Descargar";
    btnDescargar.className = "vb-chip";
    btnDescargar.addEventListener("click", () => {
      // Fuerza descarga
      const a = document.createElement("a");
      a.href = l.enlace;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    btnRow.appendChild(btnVer);
    btnRow.appendChild(btnDescargar);

    card.appendChild(title);
    card.appendChild(btnRow);

    elBody.appendChild(card);
    scrollToBottom();
  });

  setQuickButtons([
    { label: "🔎 Buscar (palabra o número)", onClick: option2_buscar, _divider: "Buscar" },
    { label: "⬅️ Volver", onClick: option2, _divider: "Leyes y proyectos" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

function option2_tratamiento() {
  pushMsg("🧾 Últimos 3 proyectos en tratamiento (con resumen):");
  const list = (DATA.proyectosEnTratamiento || []).slice(0, 3);
  if (!list.length) pushMsg("No hay proyectos en tratamiento cargados todavía en el bot.");
  list.forEach((p) => pushMsg(`📌 ${p.titulo} (${p.anio})\n📝 ${p.resumen}\n🔗 ${p.enlace}`));

  setQuickButtons([
    { label: "🔎 Buscar (palabra o número)", onClick: option2_buscar, _divider: "Buscar" },
    { label: "⬅️ Volver", onClick: option2, _divider: "Leyes y proyectos" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// ✅ Búsqueda profesional: siempre abre Proyectos filtrado (sin falsos "no encontré")
function searchKeyword(keywordRaw) {
  const original = (keywordRaw || "").trim();
  const cleaned = limpiarConsultaParaProyectos(original);

  if (!cleaned) {
    pushMsg("Decime una palabra o número de ley (ej: salud, educación, 10490, 10585).");
    return;
  }

  const num = extraerNumeroLey(original);
  if (num) {
    pushMsg(`🔎 Buscando Ley ${num} en Proyectos Legislativos…`);
  } else {
    pushMsg(`🔎 Buscando “${cleaned}” en Proyectos Legislativos…`);
  }

  // Abrimos directo (sin esperar click)
  openProyectosConBusqueda(cleaned);

  setQuickButtons([
    {
      label: "📚 Ver Proyectos Legislativos",
      onClick: () => openProyectosConBusqueda(cleaned),
      _divider: "Proyectos Legislativos"
    },
    {
      label: "🔎 Buscar otra palabra",
      onClick: option2_buscar,
      _divider: "Buscar"
    },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

/* ======================
   Helpers (NO rompen nada)
   ====================== */

function getLeyesDesdeProyectos() {
  // Tomamos lo que esté expuesto desde proyectos.html
  const raw = (window && window.proyectosData) ? window.proyectosData : [];

  if (!Array.isArray(raw) || !raw.length) return [];

  const seen = new Set();
  const leyes = [];

  raw.forEach((item) => {
    const titulo = (item.titulo || item.nombre || item.title || "").toString().trim();
    const subtitulo = (item.subtitulo || item.ley || item.numero || "").toString().trim();
    const enlace = item.pdf || item.enlace || item.url || item.archivo || "";

    const numero = extraerNumeroLey(titulo) || extraerNumeroLey(subtitulo);

    // Si no hay número, igual lo dejamos pasar, pero dedupeamos por enlace+título
    const key = numero ? `N:${numero}` : `E:${enlace}|T:${titulo}`.toLowerCase();

    if (seen.has(key)) return;
    seen.add(key);

    leyes.push({
      numero,
      titulo: titulo || subtitulo,
      enlace
    });
  });

  return leyes;
}

function extraerNumeroLey(texto) {
  const t = (texto || "").toString();

  // Busca 5 dígitos seguidos (ej: 10841, 10585, 10754)
  const m = t.match(/(?:ley\s*)?(\d{5})/i);
  if (!m) return null;

  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

// ======================
// Opción 3 
// ======================

DATA.legislaturaInfo = {
  funciona: [
    "🏛️ ¿Cómo funciona la Legislatura de La Rioja?",
    "",
    "• Es el órgano que debate y aprueba leyes provinciales.",
    "• Es unicameral (una sola cámara) e integrada por diputadas y diputados elegidos por voto popular.",
    "",
    "Cómo se trabaja (resumen):",
    "1) Se presenta un proyecto (Ley / Resolución / Declaración).",
    "2) Pasa a Comisiones para análisis y mejoras.",
    "3) Se emite dictamen (recomendación).",
    "4) Se debate en el recinto y se vota.",
    "5) Si se aprueba, se sanciona y sigue el circuito correspondiente.",
  ].join("\n"),

  comisiones: [
    "🧩 ¿Qué son las Comisiones?",
    "",
    "Las comisiones son grupos de legisladores/as que estudian los proyectos antes de que lleguen al recinto.",
    "",
    "Qué hacen:",
    "• Analizan el tema (salud, educación, presupuesto, obras, etc.).",
    "• Pueden pedir informes y realizar reuniones de trabajo.",
    "• Elaboran un dictamen: aprobar, modificar o rechazar.",
    "",
    "Cómo se integran:",
    "• Se conforman con legisladores/as de distintos espacios.",
    "• Suelen tener Presidencia, Vicepresidencia, Secretaría e integrantes.",
  ].join("\n"),
};

// ---- Lectura del listado oficial (evita CORS usando Jina Reader) ----
const LEGI_URL = "https://legislaturalarioja.gob.ar/legisladores.html";
const LEGI_URL_READER = "https://r.jina.ai/https://legislaturalarioja.gob.ar/legisladores.html";

function normalizarBloque(raw) {
  if (!raw) return "";
  return raw
    .replace(/\bPresidente\b/gi, "")
    .replace(/\bPresidenta\b/gi, "")
    .replace(/\bVicepresidente\b/gi, "")
    .replace(/\bVicepresidenta\b/gi, "")
    .replace(/\bSecretario\b/gi, "")
    .replace(/\bSecretaría\b/gi, "")
    .replace(/\bSecretarío\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function encabezadoBloque(nombreBloque) {
  const linea = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
  const titulo = `BLOQUE: ${String(nombreBloque || "SIN BLOQUE INFORMADO").toUpperCase()}`;
  return `${linea}\n${titulo}\n${linea}`;
}

function limpiarBasuraDeLinks(s) {
  if (!s) return "";
  let t = String(s);

  // borra cosas tipo: ](https://...png) o ](HTTPS://...)
  t = t.replace(/\]\(\s*https?:\/\/[^\s)]+\s*\)/gi, " ");

  // borra URLs sueltas
  t = t.replace(/https?:\/\/\S+/gi, " ");

  // borra rastros de rutas/imágenes
  t = t.replace(/\bimagenes\/\S+/gi, " ");
  t = t.replace(/\b\w+\.(png|jpg|jpeg|gif|webp)\b/gi, " ");

  // borra corchetes sueltos
  t = t.replace(/[\[\]]/g, " ");

  // compacta espacios
  t = t.replace(/\s{2,}/g, " ").trim();

  return t;
}

function pareceNombreHumano(s) {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 6) return false;
  // solo letras, espacios y signos comunes de nombres
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/.test(t);
}

function parsearLegisladoresDesdeTexto(texto) {
  const out = [];
  const re =
    /Dip\.\s*([^\n]+)\n[\s\S]*?Partido Político\n\s*([^\n]+)\n[\s\S]*?Mandato\n\s*([0-9]{4}\s*-\s*[0-9]{4})\n[\s\S]*?Bloque Político\n\s*([^\n]+)/g;

  let m;
  while ((m = re.exec(texto)) !== null) {
    const chunkRaw = m[0];

    // Limpiamos el chunk entero primero (esto elimina lo pegado tipo ](https://...png)
    const chunk = limpiarBasuraDeLinks(chunkRaw);

    const nombreCorto = limpiarBasuraDeLinks((m[1] || "").trim());
    const partido = limpiarBasuraDeLinks((m[2] || "").trim());
    const mandato = limpiarBasuraDeLinks((m[3] || "").trim());
    const bloque = normalizarBloque(limpiarBasuraDeLinks((m[4] || "").trim()));

    // Elegir el nombre más completo posible del chunk
    let nombre = nombreCorto;

    const lineas = chunk
      .split("\n")
      .map((s) => limpiarBasuraDeLinks(s.trim()))
      .filter(Boolean);

    for (const linea of lineas) {
      const low = linea.toLowerCase();
      const esEtiqueta =
        low.includes("partido político") ||
        low.includes("mandato") ||
        low.includes("bloque político") ||
        low.includes("departamento") ||
        low.startsWith("dip.");

      if (!esEtiqueta && pareceNombreHumano(linea) && linea.length > nombre.length) {
        nombre = linea;
      }
    }

    // Si quedó algo raro, fallback al corto
    if (!pareceNombreHumano(nombre)) nombre = nombreCorto;

    // Normalizar nombre final
    nombre = limpiarBasuraDeLinks(nombre).replace(/\s{2,}/g, " ").trim();

    out.push({ nombre, partido, mandato, bloque });
  }

  // Deduplicar por nombre (normalizado)
  const seen = new Set();
  const final = [];
  for (const l of out) {
    const key = (l.nombre || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!key) continue;

    // si hay dos versiones, nos quedamos con la más larga (más completa)
    if (!seen.has(key)) {
      seen.add(key);
      final.push(l);
    }
  }

  return final;
}

function formatearLegislador(l) {
  const nombre = (l.nombre || "").toUpperCase().replace(/\s+/g, " ").trim();

  const lineas = [];
  lineas.push(`-> ${nombre}`);

  if (l.partido) lineas.push(`   Partido: ${l.partido}`);
  if (l.mandato) lineas.push(`   Mandato: ${l.mandato}`);

  return lineas.join("\n");
}

async function buildLegisladoresMsg() {
  try {
    const res = await fetch(LEGI_URL_READER, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const textoPlano = await res.text();

    const legisladores = parsearLegisladoresDesdeTexto(textoPlano);

    if (!legisladores.length) {
      return [
        "👥 Quiénes la integran",
        "",
        "No pude leer el listado automáticamente en este momento.",
        "",
        `Fuente oficial: ${LEGI_URL}`,
      ].join("\n");
    }

    // Agrupar por bloque (mantener sí o sí)
    const porBloque = {};
    for (const l of legisladores) {
      const b = l.bloque || "Sin bloque informado";
      (porBloque[b] ||= []).push(l);
    }

    const bloques = Object.keys(porBloque).sort((a, b) => a.localeCompare(b, "es"));

    // Orden por nombre dentro del bloque
    for (const b of bloques) {
      porBloque[b].sort((x, y) => (x.nombre || "").localeCompare(y.nombre || "", "es"));
    }

    // Mensaje final
    let msg = [
      "👥 Quiénes integran la Legislatura (listado oficial)",
      "",
      "Agrupado por bloques políticos:",
      "",
    ].join("\n");

    for (const b of bloques) {
      msg += `${encabezadoBloque(b)}\n\n`;
      for (const l of porBloque[b]) {
        msg += `${formatearLegislador(l)}\n\n`;
      }
      msg += `\n`;
    }

    msg += [
      "Fuente oficial:",
      LEGI_URL,
      "",
      "Nota: si algún dato no figura en la ficha pública, no se muestra aquí.",
    ].join("\n");

    return msg.trim();
  } catch (e) {
    return [
      "👥 Quiénes la integran",
      "",
      "No se pudo cargar el listado en este momento.",
      "",
      `Fuente oficial: ${LEGI_URL}`,
    ].join("\n");
  }
}

// ======================
// Menú dentro del chat
// ======================
function option3() {
  pushMsg("🏛️ ¿Qué querés saber sobre la Legislatura?");
  setQuickButtons([
    {
      label: "⚙️ Cómo funciona",
      onClick: () => {
        pushMsg(DATA.legislaturaInfo?.funciona || "");
        option3();
      },
      _divider: "Cómo funciona",
    },
    {
      label: "👥 Quiénes la integran",
      onClick: async () => {
        pushMsg("🔄 Cargando listado oficial de legisladores...");
        const msg = await buildLegisladoresMsg();
        pushMsg(msg);
        option3();
      },
      _divider: "Quiénes la integran",
    },
    {
      label: "🧩 Qué son las comisiones",
      onClick: () => {
        pushMsg(DATA.legislaturaInfo?.comisiones || "");
        option3();
      },
      _divider: "Comisiones",
    },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true },
  ]);
}
  // ======================
  // Opción 4
  // ======================
  function option4() {
    pushMsg("📰 Noticias y actividades recientes:");
    (DATA.redes || []).forEach((r) => pushMsg(`🔗 ${r.title}\n${r.url}`));

    const subText = STATE.subscribedWeekly
      ? "✅ Ya estás suscripta/o a novedades semanales (en este navegador)."
      : "¿Querés recibir novedades semanales? (queda guardado en este navegador)";

    pushMsg(subText);

    setQuickButtons([
      {
        label: STATE.subscribedWeekly ? "❌ Quitar suscripción" : "✅ Suscribirme semanal",
        onClick: () => {
          STATE.subscribedWeekly = !STATE.subscribedWeekly;
          localStorage.setItem("vb_weekly", String(STATE.subscribedWeekly));
          pushMsg(STATE.subscribedWeekly ? "Listo ✅ te dejo activadas las novedades semanales." : "Hecho ✅ desactivé las novedades semanales.");
          option4();
        },
        _divider: "Novedades"
      },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  // ======================
// ======================
// Opción 5 - Contactar equipo
// ======================
function option5() {
  pushMsg("📞 Para contactar al equipo, podés elegir una opción:");

  setQuickButtons([
    {
      label: "✉️ Mail institucional",
      onClick: () =>
        openMailDirect({
          to: "equipolourdesortiz1@gmail.com",
          subject: "Contacto desde Vicuñita",
          body: "Hola equipo, les escribo por lo siguiente:\n\n",
        }),
      _divider: "Mail",
    },
    {
      label: "🤝 Participar en actividades",
      onClick: () => option5_ActivitiesFormInChat(),
      _divider: "Actividades",
    },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true },
  ]);
}

// ✅ Mail directo (evita pestaña en blanco)
function openMailDirect({ to, subject = "", body = "" }) {
  const mailto =
    `mailto:${encodeURIComponent(to)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
}

// ✅ Contenedor real de mensajes (funciona en PC y celular)
function getChatMessagesContainerSmart() {
  return document.getElementById("vbBody");
}

// ✅ Formulario DENTRO del chat (sin mensajes de error)
function option5_ActivitiesFormInChat(retries = 10) {
  const container = getChatMessagesContainerSmart();

  // En móvil puede tardar en estar listo: reintento silencioso
  if (!container) {
    if (retries > 0) return setTimeout(() => option5_ActivitiesFormInChat(retries - 1), 120);
    return; // ❌ no mostramos error
  }

  // Evitar duplicado si ya existe
  const old = document.getElementById("formActividadesEnChat");
  if (old) old.remove();

  const bubble = document.createElement("div");
  bubble.id = "formActividadesEnChat";
  bubble.className = "vb-msg vb-bot actividad-bubble";

  bubble.innerHTML = `
    <div class="actividad-card">
      <div class="actividad-title">🤝 Participar en actividades</div>

      <form class="form-actividades-chat" autocomplete="on">
        <label>Nombre y apellido *</label>
        <input type="text" name="nombre" placeholder="Ej: Romina Díaz" required />

        <label>Número de teléfono *</label>
        <input type="tel" name="telefono" placeholder="Ej: 3804..." required />

        <label>Email *</label>
        <input type="email" name="email" placeholder="Ej: nombre@gmail.com" required />

        <label>¿En qué actividades te gustaría participar? *</label>
        <textarea name="actividades" rows="3" placeholder="Ej: rondas de servicios, eventos barriales, voluntariado..." required></textarea>

        <label>Disponibilidad horaria *</label>
        <input type="text" name="disponibilidad" placeholder="Ej: Lun a Vie 9 a 12 / Sáb por la tarde..." required />

        <div class="form-actions">
          <button type="submit" class="btn-enviar-form">Enviar</button>
          <button type="button" class="btn-cancelar-form">Cancelar</button>
        </div>

        <small class="help">Al enviar, se abrirá tu correo con el mensaje ya armado.</small>
      </form>
    </div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;

  const form = bubble.querySelector("form");
  const cancel = bubble.querySelector(".btn-cancelar-form");

  cancel.addEventListener("click", () => {
    bubble.remove();
    container.scrollTop = container.scrollHeight;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nombre = (data.get("nombre") || "").toString().trim();
    const telefono = (data.get("telefono") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const actividades = (data.get("actividades") || "").toString().trim();
    const disponibilidad = (data.get("disponibilidad") || "").toString().trim();

    // Si falta algo, no hacemos nada (sin mensajes extra)
    if (!nombre || !telefono || !email || !actividades || !disponibilidad) return;

    const subject = "Participación en actividades (Vicuñita)";
    const body =
`Hola equipo,
Quiero participar en actividades. Mis datos son:

• Nombre y apellido: ${nombre}
• Teléfono: ${telefono}
• Email: ${email}
• Actividades de interés: ${actividades}
• Disponibilidad horaria: ${disponibilidad}

¡Gracias!`;

    bubble.remove();
    openMailDirect({ to: "equipolourdesortiz1@gmail.com", subject, body });
  });
}
// ======================
// Opción 6 - Información Ciudadana Útil
// ======================
function option6() {
  pushMsg("📘 GUÍA DE SERVICIOS Y EMERGENCIAS");
  pushMsg("Seleccioná la categoría que necesitás:");

  setQuickButtons([
    { label: "🚨 Emergencias Generales", onClick: showEmergencias, _divider: "Emergencias" },
    { label: "👩 Mujer y Diversidad", onClick: showMujer, _divider: "Mujer y Diversidad" },
    { label: "👶 Niñez y Adolescencia", onClick: showNinez, _divider: "Niñez" },
    { label: "🏛 Asistencia Social", onClick: showSocial, _divider: "Asistencia Social" },
    { label: "🚒 Defensa Civil y Bomberos", onClick: showEmergenciaLocal, _divider: "Defensa Civil" },
    { label: "👮 Comisarías", onClick: showComisarias, _divider: "Comisarías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// 🚨 Emergencias Generales
function showEmergencias() {
  pushMsg("🚨 EMERGENCIAS GENERALES");
  pushMsg("📞 911 – Emergencias generales");
  pushMsg("🚑 107 – Emergencias médicas / Ambulancia");
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// 👩 Mujer y Diversidad
function showMujer() {
  pushMsg("👩 MUJER Y DIVERSIDAD");
  pushMsg("📞 3804 640054 (Llamadas y WhatsApp)");
  pushMsg("Asistencia ante violencia por razón de género. Orientación social, psicológica y legal.");
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// 👶 Niñez y Adolescencia
function showNinez() {
  pushMsg("👶 NIÑEZ Y ADOLESCENCIA");
  pushMsg("📞 Línea 102 – Denuncias o vulneración de derechos de niñas, niños y adolescentes.");
  pushMsg("📞 Dirección Gral. Niñez, Adolescencia y Familia: 3804 468448");
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// 🏛 Asistencia Social
function showSocial() {
  pushMsg("🏛 ASISTENCIA SOCIAL");
  pushMsg("📞 3804 155135 – Ministerio de Desarrollo, Igualdad e Integración Social");
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// 🚒 Defensa Civil y Bomberos
function showEmergenciaLocal() {
  pushMsg("🚒 DEFENSA CIVIL Y BOMBEROS");
  pushMsg("📞 Defensa Civil: 4426402");
  pushMsg("📞 Bomberos: 4453547");
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}

// 👮 Comisarías
function showComisarias() {
  pushMsg("👮 COMISARÍAS");
  pushMsg("Comisaría 1ra: 3804 440863");
  pushMsg("Comisaría 2da: 3804 365115");
  pushMsg("Comisaría 3ra: 3804 368864");
  pushMsg("Comisaría 4ta: 3804 440947");
  pushMsg("Comisaría 5ta: 3804 368907");
  pushMsg("Comisaría 6ta: 3804 440845");
  pushMsg("Comisaría 7ma: 3804 440161");
  pushMsg("Comisaría 8va: 3804 326986");
  setQuickButtons([
    { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
  ]);
}
  // ======================
  // Input / envío
  // ======================
  function handleSend() {
    const text = (elInput.value || "").trim();
    if (!text) return;

    pushMsg(text, "user");
    elInput.value = "";

    if (STATE.mode === "awaiting_keyword") {
      searchKeyword(text);
      return;
    }

    // Chat libre: igual mandamos a Proyectos filtrado
    searchKeyword(text);
  }

  // ======================
  // Open / Close
  // ======================
  function openPanel() {
    elPanel.classList.add("vb-open");
    elFab.style.display = "none";
    if (!elBody.childElementCount) renderWelcome();
    setTimeout(() => elInput.focus(), 50);
  }

  function closePanel() {
    elPanel.classList.remove("vb-open");
    elFab.style.display = "grid";
  }

  // ======================
  // Events
  // ======================
  elFab.addEventListener("click", openPanel);
  elClose.addEventListener("click", closePanel);
  elHome.addEventListener("click", backToMenu);

  elSend.addEventListener("click", handleSend);
  elInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  // ======================
  // Carga de datos desde JSON
  // ======================
  async function loadData() {
    try {
      const res = await fetch("bot/leyes.json", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar leyes.json");
      const json = await res.json();
      DATA = { ...DATA, ...json };
    } catch (err) {
      console.warn("Vicuñita: usando fallback, no se pudo leer bot/leyes.json", err);
    }
  }

  async function init() {
    await loadData();
    // El bot inicia cerrado. Se abre con el botón 💬.
  }

  init();
})();