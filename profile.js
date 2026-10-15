(() => {
  "use strict";
  const scriptUrl = document.currentScript.src;
  const storageKey = "zapman-profile";
  const size = 320;
  const examples = [
    { id: "default", label: "Simple", src: "" },
    { id: "example-man", label: "Shirt & tie", src: new URL("assets/avatars/example-man.png", scriptUrl).href },
    { id: "example-woman", label: "Purple top", src: new URL("assets/avatars/example-woman.png", scriptUrl).href },
  ];
  const silhouette = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="#222"/><circle cx="50" cy="34" r="16" fill="var(--zapman-picker-accent, #ff7a1a)"/><path d="M24 78c0-19 10-28 26-28s26 9 26 28c-13 10-39 10-52 0Z" fill="var(--zapman-picker-accent, #ff7a1a)"/></svg>';
  const pencil = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5-12 12-7 2 2-7L16 3Zm-11 13-1 4 4-1 10-10-3-3L5 16Z" fill="currentColor"/></svg>';
  function normalize(value) {
    const result = { name: "Player", avatar: "default", drawing: "" };
    if (!value || typeof value !== "object") return result;
    if (typeof value.name === "string") result.name = value.name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 30) || "Player";
    if (typeof value.drawing === "string" && value.drawing.length <= 800000 && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.drawing)) result.drawing = value.drawing;
    if (examples.some(example => example.id === value.avatar) || (value.avatar === "drawing" && result.drawing)) result.avatar = value.avatar;
    return result;
  }
  function readProfile() {
    try { return normalize(JSON.parse(localStorage.getItem(storageKey))); } catch { return normalize(null); }
  }
  let profile = readProfile();
  let mountTarget;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("profile.css", scriptUrl).href;
  document.head.append(stylesheet);
  const dialog = document.createElement("dialog");
  dialog.id = "profileEditor";
  dialog.className = "profile-dialog";
  dialog.setAttribute("aria-labelledby", "profileTitle");
  dialog.innerHTML = `
    <form class="profile-form">
      <header class="profile-header"><h2 id="profileTitle">Your profile</h2><button type="button" data-profile-close aria-label="Close profile">×</button></header>
      <fieldset class="profile-examples"><legend>Choose an avatar</legend>${examples.map(example => `<button type="button" class="profile-example" data-profile-avatar="${example.id}" aria-pressed="false"><span class="profile-avatar">${example.src ? `<img src="${example.src}" alt="">` : silhouette}</span><span>${example.label}</span></button>`).join("")}</fieldset>
      <button type="button" class="profile-draw-choice" data-profile-avatar="drawing" aria-pressed="false">${pencil}<span>Draw your own avatar</span></button>
      <div class="profile-identity"><span id="profilePreview" class="profile-avatar profile-preview" aria-hidden="true"></span><label for="profileName">Your name<input id="profileName" name="name" maxlength="30" autocomplete="nickname" placeholder="Name goes here"></label></div>
      <section id="profileDrawing" class="profile-drawing" aria-labelledby="profileDrawingTitle" hidden>
        <h3 id="profileDrawingTitle">Draw your avatar</h3>
        <p id="profileDrawingHelp">Draw with your mouse or finger. Keep your picture inside the circle.</p>
        <div class="profile-drawing-tools"><button type="button" data-profile-tool="draw" aria-pressed="true">Draw</button><button type="button" data-profile-tool="fill" aria-pressed="false">Fill</button><label>Colour<input id="profileColour" type="color" value="#222222"></label><label>Brush size<input id="profileBrush" type="range" min="2" max="30" value="8"></label><button type="button" data-profile-undo disabled>Undo</button><button type="button" data-profile-clear>Clear</button></div>
        <canvas id="avatarCanvas" width="320" height="320" aria-describedby="profileDrawingHelp" aria-label="Draw your avatar here"></canvas>
      </section>
      <p id="profileStatus" class="profile-status" role="status" aria-live="polite"></p>
      <footer class="profile-footer"><button type="button" data-profile-close>Cancel</button><button type="submit" class="profile-save">Save profile</button></footer>
    </form>`;
  document.body.append(dialog);
  const nameInput = dialog.querySelector("#profileName");
  const preview = dialog.querySelector("#profilePreview");
  const drawingSection = dialog.querySelector("#profileDrawing");
  const canvas = dialog.querySelector("#avatarCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const colourInput = dialog.querySelector("#profileColour");
  const brushInput = dialog.querySelector("#profileBrush");
  const drawButton = dialog.querySelector('[data-profile-tool="draw"]');
  const fillButton = dialog.querySelector('[data-profile-tool="fill"]');
  const drawingHelp = dialog.querySelector("#profileDrawingHelp");
  const undoButton = dialog.querySelector("[data-profile-undo]");
  const status = dialog.querySelector("#profileStatus");
  let draft, undo = [], stroke = null, loadingDrawing = false, openSequence = 0;
  let hasDrawing = false;
  let drawingTool = "draw";
  function selectTool(tool) {
    drawingTool = tool;
    drawButton.setAttribute("aria-pressed", String(tool === "draw"));
    fillButton.setAttribute("aria-pressed", String(tool === "fill"));
    brushInput.disabled = tool === "fill";
    canvas.dataset.tool = tool;
    drawingHelp.textContent = tool === "fill"
      ? "Choose a colour, then tap an area to fill it. Undo can take it back."
      : "Draw with your mouse or finger. Keep your picture inside the circle.";
  }
  function renderAvatar(element, value) {
    const source = value.avatar === "drawing" ? value.drawing : examples.find(example => example.id === value.avatar)?.src;
    element.replaceChildren();
    if (source) {
      const image = document.createElement("img");
      image.src = source; image.alt = ""; element.append(image);
    } else element.innerHTML = silhouette;
  }
  function mount(element) {
    if (!element) return;
    mountTarget = element;
    const button = document.createElement("button");
    button.type = "button"; button.className = "picker-profile-button";
    button.setAttribute("aria-haspopup", "dialog"); button.setAttribute("aria-controls", "profileEditor");
    button.setAttribute("aria-label", `Edit profile for ${profile.name}`);
    button.innerHTML = `<span class="profile-avatar" aria-hidden="true"></span><span class="picker-profile-name"></span><span class="profile-edit-icon">${pencil}</span>`;
    button.querySelector(".picker-profile-name").textContent = profile.name;
    button.title = profile.name;
    renderAvatar(button.querySelector(".profile-avatar"), profile);
    button.addEventListener("click", openEditor);
    element.replaceChildren(button);
  }
  function updateDraftView() {
    dialog.querySelectorAll("[data-profile-avatar]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.profileAvatar === draft.avatar)));
    drawingSection.hidden = draft.avatar !== "drawing";
    renderAvatar(preview, draft);
  }
  function remember() {
    undo.push({ image: ctx.getImageData(0, 0, size, size), hasDrawing });
    if (undo.length > 20) undo.shift();
    undoButton.disabled = false;
  }
  function snapshotDrawing() {
    draft.drawing = hasDrawing ? canvas.toDataURL("image/png") : "";
    if (draft.avatar === "drawing") renderAvatar(preview, draft);
  }
  function openEditor() {
    draft = { ...profile }; nameInput.value = profile.name;
    undo = []; undoButton.disabled = true; stroke = null;
    selectTool("draw");
    status.textContent = "Your profile is saved on this device.";
    ctx.clearRect(0, 0, size, size); hasDrawing = false;
    const sequence = ++openSequence;
    loadingDrawing = Boolean(draft.drawing);
    if (draft.drawing) {
      const image = new Image();
      image.onload = () => {
        if (sequence !== openSequence || !dialog.open) return;
        ctx.drawImage(image, 0, 0, size, size); hasDrawing = true; loadingDrawing = false;
      };
      image.onerror = () => {
        if (sequence !== openSequence || !dialog.open) return;
        draft.drawing = ""; loadingDrawing = false; updateDraftView();
        status.textContent = "Please draw your avatar again.";
      };
      image.src = draft.drawing;
    }
    updateDraftView(); dialog.showModal(); nameInput.focus();
  }
  function position(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(size, (event.clientX - bounds.left) * size / bounds.width)), y: Math.max(0, Math.min(size, (event.clientY - bounds.top) * size / bounds.height)) };
  }
  function paint(from, to) {
    ctx.save();
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = colourInput.value; ctx.fillStyle = colourInput.value;
    ctx.lineWidth = Number(brushInput.value); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(to.x, to.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); hasDrawing = true;
  }
  function fillArea(point) {
    const x = Math.min(size - 1, Math.floor(point.x));
    const y = Math.min(size - 1, Math.floor(point.y));
    const image = ctx.getImageData(0, 0, size, size);
    const pixels = image.data;
    const start = y * size + x;
    const target = Array.from(pixels.slice(start * 4, start * 4 + 4));
    const colour = colourInput.value.slice(1).match(/../g).map(channel => parseInt(channel, 16));
    if (target[3] === 255 && colour.every((channel, i) => channel === target[i])) return;
    // Compare premultiplied colours so invisible pixels behave as one background.
    // A little tolerance includes the soft edges left by the drawing brush.
    const targetAlpha = target[3] / 255;
    const visited = new Uint8Array(size * size);
    const queue = new Uint32Array(size * size);
    let head = 0, tail = 0;
    function enqueue(index) {
      if (visited[index]) return;
      visited[index] = 1;
      const px = index % size, py = Math.floor(index / size);
      if ((px + .5 - size / 2) ** 2 + (py + .5 - size / 2) ** 2 > (size / 2) ** 2) return;
      const offset = index * 4, alpha = pixels[offset + 3] / 255;
      if (Math.abs(pixels[offset + 3] - target[3]) > 32) return;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(pixels[offset + i] * alpha - target[i] * targetAlpha) > 32) return;
      }
      queue[tail++] = index;
    }
    enqueue(start);
    while (head < tail) {
      const index = queue[head++], px = index % size, offset = index * 4;
      pixels[offset] = colour[0]; pixels[offset + 1] = colour[1]; pixels[offset + 2] = colour[2]; pixels[offset + 3] = 255;
      if (px > 0) enqueue(index - 1);
      if (px < size - 1) enqueue(index + 1);
      if (index >= size) enqueue(index - size);
      if (index < size * (size - 1)) enqueue(index + size);
    }
    if (!tail) return;
    remember(); ctx.putImageData(image, 0, 0); hasDrawing = true; snapshotDrawing();
  }
  canvas.addEventListener("pointerdown", event => {
    if (loadingDrawing || stroke || (event.pointerType === "mouse" && event.button !== 0)) return;
    const point = position(event);
    if (Math.hypot(point.x - size / 2, point.y - size / 2) > size / 2) return;
    event.preventDefault();
    if (drawingTool === "fill") { fillArea(point); return; }
    remember();
    stroke = { id: event.pointerId, point };
    canvas.setPointerCapture(event.pointerId); paint(point, point);
  });
  canvas.addEventListener("pointermove", event => {
    if (!stroke || stroke.id !== event.pointerId) return;
    const point = position(event); paint(stroke.point, point); stroke.point = point;
  });
  function finishStroke(event) {
    if (!stroke || (event && stroke.id !== event.pointerId)) return;
    const pointerId = stroke.id; stroke = null;
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    snapshotDrawing();
  }
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => canvas.addEventListener(type, finishStroke));
  dialog.addEventListener("click", event => {
    if (event.target.closest("[data-profile-close]")) { dialog.close(); return; }
    const choice = event.target.closest("[data-profile-avatar]");
    if (choice) { draft.avatar = choice.dataset.profileAvatar; updateDraftView(); return; }
    const tool = event.target.closest("[data-profile-tool]");
    if (tool && !stroke) { selectTool(tool.dataset.profileTool); return; }
    if (event.target.closest("[data-profile-undo]") && undo.length && !loadingDrawing && !stroke) {
      const previous = undo.pop(); ctx.putImageData(previous.image, 0, 0);
      hasDrawing = previous.hasDrawing; undoButton.disabled = undo.length === 0; snapshotDrawing();
    }
    if (event.target.closest("[data-profile-clear]") && !loadingDrawing && !stroke) {
      remember(); ctx.clearRect(0, 0, size, size); hasDrawing = false; snapshotDrawing();
    }
  });
  dialog.addEventListener("submit", event => {
    event.preventDefault();
    if (loadingDrawing) { status.textContent = "Your drawing is loading. Please try again in a moment."; return; }
    finishStroke();
    if (draft.avatar === "drawing" && !hasDrawing) {
      status.textContent = "Draw an avatar, or choose an example at the top."; return;
    }
    profile = normalize({ ...draft, name: nameInput.value });
    let saved = true;
    try { localStorage.setItem(storageKey, JSON.stringify(profile)); } catch { saved = false; }
    mount(mountTarget);
    if (saved) dialog.close();
    else status.textContent = "Profile updated for this visit. This browser could not save it for next time.";
  });
  dialog.addEventListener("close", () => {
    ++openSequence; stroke = null;
    mountTarget?.querySelector(".picker-profile-button")?.focus();
  });
  window.addEventListener("storage", event => {
    if (event.key !== storageKey && event.key !== null) return;
    profile = readProfile(); mount(mountTarget);
  });
  window.ZapmanProfile = { mount };
})();
