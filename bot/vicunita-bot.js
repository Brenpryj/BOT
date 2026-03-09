
(function () {
  "use strict";

  // ======================
  // ROOT (FIX CRÍTICO)
  // ======================
  const rootElement = document.getElementById("vicunita-bot-root");
  if (!rootElement) {
    console.warn("Vicuñita: no existe #vicunita-bot-root en el HTML. No se puede renderizar el bot.");
    return;
  }

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
      <div class="vb-note">
        Tip: podés buscar por palabra clave o por número de ley (ej: “salud”, “10585”).
      </div>
    </div>

    <button class="vb-fab" id="vbFab" aria-label="Abrir chat">
      <span>💬</span>
    </button>

    <!-- 🔔 Burbuja flotante inicial -->
    <div class="vb-tooltip" id="vbTooltip" role="status" aria-live="polite" tabindex="0">
      💬 ¿Necesitás ayuda? Tocá acá
    </div>
  `;

  const elPanel = document.getElementById("vbPanel");
  const elBody = document.getElementById("vbBody");
  const elQuick = document.getElementById("vbQuick");
  const elFab = document.getElementById("vbFab");
  const elTooltip = document.getElementById("vbTooltip");
  const elClose = document.getElementById("vbClose");
  const elHome = document.getElementById("vbHome");
  const elInput = document.getElementById("vbInput");
  const elSend = document.getElementById("vbSend");

  const STATE = {
    mode: "menu",
  subscribedWeekly: localStorage.getItem("vb_weekly") === "true",
  welcomeHidden: false,
  lastKeyword: "",
  lastUserText: "",
  lastPage: window.location.pathname.split("/").pop() || "index.html"
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

  /**
   * pushMsg normal (texto)
   * ✅ ahora soporta opts.html = true (para render prolijo en tarjetas)
   */
  function pushMsg(text, who = "bot", opts = {}) {
    const div = document.createElement("div");
    div.className = `vb-msg ${who === "user" ? "vb-user" : "vb-bot"} ${opts.extraClass || ""}`;
    if (opts.id) div.id = opts.id;

    if (opts.html) {
      div.innerHTML = text || "";
    } else {
      div.textContent = text || "";
    }

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

  /* =====================================================
     🔔 Tooltip flotante
  ===================================================== */

  const TIP_KEY = "vb_tip_seen_v4";

  function positionTooltip() {
    if (!elTooltip || !elFab) return;

    const fabRect = elFab.getBoundingClientRect();
    const tipRect = elTooltip.getBoundingClientRect();

    const gap = 12;
    const margin = 10;

    let left = fabRect.left + (fabRect.width / 2) - tipRect.width + 18;
    let top = fabRect.top - tipRect.height - gap;

    left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - tipRect.height - margin));

    elTooltip.style.left = `${left}px`;
    elTooltip.style.top = `${top}px`;

    const arrowX = (fabRect.left + fabRect.width / 2) - left;
    const arrowLeft = Math.max(18, Math.min(arrowX, tipRect.width - 24));

    elTooltip.style.setProperty("--arrow-left", `${arrowLeft}px`);
    elTooltip.style.setProperty("--arrow-bottom", `-6px`);
  }

  function showTooltipOnce() {
    if (!elTooltip) return;

    const seen = localStorage.getItem(TIP_KEY) === "true";
    if (seen) return;

    setTimeout(() => {
      elTooltip.classList.add("vb-show");
      positionTooltip();
      requestAnimationFrame(positionTooltip);
      setTimeout(positionTooltip, 60);
      setTimeout(positionTooltip, 220);
    }, 900);

    setTimeout(() => {
      elTooltip.classList.remove("vb-show");
    }, 6500);

    localStorage.setItem(TIP_KEY, "true");
  }

  function hideTooltip() {
    if (!elTooltip) return;
    elTooltip.classList.remove("vb-show");
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

  function extraerNumeroLey(texto) {
    const t = normalize(texto);
    const match = t.match(/\b(?:ley\s*(?:n|nro|n°|no|num|numero)?\s*)?(?:l\s*)?(\d{4,6})\b/);
    return match ? match[1] : null;
  }

  function limpiarConsultaParaProyectos(texto) {
    const num = extraerNumeroLey(texto);
    return num ? num : (texto || "").trim();
  }

  function buildProyectosURL(query) {
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
      // { label: "1️⃣ Trabajo Territorial", onClick: option1, _divider: "Trabajo Territorial" },
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

  // ✅ NUEVA opción chat
  function optionChat() {
    pushMsg("💬 Dale, escribime lo que necesitás. Podés buscar por palabra o número de ley (ej: salud, 10585).");
    STATE.mode = "chat";
    setQuickButtons([
      { label: "📚 Ver Proyectos Legislativos", onClick: openProyectosSinBusqueda, _divider: "Proyectos Legislativos" },
      { label: "🔎 Buscar (palabra o número)", onClick: option2_buscar, _divider: "Buscar" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
    setTimeout(() => elInput.focus(), 50);
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

  function option2_recientes() {
    pushMsg("🆕 Leyes sancionadas recientemente (últimas 5):");

    const recientes = [
      { numero: "10.841", titulo: "Donación inmueble Munay", enlace: "proyectos_legislativos/DONACIÓN INMUEBLE MUNAY.pdf" },
      { numero: "10.824", titulo: "Educación Financiera", enlace: "proyectos_legislativos/EDUCACIÓN FINANCIERA.pdf" },
      { numero: "10.806", titulo: "Ejercicio profesional de Psicólogos", enlace: "proyectos_legislativos/EJERCICIO PSICOLOGOS.pdf" },
      { numero: "10.819", titulo: "Pirotecnia Cero", enlace: "proyectos_legislativos/PIROTECNIA CERO.pdf" },
      { numero: "10.826", titulo: "Juventudes", enlace: "proyectos_legislativos/JUVENTUDES.pdf" }
    ];

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

      const btnDescargar = document.createElement("button");
      btnDescargar.type = "button";
      btnDescargar.textContent = "⬇️ Descargar";
      btnDescargar.className = "vb-chip";
      btnDescargar.addEventListener("click", () => {
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

  function searchKeyword(keywordRaw) {
    const original = (keywordRaw || "").trim();
    const cleaned = limpiarConsultaParaProyectos(original);
    STATE.lastKeyword = cleaned || "";
    STATE.lastUserText = original || "";

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

  const LEGI_URL = "https://legislaturalarioja.gob.ar/legisladores.html";
  const LEGI_URL_READER = "https://r.jina.ai/https://legislaturalarioja.gob.ar/legisladores.html";

  function normalizarBloque(raw) {
    if (!raw) return "";
    return raw
      .replace(/\*+/g, "") // ✅ saca ****
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

  function limpiarBasuraDeLinks(s) {
    if (!s) return "";
    let t = String(s);

    t = t.replace(/\]\(\s*https?:\/\/[^\s)]+\s*\)/gi, " ");
    t = t.replace(/https?:\/\/\S+/gi, " ");
    t = t.replace(/\bimagenes\/\S+/gi, " ");
    t = t.replace(/\b\w+\.(png|jpg|jpeg|gif|webp)\b/gi, " ");
    t = t.replace(/[\[\]]/g, " ");
    t = t.replace(/\s{2,}/g, " ").trim();

    return t;
  }

  function pareceNombreHumano(s) {
    if (!s) return false;
    const t = s.trim();
    if (t.length < 6) return false;
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/.test(t);
  }

  // ✅ Heurística: si el nombre está repetido (ej: "DIEGO MOLINA ... DIEGO MOLINA ...")
  // recorta desde la 2da aparición del inicio.
  function dedupeNombre(nombre) {
    const words = (nombre || "").trim().split(/\s+/).filter(Boolean);
    if (words.length < 4) return (nombre || "").trim();

    // buscamos otra ocurrencia del comienzo (dos palabras) más adelante
    const w0 = (words[0] || "").toLowerCase();
    const w1 = (words[1] || "").toLowerCase();

    for (let i = 2; i < words.length - 1; i++) {
      if (words[i].toLowerCase() === w0 && words[i + 1].toLowerCase() === w1) {
        // si recortar deja algo razonable, lo hacemos
        const sliced = words.slice(i).join(" ").trim();
        if (sliced.length >= 6) return sliced;
      }
    }
    return words.join(" ").trim();
  }

  function parsearLegisladoresDesdeTexto(texto) {
    const out = [];
    const re =
      /Dip\.\s*([^\n]+)\n[\s\S]*?Partido Político\n\s*([^\n]+)\n[\s\S]*?Mandato\n\s*([0-9]{4}\s*-\s*[0-9]{4})\n[\s\S]*?Bloque Político\n\s*([^\n]+)/g;

    let m;
    while ((m = re.exec(texto)) !== null) {
      const chunkRaw = m[0];
      const chunk = limpiarBasuraDeLinks(chunkRaw);

      const nombreCorto = limpiarBasuraDeLinks((m[1] || "").trim());
      const partido = limpiarBasuraDeLinks((m[2] || "").trim());
      const mandato = limpiarBasuraDeLinks((m[3] || "").trim());
      const bloque = normalizarBloque(limpiarBasuraDeLinks((m[4] || "").trim()));

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

      if (!pareceNombreHumano(nombre)) nombre = nombreCorto;

      nombre = dedupeNombre(limpiarBasuraDeLinks(nombre).replace(/\s{2,}/g, " ").trim());

      out.push({ nombre, partido, mandato, bloque });
    }

    // dedupe por nombre
    const seen = new Set();
    const final = [];
    for (const l of out) {
      const key = (l.nombre || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        final.push(l);
      }
    }

    return final;
  }

  // ✅ Render HTML profesional (tarjetas)
  function escapeHTML(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function buildLegisladoresHTML(legisladores) {
    const porBloque = {};
    for (const l of legisladores) {
      const b = (l.bloque && l.bloque.trim()) ? l.bloque.trim() : "Sin bloque informado";
      (porBloque[b] ||= []).push(l);
    }

    const bloques = Object.keys(porBloque).sort((a, b) => a.localeCompare(b, "es"));
    bloques.forEach((b) => porBloque[b].sort((x, y) => (x.nombre || "").localeCompare(y.nombre || "", "es")));

    // estilos inline para que quede prolijo sin tocar tu CSS
    const wrapStyle = "font-size:13px; line-height:1.35;";
    const bloqueStyle = "margin:10px 0 14px; padding:10px; border-radius:12px; background:rgba(1,152,164,.06); border:1px solid rgba(2,6,23,.08);";
    const tituloStyle = "font-weight:800; font-size:13.5px; color:var(--vb-primary,#0198A4); padding:0 0 8px; margin:0 0 8px; border-bottom:1px solid rgba(2,6,23,.10);";
    const cardStyle = "background:#fff; border:1px solid rgba(2,6,23,.10); border-radius:12px; padding:10px 10px; margin:8px 0; box-shadow:0 8px 18px rgba(2,6,23,.06);";
    const nameStyle = "font-weight:800; font-size:13px; margin:0 0 6px; color:#0f172a;";
    const metaStyle = "font-size:12px; color:#475569; margin:2px 0;";

    let html = `<div style="${wrapStyle}">`;
    html += `<div style="font-weight:900; font-size:14px; margin-bottom:6px;">👥 Quiénes integran la Legislatura</div>`;
    html += `<div style="color:#64748b; font-size:12px; margin-bottom:10px;">Listado oficial agrupado por bloques políticos.</div>`;

    for (const b of bloques) {
      html += `<div style="${bloqueStyle}">`;
      html += `<div style="${tituloStyle}">${escapeHTML(b)}</div>`;

      for (const l of porBloque[b]) {
        html += `<div style="${cardStyle}">`;
        html += `<div style="${nameStyle}">${escapeHTML(l.nombre)}</div>`;
        if (l.partido) html += `<div style="${metaStyle}"><strong>Partido:</strong> ${escapeHTML(l.partido)}</div>`;
        if (l.mandato) html += `<div style="${metaStyle}"><strong>Mandato:</strong> ${escapeHTML(l.mandato)}</div>`;
        html += `</div>`;
      }

      html += `</div>`;
    }

    html += `<div style="margin-top:10px; font-size:12px; color:#64748b;">
      <div><strong>Fuente oficial:</strong> <a href="${escapeHTML(LEGI_URL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(LEGI_URL)}</a></div>
      <div style="margin-top:4px;">.</div>
    </div>`;

    html += `</div>`;
    return html;
  }

  async function buildLegisladoresPayload() {
    try {
      const res = await fetch(LEGI_URL_READER, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const textoPlano = await res.text();

      const legisladores = parsearLegisladoresDesdeTexto(textoPlano);

      if (!legisladores.length) {
        return {
          ok: false,
          html: `<div style="font-size:13px;line-height:1.35;">
            <div style="font-weight:900;font-size:14px;margin-bottom:6px;">👥 Quiénes la integran</div>
            <div style="color:#64748b;margin-bottom:10px;">No pude leer el listado automáticamente en este momento.</div>
            <div style="font-size:12px;color:#64748b;"><strong>Fuente oficial:</strong> <a href="${escapeHTML(LEGI_URL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(LEGI_URL)}</a></div>
          </div>`
        };
      }

      return { ok: true, html: buildLegisladoresHTML(legisladores) };
    } catch (e) {
      return {
        ok: false,
        html: `<div style="font-size:13px;line-height:1.35;">
          <div style="font-weight:900;font-size:14px;margin-bottom:6px;">👥 Quiénes la integran</div>
          <div style="color:#64748b;margin-bottom:10px;">No se pudo cargar el listado en este momento.</div>
          <div style="font-size:12px;color:#64748b;"><strong>Fuente oficial:</strong> <a href="${escapeHTML(LEGI_URL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(LEGI_URL)}</a></div>
        </div>`
      };
    }
  }

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
          const payload = await buildLegisladoresPayload();
          pushMsg(payload.html, "bot", { html: true });
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
          pushMsg(
            STATE.subscribedWeekly
              ? "Listo ✅ te dejo activadas las novedades semanales."
              : "Hecho ✅ desactivé las novedades semanales."
          );
          option4();
        },
        _divider: "Novedades"
      },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  // ======================
  // Opción 5 - Contactar equipo
  // ======================
function option5() {
  pushMsg("📞 Para contactar al equipo, podés elegir una opción:");

  setQuickButtons([
    {
      label: "✉️ Email institucional",
      onClick: () =>
        openMailDirect({
          to: "equipo.lourdesortiz@gmail.com",
          subject: "Contacto desde Vicuñita",
          body: "Hola equipo, les escribo por lo siguiente:\n\n",
        }),
      _divider: "Email institucional",
    },
    {
      label: "🤝 Contactar con el equipo",
      onClick: () => option5_ContactFormInChat(),
      _divider: "Contacto",
    },
    {
      label: "🙋 Participar en actividades",
      onClick: () => option5_ActivitiesFormInChat(),
      _divider: "Actividades",
    },
    { label: "🏠 Menú", onClick: backToMenu, _isMenu: true },
  ]);
}

function buildMailtoLink({ to, subject = "", body = "" }) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `mailto:${to}?${params.toString()}`;
}

function openMailDirect({ to, subject = "", body = "" }) {
  try {
    const mailto = buildMailtoLink({ to, subject, body });

    const link = document.createElement("a");
    link.href = mailto;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      try {
        window.location.href = mailto;
      } catch (err) {
        console.warn("No se pudo redirigir con mailto:", err);
      }
    }, 150);

    return true;
  } catch (error) {
    console.warn("Error al abrir mailto:", error);
    pushMsg("⚠️ No se pudo abrir tu aplicación de correo automáticamente.");
    return false;
  }
}

function getChatMessagesContainerSmart() {
  return document.getElementById("vbBody");
}

function getCurrentDateTimeMeta() {
  const now = new Date();

  const fecha = now.toLocaleDateString("es-AR");
  const hora = now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return { fecha, hora };
}

function getContactContextMeta() {
  const { fecha, hora } = getCurrentDateTimeMeta();

  return {
    fecha,
    hora,
    pagina: window.location.href,
    paginaNombre:
      (typeof STATE !== "undefined" && STATE.lastPage)
        ? STATE.lastPage
        : (window.location.pathname.split("/").pop() || "index.html"),
    palabraClave:
      (typeof STATE !== "undefined" && STATE.lastKeyword)
        ? STATE.lastKeyword
        : "",
    textoBuscado:
      (typeof STATE !== "undefined" && STATE.lastUserText)
        ? STATE.lastUserText
        : ""
  };
}

async function saveContactToFirebase(payload) {
  try {
    if (
      !window.firebaseDB ||
      !window.firebaseFns ||
      typeof window.firebaseFns.addDoc !== "function" ||
      typeof window.firebaseFns.collection !== "function"
    ) {
      console.warn("Firebase no disponible para guardar contactos.");
      return { ok: false, reason: "firebase-no-disponible" };
    }

    const { addDoc, collection, serverTimestamp } = window.firebaseFns;

    await addDoc(collection(window.firebaseDB, "contactos_vicunita"), {
      ...payload,
      createdAt: typeof serverTimestamp === "function" ? serverTimestamp() : new Date(),
      source: "vicuñita-bot",
      estado: "nuevo"
    });

    return { ok: true };
  } catch (error) {
    console.warn("Error Firebase:", error);
    return { ok: false, reason: "firebase-error" };
  }
}

async function saveActivityToFirebase(payload) {
  try {
    if (
      !window.firebaseDB ||
      !window.firebaseFns ||
      typeof window.firebaseFns.addDoc !== "function" ||
      typeof window.firebaseFns.collection !== "function"
    ) {
      console.warn("Firebase no disponible para guardar actividades.");
      return { ok: false, reason: "firebase-no-disponible" };
    }

    const { addDoc, collection, serverTimestamp } = window.firebaseFns;

    await addDoc(collection(window.firebaseDB, "participacion_actividades_vicunita"), {
      ...payload,
      createdAt: typeof serverTimestamp === "function" ? serverTimestamp() : new Date(),
      source: "vicuñita-bot",
      estado: "nuevo"
    });

    return { ok: true };
  } catch (error) {
    console.warn("Error Firebase:", error);
    return { ok: false, reason: "firebase-error" };
  }
}

function option5_ContactFormInChat(retries = 10) {
  const container = getChatMessagesContainerSmart();

  if (!container) {
    if (retries > 0) {
      return setTimeout(() => option5_ContactFormInChat(retries - 1), 120);
    }
    return;
  }

  const old = document.getElementById("formContactoEquipoEnChat");
  if (old) old.remove();

  const bubble = document.createElement("div");
  bubble.id = "formContactoEquipoEnChat";
  bubble.className = "vb-msg vb-bot actividad-bubble";

  bubble.innerHTML = `
    <div class="actividad-card">
      <div class="actividad-title">🤝 Contactar con el equipo</div>

      <form class="form-actividades-chat" autocomplete="on">
        <label>Nombre y apellido *</label>
        <input type="text" name="nombre" placeholder="Ej: Brenda Pryjmaczuk" required />

        <label>Número de teléfono</label>
        <input type="tel" name="telefono" placeholder="Ej: 3804..." />

        <label>Email *</label>
        <input type="email" name="email" placeholder="Ej: nombre@gmail.com" required />

        <label>Motivo del contacto *</label>
        <textarea name="motivo" rows="4" placeholder="Ej: Quiero comunicarme con el equipo por..." required></textarea>

        <div class="form-actions">
          <button type="submit" class="btn-enviar-form">Enviar</button>
          <button type="button" class="btn-cancelar-form">Cancelar</button>
        </div>

        <small class="help">Al enviar, se guardará el contacto y se abrirá tu correo con el mensaje ya armado.</small>
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nombre = (data.get("nombre") || "").toString().trim();
    const telefono = (data.get("telefono") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const motivo = (data.get("motivo") || "").toString().trim();

    if (!nombre || !email || !motivo) return;

    const meta = getContactContextMeta();

    const payload = {
      tipo: "contacto_equipo",
      nombre,
      telefono: telefono || "",
      email,
      motivo,
      fechaTexto: meta.fecha,
      horaTexto: meta.hora,
      pagina: meta.pagina,
      paginaNombre: meta.paginaNombre,
      palabraClave: meta.palabraClave,
      textoBuscado: meta.textoBuscado
    };

    const subject = "Contacto desde Vicuñita";
    const body =
`Hola equipo,
Quiero contactarme con ustedes. Mis datos son:

• Nombre y apellido: ${nombre}
• Teléfono: ${telefono || "No informado"}
• Email: ${email}
• Motivo del contacto: ${motivo}

Datos automáticos del sistema:
• Fecha: ${meta.fecha}
• Hora: ${meta.hora}
• Página: ${meta.paginaNombre}
• URL: ${meta.pagina}
• Palabra clave buscada: ${meta.palabraClave || "No informada"}
• Último texto escrito: ${meta.textoBuscado || "No informado"}

¡Gracias!`;

    bubble.remove();

    openMailDirect({
      to: "equipo.lourdesortiz@gmail.com",
      subject,
      body
    });

    const result = await saveContactToFirebase(payload);

    if (result.ok) {
      pushMsg("✅ Tus datos fueron registrados correctamente.");
    } else {
      pushMsg("⚠️ No se pudo guardar en la base de datos, pero el correo igualmente fue preparado.");
    }
  });
}

function option5_ActivitiesFormInChat(retries = 10) {
  const container = getChatMessagesContainerSmart();

  if (!container) {
    if (retries > 0) return setTimeout(() => option5_ActivitiesFormInChat(retries - 1), 120);
    return;
  }

  const old = document.getElementById("formActividadesEnChat");
  if (old) old.remove();

  const bubble = document.createElement("div");
  bubble.id = "formActividadesEnChat";
  bubble.className = "vb-msg vb-bot actividad-bubble";

  bubble.innerHTML = `
    <div class="actividad-card">
      <div class="actividad-title">🙋 Participar en actividades</div>

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

        <small class="help">Al enviar, se guardará la solicitud y se abrirá tu correo con el mensaje ya armado.</small>
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nombre = (data.get("nombre") || "").toString().trim();
    const telefono = (data.get("telefono") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const actividades = (data.get("actividades") || "").toString().trim();
    const disponibilidad = (data.get("disponibilidad") || "").toString().trim();

    if (!nombre || !telefono || !email || !actividades || !disponibilidad) return;

    const meta = getContactContextMeta();

    const payload = {
      tipo: "participacion_actividades",
      nombre,
      telefono,
      email,
      actividades,
      disponibilidad,
      fechaTexto: meta.fecha,
      horaTexto: meta.hora,
      pagina: meta.pagina,
      paginaNombre: meta.paginaNombre,
      palabraClave: meta.palabraClave,
      textoBuscado: meta.textoBuscado
    };

    const subject = "Participación en actividades (Vicuñita)";
    const body =
`Hola equipo,
Quiero participar en actividades. Mis datos son:

• Nombre y apellido: ${nombre}
• Teléfono: ${telefono}
• Email: ${email}
• Actividades de interés: ${actividades}
• Disponibilidad horaria: ${disponibilidad}

Datos automáticos del sistema:
• Fecha: ${meta.fecha}
• Hora: ${meta.hora}
• Página: ${meta.paginaNombre}
• URL: ${meta.pagina}
• Palabra clave buscada: ${meta.palabraClave || "No informada"}
• Último texto escrito: ${meta.textoBuscado || "No informado"}

¡Gracias!`;

    bubble.remove();

    openMailDirect({
      to: "equipo.lourdesortiz@gmail.com",
      subject,
      body
    });

    const result = await saveActivityToFirebase(payload);

    if (result.ok) {
      pushMsg("✅ Tu solicitud fue registrada correctamente.");
    } else {
      pushMsg("⚠️ No se pudo guardar en la base de datos, pero el correo igualmente fue preparado.");
    }
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

  function showEmergencias() {
    pushMsg("🚨 EMERGENCIAS GENERALES");
    pushMsg("📞 911 – Emergencias generales");
    pushMsg("🚑 107 – Emergencias médicas / Ambulancia");
    setQuickButtons([
      { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function showMujer() {
    pushMsg("👩 MUJER Y DIVERSIDAD");
    pushMsg("📞 3804 640054 (Llamadas y WhatsApp)");
    pushMsg("Asistencia ante violencia por razón de género. Orientación social, psicológica y legal.");
    setQuickButtons([
      { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function showNinez() {
    pushMsg("👶 NIÑEZ Y ADOLESCENCIA");
    pushMsg("📞 Línea 102 – Denuncias o vulneración de derechos de niñas, niños y adolescentes.");
    pushMsg("📞 Dirección Gral. Niñez, Adolescencia y Familia: 3804 468448");
    setQuickButtons([
      { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function showSocial() {
    pushMsg("🏛 ASISTENCIA SOCIAL");
    pushMsg("📞 3804 155135 – Ministerio de Desarrollo, Igualdad e Integración Social");
    setQuickButtons([
      { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

  function showEmergenciaLocal() {
    pushMsg("🚒 DEFENSA CIVIL Y BOMBEROS");
    pushMsg("📞 Defensa Civil: 4426402");
    pushMsg("📞 Bomberos: 4453547");
    setQuickButtons([
      { label: "⬅️ Volver", onClick: option6, _divider: "Categorías" },
      { label: "🏠 Menú", onClick: backToMenu, _isMenu: true }
    ]);
  }

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

    STATE.lastUserText = text;
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
    hideTooltip();
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
  // Tooltip listeners
  // ======================
  if (elTooltip) {
    elTooltip.addEventListener("click", openPanel);

    window.addEventListener("resize", () => {
      if (elTooltip.classList.contains("vb-show")) positionTooltip();
    });

    window.addEventListener(
      "scroll",
      () => {
        if (elTooltip.classList.contains("vb-show")) positionTooltip();
      },
      { passive: true }
    );
  }

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

    // ✅ Forzamos que la burbuja se vea SIEMPRE en esta versión
    if (elTooltip) {
      elTooltip.classList.add("vb-show");
      positionTooltip();
      requestAnimationFrame(positionTooltip);
      setTimeout(positionTooltip, 80);
      setTimeout(() => elTooltip.classList.remove("vb-show"), 6500);
    }
  }

  init();
})();