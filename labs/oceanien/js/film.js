/* Filmläge (?film=1): spelar upp tidslinjen deterministiskt, en bildruta i taget, för inspelning
   av video. Ingen requestAnimationFrame: en inspelare anropar FA.film.frame(i) för varje ruta och
   FA.film.soundtrack() för ett ljudspår som är synkat med samma schema. */
(function (FA) {
  "use strict";
  FA.isFilm = /[?&]film=1\b/.test(location.search);
  if (!FA.isFilm) return;

  var FPS = 30, DT = 1 / FPS;
  var BASE = 230;        // sekunder för hela tidslinjen utan inbromsning
  var DWELL_S = 1.9, DWELL_F = 0.22;
  var INTRO = 7, OUTRO = 10;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return FA.esc ? FA.esc(s) : String(s); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function firstSentence(s) {
    if (!s) return "";
    var m = /^(.+?[.!?])(\s|$)/.exec(s);
    var out = m ? m[1] : s;
    return out.length > 210 ? out.slice(0, 205).replace(/\s+\S*$/, "") + " ..." : out;
  }

  // Simulerar uppspelningen med samma inbromsning som den interaktiva sidan
  function buildSchedule() {
    var us = [], hits = [], u = 0, dwell = 1, until = -1, t = 0;
    var evU = FA_EVENTS.map(function (e) { return { e: e, u: FA.uAt(Math.min(e.age_bp.show, FA.START_BP)) }; });
    while (u < 1) {
      var target = t < until ? DWELL_F : 1;
      dwell += (target - dwell) * Math.min(1, DT * 4);
      var u0 = u;
      u = Math.min(1, u + DT / BASE * dwell);
      for (var i = 0; i < evU.length; i++) {
        if (evU[i].u > u0 && evU[i].u <= u) { hits.push({ t: t, e: evU[i].e }); until = t + DWELL_S; }
      }
      us.push(u); t += DT;
    }
    var chapters = [], last = -1, C = FA.STORY.chapters;
    us.forEach(function (uu, k) {
      var bp = FA.ageAt(uu), idx = 0;
      for (var j = 0; j < C.length; j++) if (bp <= C[j].from) idx = j;
      if (idx !== last) { chapters.push({ t: k * DT, idx: idx }); last = idx; }
    });
    return { us: us, hits: hits, chapters: chapters, main: t };
  }

  var app = null, S = null, captionId = null, captionT = -1;
  // Publiceringsadress och kontrolldatum hör till visningen, inte motorn (FA.STORY.site i js/story.js)
  var SITE = (FA.STORY && FA.STORY.site) || {};

  function cards() {
    var en = FA.lang === "en";
    $("filmTitle").innerHTML = '<div class="in"><div class="kick">' + (en ? "Interactive history" : "Interaktiv historia") + "</div>" +
      "<h2>" + esc(FA.t("h1")) + "</h2><p>" + esc(FA.t("sub")) + "</p>" +
      '<div class="legend"><span>' + (en ? "Solid: established" : "Heldraget: belagt") + "</span><span>" +
      (en ? "Dashed: suggested" : "Streckat: antytt") + "</span><span>" + (en ? "Dotted: disputed" : "Prickat: omstritt") + "</span></div></div>";
    $("filmEnd").innerHTML = '<div class="in"><div class="kick">' + (en ? "Explore it yourself" : "Utforska själv") + "</div>" +
      "<h2>" + esc(FA.t("h1")) + "</h2>" +
      "<p>" + (en ? "Interactive version with all " + FA_EVENTS.length + " events and their sources:" : "Interaktiv version med alla " + FA_EVENTS.length + " händelser och deras källor:") + "</p>" +
      '<p class="url">' + esc(SITE.url_label) + "</p>" +
      '<p class="small">' + (en
        ? "Research checked against sources on " + SITE.checked_en + ". Map data: Natural Earth (public domain). Sound synthesised in the browser. Content CC BY 4.0, code MIT. By Fredrik Brattén."
        : "Uppgifterna kontrollerade mot källor " + SITE.checked_sv + ". Kartdata: Natural Earth (public domain). Ljudet syntetiserat i webbläsaren. Innehåll CC BY 4.0, kod MIT. Av Fredrik Brattén.") + "</p></div>";
    $("filmCredit").textContent = SITE.url_label;
  }

  function setCaption(id, t) {
    if (id === captionId) return;
    captionId = id; captionT = t;
    var ev = id && FA.byId[id];
    if (!ev) { $("filmCaption").innerHTML = ""; return; }
    $("filmCaption").innerHTML =
      '<div class="fc-art">' + FA.art(ev.illustration, ev.kind) + "</div>" +
      '<div class="fc-meta"><span class="badge b-' + ev.kind + '">' + FA.t("kind_" + ev.kind) + "</span>" +
      '<span class="badge b-' + ev.status + '">' + FA.t("st_" + ev.status) + "</span></div>" +
      '<div class="fc-title">' + esc(FA.tx(ev, "title")) + "</div>" +
      '<div class="fc-place">' + esc(FA.tx(ev, "place")) + " · " + esc(FA.formatRange(ev)) + "</div>" +
      '<p class="fc-text">' + esc(firstSentence(FA.tx(ev, "summary"))) + "</p>";
  }

  FA.film = {
    fps: FPS,
    ready: function (a) {
      app = a;
      document.body.classList.add("film");
      $("film").hidden = false;
      S = buildSchedule();
      cards();
      FA.film.total = Math.round(INTRO * FPS) + S.us.length + Math.round(OUTRO * FPS);
      FA.film.ok = true;
    },
    info: function () {
      return { fps: FPS, total: FA.film.total, intro: INTRO, outro: OUTRO, main: S.main, hits: S.hits.length,
        chapters: S.chapters.map(function (c) { return { t: c.t + INTRO, idx: c.idx, title: FA.tx(FA.STORY.chapters[c.idx], "title") }; }) };
    },
    // Rendera bildruta i (0-baserad), i ordning
    frame: function (i) {
      var nIntro = Math.round(INTRO * FPS), nMain = S.us.length, t = i * DT;
      var cam = app.camera;
      if (i < nIntro) {
        var p = i / nIntro;
        if (i === 0) { app.setU(0); cam.update(FA.START_BP, 0, true); }
        cam.mode = "manual";
        var K = FA.STORY.camera[0];
        cam.manual = { v: FA.vec(K.lat - 6 + 6 * p, K.lon - 25 + 25 * p), zoom: 0.78 + (K.zoom - 0.78) * FA.smooth(p) };
        app.renderFrame(DT, t);
        $("filmTitle").style.opacity = clamp01(Math.min(i / 20, (nIntro - i) / 24));
        $("filmCaption").style.opacity = 0;
        $("filmChapter").style.opacity = 0;
        $("filmBar").style.width = "0%";
        $("hud").style.opacity = clamp01((i - nIntro + 30) / 30);
        return;
      }
      $("hud").style.opacity = 1;
      $("filmTitle").style.opacity = 0;
      if (cam.mode === "manual") { cam.toStory(); }
      var k = Math.min(i - nIntro, nMain - 1), tm = k * DT;
      app.setU(S.us[k]);
      app.renderFrame(DT, t);
      var ui = app.ui();
      setCaption(ui.latestId, t);
      var age = t - captionT;
      $("filmCaption").style.opacity = i >= nIntro + nMain ? clamp01(1 - (i - nIntro - nMain) / 20) : clamp01(age / 0.45);
      // kapitelskylt i 2,6 s
      var ch = null;
      for (var c = 0; c < S.chapters.length; c++) if (S.chapters[c].t <= tm) ch = S.chapters[c];
      var chAge = ch ? tm - ch.t : 99;
      var chOp = chAge < 2.6 ? clamp01(Math.min(chAge / 0.4, (2.6 - chAge) / 0.5)) : 0;
      if (ch) $("filmChapter").innerHTML = '<span class="k">' + esc(FA.t("chapter_of", { n: ch.idx + 1, m: FA.STORY.chapters.length })) + '</span><div class="t">' + esc(FA.tx(FA.STORY.chapters[ch.idx], "title")) + "</div>";
      $("filmChapter").style.opacity = chOp;
      $("filmBar").style.width = (S.us[k] * 100).toFixed(2) + "%";
      if (i >= nIntro + nMain) {
        var e = (i - nIntro - nMain) / Math.round(OUTRO * FPS);
        $("filmEnd").style.opacity = clamp01(e * 3);
      } else {
        $("filmEnd").style.opacity = 0;
      }
    },
    // Ljudspår: renderas offline, synkat med schemat. Returnerar WAV (16 bit stereo) som base64 i bitar.
    soundtrack: function () {
      var rate = 44100, dur = FA.film.total / FPS + 1;
      var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      var ctx = new OAC(2, Math.ceil(dur * rate), rate);
      var au = new FA.Audio();
      au.init(ctx);
      var C = FA.STORY.chapters;
      for (var tt = 0; tt < dur; tt += 0.25) {
        var mt = tt - INTRO, uu = mt <= 0 ? 0 : S.us[Math.min(S.us.length - 1, Math.floor(mt * FPS))];
        var bp = FA.ageAt(uu), idx = 0;
        for (var j = 0; j < C.length; j++) if (bp <= C[j].from) idx = j;
        var ocean = C[idx].ocean != null ? C[idx].ocean : 0.5;
        var fade = Math.min(1, tt / 4) * Math.min(1, Math.max(0, (dur - 1.5 - tt) / 4));
        au.update(FA.glacial(bp) * fade + 0.0001, ocean * fade, fade > 0.5, tt);
      }
      var lastChime = -1;
      S.hits.forEach(function (h) {
        var at = h.t + INTRO;
        if (at - lastChime < 0.38) return;
        au.chime(h.e.kind, h.e.status, FA_EVENTS.indexOf(h.e), at);
        lastChime = at;
      });
      S.chapters.forEach(function (c, n) { if (n > 0) au.whoosh(c.t + INTRO); });
      au.whoosh(0.4);
      return ctx.startRendering().then(function (buf) {
        var L = buf.getChannelData(0), R = buf.getChannelData(1), n = buf.length;
        var bytes = new Uint8Array(44 + n * 4), dv = new DataView(bytes.buffer);
        function str(o, s) { for (var q = 0; q < s.length; q++) bytes[o + q] = s.charCodeAt(q); }
        str(0, "RIFF"); dv.setUint32(4, 36 + n * 4, true); str(8, "WAVE"); str(12, "fmt ");
        dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, rate, true);
        dv.setUint32(28, rate * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); str(36, "data"); dv.setUint32(40, n * 4, true);
        for (var s = 0; s < n; s++) {
          dv.setInt16(44 + s * 4, Math.max(-1, Math.min(1, L[s])) * 32767, true);
          dv.setInt16(46 + s * 4, Math.max(-1, Math.min(1, R[s])) * 32767, true);
        }
        FA.film._wav = bytes;
        return bytes.length;
      });
    },
    wavChunk: function (offset, size) {
      var b = FA.film._wav.subarray(offset, offset + size), s = "";
      for (var i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
      return btoa(s);
    }
  };
})(window.FA = window.FA || {});
