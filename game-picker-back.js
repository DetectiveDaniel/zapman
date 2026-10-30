(function addGamePickerBackButton() {
  const sharedScriptUrl = document.currentScript?.src || "../../game-picker-back.js";
  const pickerUrl = new URL("index.html", sharedScriptUrl).href;
  const rootPage = new URL(".", window.location.href).href === new URL(".", sharedScriptUrl).href;
  const faviconUrl = new URL("favicon.png", sharedScriptUrl).href;
  let favicon = document.querySelector('link[rel~="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    document.head.append(favicon);
  }
  favicon.href = faviconUrl;

  const mobileModeKey = "zapman-mobile-mode";
  const pageUrl = new URL(window.location.href);
  let storedMobileMode = false;
  try {
    storedMobileMode = localStorage.getItem(mobileModeKey) === "true";
  } catch {
    // URL mode still works when storage is unavailable.
  }
  const mobileMode = pageUrl.searchParams.get("mobile") === "1" || storedMobileMode;
  const withMobileMode = (url) => {
    const target = new URL(window.ZapmanDisplay ? window.ZapmanDisplay.withSettings(url) : url, window.location.href);
    if (mobileMode) target.searchParams.set("mobile", "1");
    return target.href;
  };

  if (mobileMode && !rootPage) {
    try {
      localStorage.setItem(mobileModeKey, "true");
    } catch {
      // Mobile Mode remains active for this page through its URL.
    }
    document.documentElement.classList.add("zapman-mobile-game");
    const mobileStyle = document.createElement("style");
    mobileStyle.textContent = `
      html.zapman-mobile-game {
        display: grid !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        place-items: center !important;
        overflow: hidden !important;
        background: repeating-linear-gradient(135deg, #ffd817 0, #ffd817 32px, #ff8a1f 32px, #ff8a1f 64px) !important;
      }
      html.zapman-mobile-game body {
        position: relative !important;
        width: min(430px, 100vw) !important;
        height: min(860px, 100dvh) !important;
        min-height: 0 !important;
        max-height: 100dvh !important;
        margin: 0 !important;
        padding-top: 64px !important;
        overflow: auto !important;
        border: 6px solid #050505 !important;
        border-radius: 16px !important;
        box-shadow: 0 22px 70px rgba(0, 0, 0, .58) !important;
        box-sizing: border-box !important;
        contain: paint !important;
        transform: translateZ(0);
      }
      html.zapman-mobile-game body > * {
        max-width: 100% !important;
      }
      html.zapman-mobile-game canvas,
      html.zapman-mobile-game img,
      html.zapman-mobile-game video {
        max-width: 100% !important;
      }
      html.zapman-mobile-game [data-zapman-mobile-toggle] {
        position: fixed;
        right: 10px;
        top: 10px;
        z-index: 99999;
        min-height: 42px;
        padding: 8px 11px;
        border: 3px solid #050505;
        border-radius: 0;
        background: #ff8a1f;
        color: #050505;
        box-shadow: 4px 4px 0 rgba(0, 0, 0, .32);
        font: 900 13px "Courier New", monospace;
        text-transform: uppercase;
        cursor: pointer;
      }
      @media (max-width: 430px) {
        html.zapman-mobile-game body {
          border: 0 !important;
          border-radius: 0 !important;
        }
      }
    `;
    document.head.append(mobileStyle);

    const modeButton = document.createElement("button");
    modeButton.type = "button";
    modeButton.textContent = "Mobile Mode Off";
    modeButton.setAttribute("data-zapman-mobile-toggle", "true");
    modeButton.addEventListener("click", () => {
      try {
        localStorage.setItem(mobileModeKey, "false");
      } catch {
        // Reloading without the URL flag still leaves this page's mode.
      }
      pageUrl.searchParams.delete("mobile");
      window.location.href = pageUrl.href;
    });
    document.body.append(modeButton);
  }

  const existing = document.querySelector("[data-game-picker-back]");
  const button = existing || document.createElement("a");
  button.href = withMobileMode(pickerUrl);
  button.hidden = false;
  button.textContent = "GO BACK";
  button.setAttribute("data-game-picker-back", "true");
  button.setAttribute("aria-label", "Go back to the game picker");
  const backStyle = document.createElement("style");
  backStyle.textContent = `
    [data-game-picker-back] {
      position: fixed !important; inset: auto !important;
      top: 0 !important; left: 0 !important; z-index: 2147483647 !important;
      display: inline-grid !important; place-items: center !important;
      box-sizing: border-box !important; width: 92px !important; min-height: 44px !important;
      margin: 0 !important; padding: 10px 8px !important;
      border: 2px solid #000 !important; border-radius: 0 !important;
      background: #fff06a !important; color: #000 !important;
      box-shadow: none !important; text-decoration: none !important;
      text-transform: uppercase !important; font: bold 12px 'Times New Roman', serif;
      letter-spacing: 0 !important; line-height: 1 !important; cursor: pointer;
    }
    [data-game-picker-back]:focus-visible { outline: 3px solid #000; outline-offset: 2px; }
    body.picker-active > [data-game-picker-back] { display: none !important; }
  `;
  document.head.append(backStyle);

  button.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  if (pageUrl.searchParams.get("browny") === "1" && window.parent !== window) {
    button.setAttribute("aria-label", "Go back to Browny City");
    button.addEventListener("click", event => {
      event.preventDefault();
      window.parent.postMessage({ type: "browny-race-exit" }, "*");
    });
  }

  // Move existing links out of transformed game panels so they share the corner.
  document.body.append(button);
  const arrows = document.createElement('script');
  arrows.src = new URL('mobile-controls.js', sharedScriptUrl).href;
  document.body.append(arrows);
}());
