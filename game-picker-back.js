(function addGamePickerBackButton() {
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
    const target = new URL(url, window.location.href);
    if (mobileMode) target.searchParams.set("mobile", "1");
    return target.href;
  };

  if (mobileMode) {
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

  const pickerUrl = "../../index.html";
  const existing = document.querySelector("[data-game-picker-back]");
  if (existing) {
    existing.href = withMobileMode(existing.getAttribute("href") || pickerUrl);
    return;
  }

  const button = document.createElement("a");
  button.href = withMobileMode(pickerUrl);
  button.textContent = "Go back";
  button.setAttribute("data-game-picker-back", "true");
  button.setAttribute("aria-label", "Go back to the game picker");
  Object.assign(button.style, {
    position: "fixed",
    left: "12px",
    top: "12px",
    zIndex: "99999",
    display: "inline-grid",
    placeItems: "center",
    minHeight: "42px",
    padding: "8px 13px",
    border: "3px solid #050505",
    background: "#fff06a",
    color: "#050505",
    boxShadow: "4px 4px 0 rgba(0, 0, 0, 0.32)",
    font: "900 15px 'Courier New', monospace",
    textDecoration: "none",
    textTransform: "uppercase",
  });

  button.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  document.body.append(button);
}());
