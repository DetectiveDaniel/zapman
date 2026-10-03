(() => {
  const marker = "/games/cat-rescue/";
  const markerIndex = window.location.href.indexOf(marker);
  if (markerIndex === -1 || document.querySelector(".cat-version-nav")) {
    return;
  }

  const baseUrl = window.location.href.slice(0, markerIndex + marker.length);
  const versions = [
    { id: "three-level", label: "Three-Level", path: "index.html" },
    { id: "character", label: "Character", path: "versions/character/index.html" },
    { id: "classic", label: "Classic", path: "versions/classic/index.html" },
  ];
  const current = window.location.pathname.includes("/versions/character/")
    ? "character"
    : window.location.pathname.includes("/versions/classic/")
      ? "classic"
      : "three-level";

  const nav = document.createElement("nav");
  nav.className = "cat-version-nav";
  nav.setAttribute("aria-label", "Choose Cat Rescue version");
  nav.innerHTML = `
    <strong>CAT RESCUE VERSION</strong>
    <div>
      ${versions.map((version) => `
        <a href="${baseUrl}${version.path}" ${version.id === current ? 'aria-current="page"' : ""}>
          ${version.label}
        </a>
      `).join("")}
    </div>
  `;
  document.body.prepend(nav);
})();
