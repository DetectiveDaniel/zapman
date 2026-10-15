(() => {
  "use strict";
  if (window.ZapmanDisplay) return;
  const scriptUrl = document.currentScript.src;
  const storageKey = "zapman-display-settings";
  const palettes = [
    ["Classic", "#ffd817"], ["Neon rose", "#ff0054"], ["Hot pink", "#ff00ad"], ["Electric pink", "#f965ff"],
    ["Violet", "#9600ff"], ["Electric blue", "#4000ff"], ["Ice", "#aaf3f2"], ["Periwinkle", "#b4c5f2"],
    ["Lilac", "#b75af1"], ["Deep purple", "#421b70"], ["Plum", "#8c087c"], ["Neon green", "#09ec00"],
    ["Lemon", "#e9f800"], ["Orange", "#fb8900"], ["Red", "#ff0800"], ["Magenta", "#f80084"],
    ["Mint", "#39eb62"], ["Lime", "#c5ff00"], ["Cobalt", "#005eff"], ["Cyan", "#00b8c9"],
    ["Acid green", "#b2ef00"], ["Berry", "#e84283"], ["Coral", "#eb7790"], ["Peach", "#f5a39a"],
    ["Cream", "#f0d2b4"], ["Pale yellow", "#edf68b"], ["Apple", "#90f45d"], ["Leaf", "#39b754"],
    ["Teal", "#177d89"], ["Midnight blue", "#294888"], ["Ultraviolet", "#a400f0"],
  ];
  const defaults = { scheme: 0, hugeFont: false, lexieFont: false, colorBlind: false, declutter: false, plainBackground: false, animatedCountdown: true };
  const toggles = Object.keys(defaults).filter(key => key !== "scheme");
  function normalize(value) {
    const result = { ...defaults };
    if (!value || typeof value !== "object") return result;
    if (Number.isInteger(value.scheme) && value.scheme >= 0 && value.scheme < palettes.length) result.scheme = value.scheme;
    toggles.forEach(key => { if (typeof value[key] === "boolean") result[key] = value[key]; });
    return result;
  }
  function decode(value) {
    if (!/^\d{1,2}\.[01]{6}$/.test(value || "")) return null;
    const [scheme, flags] = value.split(".");
    return normalize(Object.fromEntries([["scheme", Number(scheme)], ...toggles.map((key, i) => [key, flags[i] === "1"])]));
  }
  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Defaults work without storage. */ }
  let settings = decode(new URL(location.href).searchParams.get("display")) || normalize(saved);
  try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* File URLs still carry the settings. */ }
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet"; stylesheet.href = new URL("display-settings.css", scriptUrl).href; document.head.append(stylesheet);
  let filterReady = false;
  function installMonochromeFilter() {
    if (filterReady) return;
    // Keep the filter in this document: local-file browsers can reject external SVG filters.
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "zapman-display-filters";
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
    svg.innerHTML = `<defs><filter id="zapman-black-white" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncR type="discrete" tableValues="0 1"/><feFuncG type="discrete" tableValues="0 1"/><feFuncB type="discrete" tableValues="0 1"/></feComponentTransfer>
    </filter></defs>`;
    document.body.append(svg);
    filterReady = true; document.documentElement.classList.add("zapman-filter-ready");
  }
  function apply() {
    const root = document.documentElement;
    const classNames = { hugeFont: "zapman-huge-font", lexieFont: "zapman-lexie-font", colorBlind: "zapman-monochrome", declutter: "zapman-declutter", plainBackground: "zapman-plain-background" };
    Object.entries(classNames).forEach(([key, name]) => root.classList.toggle(name, settings[key]));
    const color = palettes[settings.scheme][1];
    const rgb = color.slice(1).match(/../g).map(channel => parseInt(channel, 16));
    const dark = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114 < 135;
    const tint = rgb.map(channel => Math.round(channel + (255 - channel) * (dark ? .65 : .3))).map(channel => channel.toString(16).padStart(2, "0")).join("");
    root.style.setProperty("--zapman-picker-bg", color);
    root.style.setProperty("--zapman-picker-ink", "#000000");
    root.style.setProperty("--zapman-picker-accent", settings.scheme === 0 ? "#ff7a1a" : `#${tint}`);
    root.style.setProperty("--zapman-picker-accent-ink", "#000000");
    // An absolute same-document reference works even though the CSS lives in another file.
    root.style.setProperty("--zapman-monochrome-filter", `url("${new URL("#zapman-black-white", location.href).href}")`);
  }
  function encode() { return `${settings.scheme}.${toggles.map(key => Number(settings[key])).join("")}`; }
  function updateUrl() {
    const url = new URL(location.href); url.searchParams.set("display", encode());
    try { history.replaceState({}, "", url.href); } catch { /* Some local-file browsers restrict history. */ }
  }
  function withSettings(href) {
    const url = new URL(href, location.href); url.searchParams.set("display", encode()); return url.href;
  }
  function notify() { apply(); window.dispatchEvent(new CustomEvent("zapman-display-change", { detail: { ...settings } })); }
  window.ZapmanDisplay = {
    palettes, get: () => ({ ...settings }),
    set(key, value) {
      settings = normalize({ ...settings, [key]: value });
      try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* URL propagation still preserves settings across games. */ }
      updateUrl();
      notify();
    },
    withSettings,
  };
  window.addEventListener("storage", event => {
    if (event.key !== storageKey) return;
    try { settings = normalize(JSON.parse(event.newValue)); } catch { settings = { ...defaults }; }
    updateUrl();
    notify();
  });
  // Preserve settings through existing in-game navigation and Cat Rescue version links.
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.protocol === location.protocol && url.host === location.host && url.pathname.endsWith(".html")) link.href = withSettings(url.href);
  }, true);
  apply();
  if (document.body) installMonochromeFilter();
  else document.addEventListener("DOMContentLoaded", installMonochromeFilter, { once: true });
})();
