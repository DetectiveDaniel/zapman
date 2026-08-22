(function addGamePickerBackButton() {
  const pickerUrl = "../../index.html";
  const existing = document.querySelector("[data-game-picker-back]");
  if (existing) {
    return;
  }

  const button = document.createElement("a");
  button.href = pickerUrl;
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
