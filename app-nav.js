(() => {
  "use strict";

  const config = window.COWAY_UI_CONFIG || {};
  const routes = config.routes || {};
  const copy = config.copy || {};
  const page = document.body.dataset.appPage || pageFromPath();
  const homeUrl = route("home", "main.html");

  function route(key, fallback) {
    const value = routes[key];
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function pageFromPath() {
    const filename = window.location.pathname.split("/").pop().toLowerCase();
    if (filename === "calc.html") return "products";
    if (filename === "benefit.html") return "benefits";
    if (filename === "weather.html") return "report";
    if (filename === "gallery.html") return "gallery";
    return "home";
  }

  function icon(name) {
    const element = document.createElement("span");
    element.className = "material-symbols-rounded";
    element.setAttribute("aria-hidden", "true");
    element.textContent = name;
    return element;
  }

  function navItem({ label, iconName, href, active, routeKey }) {
    const item = document.createElement("a");
    item.className = `dock-item${active ? " active" : ""}`;
    item.href = href;
    item.dataset.route = routeKey;
    if (active) item.setAttribute("aria-current", "page");
    item.append(icon(iconName), document.createTextNode(label));
    return item;
  }

  function createDock() {
    const wrap = document.createElement("div");
    wrap.className = "bottom-dock-wrap";

    const nav = document.createElement("nav");
    nav.className = "bottom-dock";
    nav.setAttribute("aria-label", "주요 메뉴");

    nav.append(
      navItem({ label: "홈", iconName: "home", href: homeUrl, active: page === "home", routeKey: "home" }),
      navItem({ label: copy.productMenu || "제품", iconName: "shopping_bag", href: route("products", "calc.html"), active: page === "products", routeKey: "products" }),
      navItem({ label: copy.benefitMenu || "혜택", iconName: "sell", href: route("benefits", "benefit.html"), active: page === "benefits", routeKey: "benefits" })
    );

    const toolButton = document.createElement("button");
    const toolActive = page === "report" || page === "gallery";
    toolButton.id = "toolMenuButton";
    toolButton.type = "button";
    toolButton.className = `dock-item${toolActive ? " active" : ""}`;
    toolButton.setAttribute("aria-haspopup", "dialog");
    toolButton.setAttribute("aria-controls", "toolSheet");
    toolButton.setAttribute("aria-expanded", "false");
    if (toolActive) toolButton.setAttribute("aria-current", "page");
    toolButton.append(icon("grid_view"), document.createTextNode(copy.toolsMenu || "도구"));
    nav.appendChild(toolButton);
    wrap.appendChild(nav);
    document.body.appendChild(wrap);
    return toolButton;
  }

  function toolData() {
    const primary = [
      {
        key: "report",
        label: copy.reportTitle || "안심 리포트",
        description: copy.reportDescription || "미세먼지와 실내 습도",
        icon: "air",
        url: route("report", "weather.html")
      },
      {
        key: "gallery",
        label: copy.galleryTitle || "갤러리",
        description: copy.galleryDescription || "제품과 설치 사례",
        icon: "photo_library",
        url: route("gallery", "gallery.html")
      }
    ];

    const extras = Array.isArray(config.tools)
      ? config.tools.map((tool) => ({ ...tool, key: "external" }))
      : [];
    return [...primary, ...extras];
  }

  function safeExternalUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const url = value.trim();
    if (/^(javascript:|data:|vbscript:)/i.test(url)) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
    if (/^[./]|^[\w-]+\.html(?:[?#].*)?$/i.test(url)) return url;
    return "";
  }

  function createToolItem(tool) {
    const url = safeExternalUrl(tool.url);
    const enabled = Boolean(url);
    const item = document.createElement(enabled ? "a" : "div");
    item.className = `tool-item${enabled ? "" : " disabled"}${tool.key === page ? " current" : ""}`;

    if (enabled) {
      item.href = url;
      if (/^https?:/i.test(url)) {
        item.target = "_blank";
        item.rel = "noopener noreferrer";
      }
      if (tool.key === page) item.setAttribute("aria-current", "page");
    }

    const iconWrap = document.createElement("span");
    iconWrap.className = "tool-item-icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(icon(tool.icon || "link"));

    const itemCopy = document.createElement("span");
    itemCopy.className = "tool-item-copy";

    const title = document.createElement("span");
    title.className = "tool-item-title";
    title.textContent = tool.label || "바로가기";

    const description = document.createElement("span");
    description.className = "tool-item-description";
    description.textContent = tool.description || "";

    itemCopy.append(title, description);
    item.append(iconWrap, itemCopy);

    if (!enabled) {
      const badge = document.createElement("span");
      badge.className = "tool-badge";
      badge.textContent = copy.disconnected || "연결 전";
      item.appendChild(badge);
    }
    return item;
  }

  function createSheet() {
    const overlay = document.createElement("div");
    overlay.id = "sheetOverlay";
    overlay.className = "sheet-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const sheet = document.createElement("section");
    sheet.id = "toolSheet";
    sheet.className = "tool-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "toolSheetTitle");
    sheet.tabIndex = -1;

    const handle = document.createElement("div");
    handle.className = "sheet-handle";
    handle.setAttribute("aria-hidden", "true");

    const header = document.createElement("header");
    header.className = "sheet-header";

    const title = document.createElement("h2");
    title.id = "toolSheetTitle";
    title.className = "sheet-title";
    title.textContent = copy.toolSheetTitle || "업무 도구";

    const description = document.createElement("p");
    description.className = "sheet-description";
    description.textContent = copy.toolSheetDescription || "상담 중 자주 쓰는 화면을 모았어요.";

    const closeButton = document.createElement("button");
    closeButton.id = "toolSheetClose";
    closeButton.className = "sheet-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "도구 메뉴 닫기");
    closeButton.appendChild(icon("close"));

    header.append(title, description, closeButton);

    const list = document.createElement("div");
    list.className = "tool-list";
    toolData().forEach((tool) => list.appendChild(createToolItem(tool)));

    sheet.append(handle, header, list);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    return { overlay, sheet, closeButton };
  }

  function bindBackButtons() {
    document.querySelectorAll(".back-btn").forEach((button) => {
      button.href = homeUrl;
      button.setAttribute("aria-label", "이전 화면으로 돌아가기");
      button.replaceChildren(icon("arrow_back"));
      button.addEventListener("click", (event) => {
        let sameSitePreviousPage = false;
        try {
          const previous = new URL(document.referrer);
          sameSitePreviousPage = previous.origin === window.location.origin && previous.pathname !== window.location.pathname;
        } catch (error) {
          sameSitePreviousPage = false;
        }
        if (sameSitePreviousPage && window.history.length > 1) {
          event.preventDefault();
          window.history.back();
        }
      });
    });
  }

  if (document.getElementById("toolMenuButton") || document.getElementById("sheetOverlay")) return;

  bindBackButtons();
  const menuButton = createDock();
  const { overlay, sheet, closeButton } = createSheet();
  let touchStartY = 0;

  function openSheet() {
    document.body.classList.add("sheet-open");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    window.setTimeout(() => sheet.focus(), 40);
  }

  function closeSheet({ restoreFocus = true } = {}) {
    if (!overlay.classList.contains("open")) return;
    document.body.classList.remove("sheet-open");
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) menuButton.focus();
  }

  menuButton.addEventListener("click", openSheet);
  closeButton.addEventListener("click", () => closeSheet());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeSheet();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });
  sheet.addEventListener("touchstart", (event) => {
    touchStartY = sheet.scrollTop === 0 ? event.changedTouches[0].clientY : 0;
  }, { passive: true });
  sheet.addEventListener("touchend", (event) => {
    if (touchStartY && event.changedTouches[0].clientY - touchStartY > 80) closeSheet();
    touchStartY = 0;
  }, { passive: true });
})();
