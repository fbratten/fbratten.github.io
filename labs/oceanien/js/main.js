/* Huvudloop och interaktion. */
(function (FA) {
  "use strict";
  function $(id) { return document.getElementById(id); }

  var DURATION = 210;             // sekunder för hela tidslinjen vid 1x
  var SPEEDS = [0.5, 1, 2, 4];

  FA.byId = {};
  (window.FA_EVENTS || []).forEach(function (e) { FA.byId[e.id] = e; });

  var app = {
    u: 0, playing: false, speedIdx: 1, dwell: 0, dwellUntil: 0, lastU: 0,
    filters: { arkeologi: true, genetik: true, kontakt: true, miljo: true, routes: true, ice: true, labels: true, grid: true, dwell: true },
    selected: null, dirty: true, lastChime: 0
  };
  FA.app = app;

  var globe = null, overlay, camera, ui, audio;
  var W = 0, H = 0, area = { x: 0, y: 0, w: 1, h: 1 };

  function init() {
    camera = new FA.Camera();
    audio = new FA.Audio();
    overlay = new FA.Overlay($("overlay"));
    overlay.setRoutes(FA.STORY.routes);
    try {
      globe = new FA.Globe($("globe"));
    } catch (e) {
      console.error(e);
      $("nogl").hidden = false;
      globe = null;
    }
    FA.applyStatic();
    ui = new FA.UI(app);
    bindControls();
    bindPointer();
    readHash();
    resize();
    window.addEventListener("resize", resize);
    $("panel").addEventListener("transitionend", function (e) { if (e.propertyName === "height") app.layoutChanged(); });
    if (!app.selected && window.matchMedia && window.matchMedia("(max-width: 900px)").matches) $("panel").classList.add("collapsed");
    camera.update(FA.ageAt(app.u), 0, true);
    app.camera = camera;
    if (FA.isFilm) { $("intro").hidden = true; resize(); if (FA.film) FA.film.ready(app); return; }
    tick.last = performance.now();
    requestAnimationFrame(tick);
    setTimeout(resize, 50);
  }

  /* ---------- Layout ---------- */
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    var dpr = window.devicePixelRatio || 1;
    var gdpr = Math.min(dpr, W < 900 ? 2 : 1.6);
    var gs = /[?&]gscale=([\d.]+)/.exec(location.search);
    if (FA.isFilm && gs) gdpr = FA.clamp(+gs[1], 0.4, 2);
    if (globe) {
      var gc = $("globe");
      gc.width = Math.round(W * gdpr); gc.height = Math.round(H * gdpr);
      app.gdpr = gdpr;
    }
    overlay.resize(W, H, Math.min(dpr, 2));
    app.layoutChanged();
  }
  app.layoutChanged = function () {
    var dock = $("dock").getBoundingClientRect(), panel = $("panel").getBoundingClientRect(), hud = $("hud").getBoundingClientRect();
    if (FA.isFilm) {
      area = { x: 0, y: 30, w: W, h: H - 60 };
    } else if (W > 900) {
      area = { x: 0, y: 0, w: Math.max(200, panel.left - 10), h: Math.max(200, dock.top - 6) };
    } else {
      var top = hud.bottom + 4, bottom = Math.min(panel.top, dock.top) - 4;
      area = { x: 0, y: top, w: W, h: Math.max(160, bottom - top) };
    }
    app.dirty = true;
  };

  /* ---------- Tid ---------- */
  app.seek = function (u, silent) {
    app.u = FA.clamp(u, 0, 1);
    app.lastU = app.u;
    afterTimeChange(false);
    if (!silent) updateHash();
  };
  app.gotoEvent = function (id, select) {
    var ev = FA.byId[id];
    if (!ev) return;
    var u = FA.uAt(Math.min(ev.age_bp.show, FA.START_BP));
    app.seek(Math.min(1, u + 0.0008));
    app.select(id, !!select);
  };
  app.select = function (id, fly) {
    app.selected = id;
    overlay.selected = id;
    var ev = FA.byId[id];
    ui.reveal(id);
    if (fly && ev && ev.lat != null) camera.flyTo(ev.lat, ev.lon, Math.max(camera.cur.zoom, 2.0));
    syncFollow();
    updateHash();
  };

  function setPlaying(on) {
    if (on && app.u >= 1) app.seek(0);
    app.playing = on;
    $("play").classList.toggle("playing", on);
    $("play").setAttribute("aria-label", FA.t(on ? "pause" : "play"));
    if (on) { audio.init(); camera.toStory(); syncFollow(); }
    else updateHash();
  }
  app.setPlaying = setPlaying;

  function afterTimeChange(crossing) {
    var bp = FA.ageAt(app.u);
    var s = $("scrub");
    s.value = Math.round(app.u * 10000);
    s.style.setProperty("--p", (app.u * 100) + "%");
    s.setAttribute("aria-valuetext", FA.formatNow(bp).big);
    var chapterChanged = ui.updateHud(bp);
    if (chapterChanged && app.playing) {
      var c = FA.STORY.chapters[ui.chapterIdx];
      ui.toast(FA.t("chapter", { n: ui.chapterIdx + 1 }), FA.tx(c, "title"));
      audio.whoosh();
    }
    ui.updateCards(bp, crossing);
    ui.tree.update(bp);
    app.dirty = true;
  }

  // Händelser som passerats mellan två tidpunkter (framåt)
  function crossed(u0, u1) {
    var out = [];
    if (u1 <= u0) return out;
    for (var i = 0; i < FA_EVENTS.length; i++) {
      var e = FA_EVENTS[i], ue = FA.uAt(Math.min(e.age_bp.show, FA.START_BP));
      if (ue > u0 && ue <= u1) out.push(e);
    }
    return out;
  }

  /* ---------- Filmläge: en bildruta i taget, styrd utifrån ---------- */
  app.setU = function (u) { app.u = FA.clamp(u, 0, 1); afterTimeChange(false); };
  app.renderFrame = function (dt, t) {
    var bp = FA.ageAt(app.u);
    camera.update(bp, dt, false);
    var view = camera.view(area);
    view.dpr = app.gdpr || 1; view.bp = bp; view.ice = true; view.grid = true;
    if (globe) globe.render(view);
    overlay.render(view, bp, t, FA_EVENTS, app.filters);
    app.view = view;
    return view;
  };
  app.ui = function () { return ui; };

  /* ---------- Loop ---------- */
  function tick(now) {
    var dt = Math.min(0.1, (now - tick.last) / 1000);
    tick.last = now;
    var t = now / 1000;
    if (app.playing) {
      var target = (app.filters.dwell && now < app.dwellUntil) ? 0.22 : 1;
      app.dwell += (target - app.dwell) * Math.min(1, dt * 4);
      var du = dt * SPEEDS[app.speedIdx] / DURATION * app.dwell;
      var u0 = app.u;
      app.u = Math.min(1, app.u + du);
      var hits = crossed(u0, app.u);
      if (hits.length) {
        app.dwellUntil = now + 1700;
        hits.forEach(function (e) {
          if (now - app.lastChime > 380) { audio.chime(e.kind, e.status, FA_EVENTS.indexOf(e)); app.lastChime = now; }
          $("live").textContent = FA.t("new_event", { t: FA.tx(e, "title"), d: FA.formatRange(e) });
        });
      }
      afterTimeChange(hits.length > 0);
      if (app.u >= 1) setPlaying(false);
    } else {
      app.dwell = 1;
    }
    var bp = FA.ageAt(app.u);
    camera.update(bp, dt, false);
    var view = camera.view(area);
    view.dpr = app.gdpr || 1; view.bp = bp; view.ice = app.filters.ice; view.grid = app.filters.grid;
    var key = [view.lat.toFixed(4), view.lon.toFixed(4), view.R.toFixed(2), Math.round(bp), view.ice, view.grid, W, H].join("|");
    if (globe && (app.dirty || key !== tick.key)) { globe.render(view); tick.key = key; app.dirty = false; }
    overlay.render(view, bp, t, FA_EVENTS, app.filters);
    app.view = view;
    // ljudbild
    var ch = ui.chapterIdx, ocean = (ch === 2 || ch === 6) ? 0.85 : ch === 5 ? 0.5 : 0.25;
    audio.update(FA.glacial(bp), ocean, app.playing);
    requestAnimationFrame(tick);
  }

  /* ---------- Kontroller ---------- */
  function syncFollow() { $("follow").hidden = camera.mode !== "manual"; }

  function bindControls() {
    $("play").addEventListener("click", function () { setPlaying(!app.playing); });
    var scrub = $("scrub");
    scrub.addEventListener("input", function () {
      var u = scrub.value / 10000, prev = app.u;
      app.u = u; app.lastU = u;
      afterTimeChange(u > prev && u - prev < 0.01);
    });
    scrub.addEventListener("change", updateHash);
    $("speed").addEventListener("click", function () {
      app.speedIdx = (app.speedIdx + 1) % SPEEDS.length;
      $("speed").textContent = SPEEDS[app.speedIdx] + "x";
    });
    $("sound").addEventListener("click", function () {
      var on = $("sound").getAttribute("aria-pressed") !== "true";
      $("sound").setAttribute("aria-pressed", on ? "true" : "false");
      if (on) audio.init();
      audio.setEnabled(on);
    });
    $("follow").addEventListener("click", function () { camera.toStory(); syncFollow(); });
    $("lang").addEventListener("click", function () {
      FA.setLang(FA.lang === "sv" ? "en" : "sv");
      $("play").setAttribute("aria-label", FA.t(app.playing ? "pause" : "play"));
      ui.rebuild();
      afterTimeChange(false);
      if (app.selected) { overlay.selected = app.selected; ui.reveal(app.selected); }
    });
    var lb = $("layersBtn"), pop = $("layers");
    lb.addEventListener("click", function (e) {
      e.stopPropagation();
      pop.hidden = !pop.hidden; lb.setAttribute("aria-expanded", pop.hidden ? "false" : "true");
    });
    document.addEventListener("click", function (e) { if (!pop.hidden && !pop.contains(e.target) && e.target !== lb) { pop.hidden = true; lb.setAttribute("aria-expanded", "false"); } });
    pop.querySelectorAll("input[data-layer]").forEach(function (inp) {
      inp.addEventListener("change", function () { app.filters[inp.dataset.layer] = inp.checked; app.dirty = true; });
    });
    $("start").addEventListener("click", function () { $("intro").hidden = true; audio.init(); setPlaying(true); });
    $("explore").addEventListener("click", function () { $("intro").hidden = true; });
    var panel = $("panel");
    function cyclePanel() {
      if (panel.classList.contains("collapsed")) panel.classList.remove("collapsed");
      else if (!panel.classList.contains("expanded")) panel.classList.add("expanded");
      else { panel.classList.remove("expanded"); panel.classList.add("collapsed"); }
      setTimeout(app.layoutChanged, 380);
    }
    $("grip").addEventListener("click", cyclePanel);
    $("grip").addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cyclePanel(); } });
    ["tab-events", "tab-tree", "tab-about"].forEach(function (id) {
      $(id).addEventListener("click", function () { if (panel.classList.contains("collapsed")) { panel.classList.remove("collapsed"); setTimeout(app.layoutChanged, 380); } });
    });
    document.addEventListener("keydown", function (e) {
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" && e.target.type !== "range") return;
      if (!$("intro").hidden && e.key !== "Escape") return;
      if (e.key === " " && tag !== "BUTTON") { e.preventDefault(); setPlaying(!app.playing); }
      else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && tag !== "INPUT") { e.preventDefault(); stepEvent(e.key === "ArrowRight" ? 1 : -1); }
      else if (e.key === "Home") app.seek(0);
      else if (e.key === "End") app.seek(1);
      else if (e.key === "+" || e.key === "=") { camera.zoomBy(1.25); syncFollow(); }
      else if (e.key === "-") { camera.zoomBy(0.8); syncFollow(); }
      else if (e.key === "Escape") { $("intro").hidden = true; }
    });
  }

  function stepEvent(dir) {
    var us = FA_EVENTS.map(function (e) { return { e: e, u: FA.uAt(Math.min(e.age_bp.show, FA.START_BP)) }; })
      .sort(function (a, b) { return a.u - b.u; });
    var cur = app.u, pick = null;
    if (dir > 0) { for (var i = 0; i < us.length; i++) if (us[i].u > cur + 0.0009) { pick = us[i]; break; } }
    else { for (var j = us.length - 1; j >= 0; j--) if (us[j].u < cur - 0.0009) { pick = us[j]; break; } }
    if (pick) app.gotoEvent(pick.e.id, false);
  }

  /* ---------- Pekare: dra, zooma, klicka ---------- */
  function bindPointer() {
    var cv = $("overlay"), pts = {}, moved = 0, last = null, pinch = null;
    cv.addEventListener("pointerdown", function (e) {
      cv.setPointerCapture(e.pointerId);
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      moved = 0; last = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    });
    cv.addEventListener("pointermove", function (e) {
      if (!pts[e.pointerId]) {
        var h = overlay.hitTest(e.clientX, e.clientY);
        if (h !== overlay.hover) { overlay.hover = h; cv.style.cursor = h ? "pointer" : ""; }
        return;
      }
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 2 && pinch) {
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        camera.zoomBy(d / pinch); pinch = d; moved += 10; syncFollow();
        return;
      }
      var dx = e.clientX - last.x, dy = e.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      last = { x: e.clientX, y: e.clientY };
      if (moved > 4 && app.view) { cv.classList.add("dragging"); camera.drag(dx, dy, app.view.R); syncFollow(); app.dirty = true; }
    });
    function up(e) {
      delete pts[e.pointerId];
      cv.classList.remove("dragging");
      if (Object.keys(pts).length < 2) pinch = null;
      if (moved <= 4 && e.type === "pointerup") {
        var h = overlay.hitTest(e.clientX, e.clientY);
        if (h) app.select(h, false);
      }
    }
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", function (e) {
      e.preventDefault();
      camera.zoomBy(Math.exp(-e.deltaY * 0.0015));
      syncFollow();
    }, { passive: false });
  }

  /* ---------- Länkar ---------- */
  function updateHash() {
    var bp = Math.round(FA.ageAt(app.u));
    var h = "#t=" + bp + (app.selected ? "&e=" + app.selected : "");
    if (location.hash !== h) { try { history.replaceState(null, "", h); } catch (e) { /* file:// i vissa webbläsare */ } }
  }
  function readHash() {
    var m = /t=(\d+)/.exec(location.hash), ev = /e=([\w-]+)/.exec(location.hash);
    if (m) { app.u = FA.uAt(+m[1]); $("intro").hidden = true; }
    afterTimeChange(false);
    if (ev && FA.byId[ev[1]]) { app.selected = ev[1]; overlay.selected = ev[1]; ui.reveal(ev[1]); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window.FA = window.FA || {});
