(() => {
  "use strict";
  const scriptUrl = document.currentScript.src, key = "zapman-educational-mode";
  const page = new URL(location.href), root = new URL(".", scriptUrl);
  const pickerPage = new URL(".", page).href === root.href;
  const playingPage = () => !pickerPage || !document.body.classList.contains("picker-active");
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch { /* Settings also travel in links. */ }
  let year = Number(saved?.year) || 1, enabled = saved?.enabled === true;
  if (page.searchParams.has("edu")) {
    const value = Number(page.searchParams.get("edu"));
    if (Number.isInteger(value) && value >= 0 && value <= 12) { enabled = value > 0; if (enabled) year = value; }
  }
  year = Math.max(1, Math.min(12, Math.round(year)));
  let blocked = enabled && !pickerPage, dialog, callback = null, adapter = null, inQuiz = false;
  let quizReason = "start";
  let correct = 0, answered = false, question, returningFocus;
  const questions = ZapmanQuestions.create();
  const nativeRAF = window.requestAnimationFrame.bind(window), nativeCancel = window.cancelAnimationFrame.bind(window);
  // Hold game frames while the questions are open. Preserve cancellation and one callback per frame.
  const frames = new Map(); let frameId = 0;
  window.requestAnimationFrame = fn => {
    const id = ++frameId;
    const deliver = time => {
      if (!frames.has(id)) return;
      if (blocked) frames.set(id, nativeRAF(deliver));
      else { frames.delete(id); fn(time); }
    };
    frames.set(id, nativeRAF(deliver)); return id;
  };
  window.cancelAnimationFrame = id => { if (frames.has(id)) { nativeCancel(frames.get(id)); frames.delete(id); } };
  // Delay timed game transitions while questions are open.
  if (typeof window.setTimeout === "function") {
    const timeout = window.setTimeout.bind(window), cancel = window.clearTimeout.bind(window), waiting = new Map();
    window.setTimeout = (fn, delay, ...args) => {
      if (typeof fn !== "function") return timeout(fn, delay, ...args);
      let id;
      const deliver = () => {
        if (blocked) waiting.set(id, nativeRAF(deliver));
        else { waiting.delete(id); fn(...args); }
      };
      id = timeout(deliver, delay); return id;
    };
    window.clearTimeout = id => { cancel(id); if (waiting.has(id)) { nativeCancel(waiting.get(id)); waiting.delete(id); } };
  }
  const sheet = document.createElement("link"); sheet.rel = "stylesheet"; sheet.href = new URL("educational-mode.css", scriptUrl).href; document.head.append(sheet);
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ enabled, year })); } catch { /* Local-file links carry the year too. */ }
    page.searchParams.set("edu", enabled ? String(year) : "0");
    try { history.replaceState({}, "", page.href); } catch { /* Restricted local-file history is optional. */ }
    document.querySelectorAll("[data-educational-mode]").forEach(button => {
      button.textContent = `Educational mode${enabled ? ` · Year ${year}` : ""}`;
      button.setAttribute("aria-pressed", String(enabled));
    });
  }
  function open() {
    window.ZapmanMobileControls?.release();
    returningFocus = document.activeElement; blocked = true;
    adapter?.release?.();
    if (!dialog.open) dialog.showModal();
  }
  function close() {
    dialog.close(); blocked = false; inQuiz = false;
    (returningFocus?.isConnected ? returningFocus : document.querySelector("canvas"))?.focus?.({ preventScroll: true });
  }
  function settings() {
    if (inQuiz) return;
    open();
    dialog.innerHTML = `<form method="dialog" class="edu-settings"><p class="edu-eyebrow">LEARN, THEN PLAY</p><h2 id="edu-title">Educational mode</h2><p>Answer three questions before playing and to get lives back. Subjects are random; your year group stays the same.</p><label class="edu-toggle"><input id="edu-enabled" type="checkbox" ${enabled ? "checked" : ""}> Educational mode on</label><label for="edu-year">Choose your year group</label><select id="edu-year">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${year === i + 1 ? "selected" : ""}>Year ${i + 1}</option>`).join("")}</select><p class="edu-note">Mathematics · English · Science · History<br>Practice gets harder in higher years. Wrong answers never cost lives.</p><div class="edu-actions"><button type="submit">Save</button><button type="button" data-edu-cancel>Cancel</button></div></form>`;
    dialog.querySelector("form").addEventListener("submit", event => {
      event.preventDefault(); const old = { enabled, year };
      enabled = dialog.querySelector("#edu-enabled").checked; year = Number(dialog.querySelector("#edu-year").value); save();
      if (enabled && playingPage() && (!old.enabled || old.year !== year)) quiz(null, "start"); else close();
    });
    dialog.querySelector("[data-edu-cancel]").addEventListener("click", close);
    dialog.querySelector("#edu-enabled").focus();
  }
  function renderQuestion() {
    answered = false; question = questions.next(year);
    const back = new URL(window.ZapmanDisplay ? window.ZapmanDisplay.withSettings(new URL("index.html", root).href) : withSettings(new URL("index.html", root).href));
    if (page.searchParams.get("mobile") === "1") back.searchParams.set("mobile", "1");
    dialog.innerHTML = `<p class="edu-eyebrow">YEAR ${year} · ${question.subject.toUpperCase()}</p><h2 id="edu-title">${quizReason === "recover" ? "Questions to get lives back" : "Questions before you play"}</h2><p class="edu-progress">${correct} of 3 correct</p><h3 class="edu-question"></h3><div class="edu-answers"></div><p class="edu-feedback" role="status" aria-live="polite"></p><div class="edu-actions"><button type="button" data-edu-next hidden>Next question →</button><a href="${back.href}">Back to games</a></div>`;
    dialog.querySelector(".edu-question").textContent = question.prompt;
    const answers = dialog.querySelector(".edu-answers");
    question.options.forEach(option => {
      const button = document.createElement("button"); button.type = "button"; button.textContent = option;
      button.addEventListener("click", () => answer(option)); answers.append(button);
    });
    dialog.querySelector("[data-edu-next]").addEventListener("click", () => correct === 3 ? finish() : renderQuestion());
    answers.querySelector("button").focus();
  }
  function answer(value) {
    if (answered) return;
    answered = true; const right = value === question.answer; if (right) correct++;
    dialog.querySelectorAll(".edu-answers button").forEach(button => { button.disabled = true; if (button.textContent === question.answer) button.classList.add("edu-correct"); });
    dialog.querySelector(".edu-progress").textContent = `${correct} of 3 correct`;
    const feedback = dialog.querySelector(".edu-feedback");
    feedback.textContent = right ? (correct === 3 ? "Three correct! You're ready to play." : "Correct! Keep going.") : `${question.explanation}. Keep trying; you haven't lost a life.`;
    const next = dialog.querySelector("[data-edu-next]"); next.hidden = false;
    next.textContent = correct === 3 ? (quizReason === "recover" ? "Restore lives and play →" : "Play →") : "Next question →"; next.focus();
  }
  function quiz(restore, reason = "recover") {
    if (inQuiz) return true;
    if (!enabled) return false;
    quizReason = reason; callback = reason === "recover" ? restore : null; correct = 0; inQuiz = true; open(); renderQuestion(); return true;
  }
  function finish() {
    const resume = callback; callback = null;
    // Keep frames and inputs held until the game's own recovery has completed.
    try { resume?.(); } finally { close(); }
  }
  function withSettings(href) { const url = new URL(href, location.href); url.searchParams.set("edu", enabled ? String(year) : "0"); return url.href; }
  function bind() {
    document.querySelectorAll("[data-educational-mode]").forEach(button => { if (!button.dataset.eduBound) { button.dataset.eduBound = "1"; button.addEventListener("click", settings); } });
    save();
  }
  window.ZapmanEducation = {
    get enabled() { return enabled; }, get year() { return year; }, get blocked() { return blocked; },
    settings, bind, withSettings,
    start(resume) { if (!enabled) { resume(); return; } if (quiz(null, "start")) callback = resume; },
    recover(resume) { return quiz(resume); },
    register(value) { adapter = value; }
  };
  for (const type of ["keydown", "pointerdown", "pointerup", "click", "touchstart"]) window.addEventListener(type, event => {
    if (blocked && dialog && !dialog.contains(event.target) && !event.target.closest?.("[data-game-picker-back]")) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, { capture: true, passive: false });
  document.addEventListener("DOMContentLoaded", () => {
    dialog = document.createElement("dialog"); dialog.id = "zapman-education"; dialog.setAttribute("aria-labelledby", "edu-title");
    for (const type of ["keydown", "keyup", "pointerdown", "pointerup", "click", "touchstart"]) dialog.addEventListener(type, event => event.stopPropagation());
    dialog.addEventListener("cancel", event => { event.preventDefault(); if (!inQuiz) close(); }); document.body.append(dialog);
    {
      const button = document.createElement("button"); button.type = "button"; button.className = "edu-game-button"; button.setAttribute("data-educational-mode", ""); document.body.append(button);
    }
    bind(); if (enabled && !pickerPage) quiz(null, "start"); else blocked = false;
    function monitor() {
      if (enabled && !blocked && adapter?.lost()) quiz(() => {
        if (adapter.restartsLoop) { frames.forEach(id => nativeCancel(id)); frames.clear(); }
        adapter.restore();
      });
      nativeRAF(monitor);
    }
    nativeRAF(monitor);
  });
  save();
})();
