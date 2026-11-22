/* Gränssnitt: tidslinje, händelsekort, flikar, om-sidan, HUD. Språk via FA.t / FA.tx (js/i18n.js). */
(function (FA) {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  FA.esc = esc;
  function kindLabel(k) { return FA.t("kind_" + k); }
  function statusLabel(s) { return FA.t("st_" + s); }
  function srcKind(k) { return FA.t("src_" + k); }

  function UI(app) {
    this.app = app;
    this.tree = null;
    this.build();
  }

  UI.prototype.build = function () {
    this.cards = {};
    this.latestId = null;
    this.userOpened = {};
    this.chapterIdx = -1;
    $("chapterBand").innerHTML = ""; $("ticks").innerHTML = ""; $("markers").innerHTML = ""; $("cards").innerHTML = "";
    this.buildTimeline();
    this.buildCards();
    this.buildAbout();
    this.buildLegend();
    if (!this._tabsBound) { this.bindTabs(); this._tabsBound = true; }
    this.tree = new FA.Tree($("tree"));
    this.buildTreeNotes();
    $("introArt").innerHTML = FA.art("kanot");
  };
  UI.prototype.rebuild = UI.prototype.build;

  /* ---------- Tidslinje ---------- */
  UI.prototype.buildTimeline = function () {
    var band = $("chapterBand"), app = this.app;
    FA.STORY.chapters.forEach(function (c, i) {
      var d = document.createElement("div");
      var u0 = FA.uAt(c.from), u1 = FA.uAt(Math.max(c.to, FA.END_BP));
      d.style.width = ((u1 - u0) * 100) + "%";
      d.textContent = (i + 1) + ". " + FA.tx(c, "title");
      d.title = FA.tx(c, "title");
      d.addEventListener("click", function () { app.seek(u0 + 0.0005); });
      band.appendChild(d);
    });
    var ticks = $("ticks"), en = FA.lang === "en";
    // Klass 0 syns även på mobil (tre markeringar; fler gick ihop vid 390 px); 1 = minor och 2 = nomob döljs där
    [[70000, 1, 0], [60000, 0, 2], [50000, 0, 1], [40000, 0, 1], [20000, 0, 1], [10000, 0, 1], [5000, 0, 0],
     [3500, 0, 2], [2700, 0, 1], [2000, "0", 2], [1100, "850", 1], [950, "1000", 1], [800, "1150", 2],
     [650, "1300", 1], [430, "1520", 0]].forEach(function (t) {
      var s = document.createElement("span");
      s.style.left = (FA.uAt(t[0]) * 100) + "%";
      if (typeof t[1] === "string") s.textContent = en ? (t[1] === "0" ? "year 0" : t[1] + " CE") : "år " + t[1];
      else s.textContent = FA.num(t[0]);
      if (t[2]) s.className = t[2] === 1 ? "minor" : "nomob";
      if (t[0] === FA.START_BP) s.style.transform = "none";
      if (t[0] === FA.END_BP) s.style.transform = "translateX(-100%)";
      ticks.appendChild(s);
    });
    var mk = $("markers"), self = this;
    this.markerEls = {};
    FA_EVENTS.forEach(function (ev) {
      var b = document.createElement("button");
      var u = FA.uAt(Math.min(ev.age_bp.show, FA.START_BP));
      b.style.left = (u * 100) + "%";
      b.style.background = FA.KIND_COLOR[ev.kind];
      if (ev.status === "omstritt") b.style.boxShadow = "inset 0 0 0 1.5px rgba(10,14,26,0.85)";
      b.title = FA.tx(ev, "title") + " - " + FA.formatRange(ev);
      b.setAttribute("aria-label", FA.tx(ev, "title") + ", " + FA.formatRange(ev));
      b.addEventListener("click", function () { app.gotoEvent(ev.id, true); });
      mk.appendChild(b);
      self.markerEls[ev.id] = b;
    });
  };

  /* ---------- Kort ---------- */
  UI.prototype.buildCards = function () {
    var list = $("cards"), self = this, app = this.app;
    var ordered = FA_EVENTS.slice().sort(function (a, b) { return a.age_bp.show - b.age_bp.show; });
    ordered.forEach(function (ev) {
      var li = document.createElement("li");
      li.className = "card";
      li.dataset.id = ev.id;
      li.hidden = true;
      li.innerHTML =
        '<button class="card-head" aria-expanded="false">' +
        '<span class="thumb">' + FA.art(ev.illustration, ev.kind) + "</span>" +
        "<span><span class=\"card-title\">" + esc(FA.tx(ev, "title")) + "</span>" +
        '<span class="card-meta"><span class="badge b-' + ev.kind + '">' + kindLabel(ev.kind) + "</span>" +
        '<span class="badge b-' + ev.status + '">' + statusLabel(ev.status) + "</span><span>" + esc(FA.formatRange(ev)) + "</span></span></span>" +
        "</button>" +
        '<div class="card-body"></div>';
      li.querySelector(".card-head").addEventListener("click", function () {
        var open = !li.classList.contains("open");
        self.userOpened[ev.id] = open;
        self.setOpen(ev.id, open);
        if (open) app.select(ev.id, false);
      });
      list.appendChild(li);
      self.cards[ev.id] = li;
    });
    var hint = document.createElement("li");
    hint.className = "future-hint";
    hint.id = "futureHint";
    list.appendChild(hint);
  };

  UI.prototype.fillBody = function (ev, li) {
    var body = li.querySelector(".card-body");
    if (body.dataset.filled) return;
    var srcs = (ev.sources || []).map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + "</a> <span>(" + srcKind(s.kind) + ")</span></li>";
    }).join("");
    var place = FA.tx(ev, "place"), debate = FA.tx(ev, "debate"), why = FA.tx(ev, "why");
    body.innerHTML =
      '<div class="art-wrap">' + FA.art(ev.illustration, ev.kind) + "</div>" +
      '<div class="place">' + esc(place) + (place ? " · " : "") + esc(FA.formatRange(ev)) + "</div>" +
      "<p>" + esc(FA.tx(ev, "summary")) + "</p>" +
      (debate ? '<div class="debate"><b>' + (ev.status === "omstritt" ? FA.t("disputed_why") : FA.t("uncertainty")) + "</b>" + esc(debate) + "</div>" : "") +
      (why ? '<div class="why"><b>' + FA.t("why") + "</b>" + esc(why) + "</div>" : "") +
      '<ol class="sources">' + srcs + "</ol>" +
      '<div class="card-actions">' +
      (ev.lat != null ? '<button data-act="map">' + FA.t("show_map") + "</button>" : "") +
      '<button data-act="time">' + FA.t("goto_time") + "</button></div>";
    var app = this.app;
    body.querySelectorAll("button[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.act === "map") app.select(ev.id, true);
        else app.gotoEvent(ev.id, false);
      });
    });
    body.dataset.filled = "1";
  };

  UI.prototype.setOpen = function (id, open) {
    var li = this.cards[id];
    if (!li) return;
    if (open) this.fillBody(FA.byId[id], li);
    li.classList.toggle("open", open);
    li.querySelector(".card-head").setAttribute("aria-expanded", open ? "true" : "false");
  };

  // Uppdaterar vilka kort som syns. Returnerar id för senaste händelsen.
  UI.prototype.updateCards = function (bp, entered) {
    var latest = null, latestShow = Infinity, nextEv = null, nextShow = -Infinity;
    for (var i = 0; i < FA_EVENTS.length; i++) {
      var ev = FA_EVENTS[i], li = this.cards[ev.id], vis = ev.age_bp.show >= bp;
      if (li.hidden === vis) li.hidden = !vis;
      this.markerEls[ev.id].classList.toggle("past", vis);
      if (vis) { if (ev.age_bp.show < latestShow) { latestShow = ev.age_bp.show; latest = ev.id; } }
      else if (ev.age_bp.show > nextShow) { nextShow = ev.age_bp.show; nextEv = ev; }
    }
    if (latest !== this.latestId) {
      if (this.latestId && this.cards[this.latestId]) {
        this.cards[this.latestId].classList.remove("latest");
        if (!this.userOpened[this.latestId]) this.setOpen(this.latestId, false);
      }
      this.latestId = latest;
      if (latest) {
        var li2 = this.cards[latest];
        li2.classList.add("latest");
        this.setOpen(latest, true);
        if (entered) { li2.classList.remove("enter"); void li2.offsetWidth; li2.classList.add("enter"); }
      }
      if (entered || this.app.playing) $("pane-events").scrollTop = 0;
    }
    $("futureHint").textContent = nextEv ? FA.t("next", { t: FA.tx(nextEv, "title"), d: FA.formatRange(nextEv) }) : FA.t("the_end");
    return latest;
  };

  UI.prototype.reveal = function (id) {
    this.showTab("events");
    this.setOpen(id, true);
    this.userOpened[id] = true;
    var li = this.cards[id];
    Object.keys(this.cards).forEach(function (k) { this.cards[k].classList.toggle("sel", k === id); }, this);
    if (li && !li.hidden) li.scrollIntoView({ block: "nearest", behavior: "smooth" });
    var p = $("panel");
    if (p.classList.contains("collapsed")) { p.classList.remove("collapsed"); this.app.layoutChanged(); }
  };

  /* ---------- Flikar ---------- */
  UI.prototype.bindTabs = function () {
    var self = this;
    ["events", "tree", "about"].forEach(function (t) {
      $("tab-" + t).addEventListener("click", function () { self.showTab(t); });
    });
  };
  UI.prototype.showTab = function (t) {
    ["events", "tree", "about"].forEach(function (k) {
      $("tab-" + k).setAttribute("aria-selected", k === t ? "true" : "false");
      $("pane-" + k).hidden = k !== t;
    });
  };

  /* ---------- Legend och trädanteckningar ---------- */
  UI.prototype.buildLegend = function () {
    $("legendMini").innerHTML =
      '<span><i class="k k-ark"></i>' + kindLabel("arkeologi") + '</span><span><i class="k k-gen"></i>' + kindLabel("genetik") + "</span>" +
      '<span><i class="k k-kon"></i>' + kindLabel("kontakt") + '</span><span><i class="k k-mil"></i>' + FA.t("lg_klimat") + "</span>" +
      '<span><i class="st st-belagt"></i>' + FA.t("lg_belagt") + '</span><span><i class="st st-antytt"></i>' + FA.t("lg_antytt") +
      '</span><span><i class="st st-omstritt"></i>' + FA.t("lg_omstritt") + "</span>";
  };

  var TREE_NOTES = {
    sv: "<p><b>Två klockor.</b> Genetiken räknar bakåt från dagens och forntida arvsmassa och ser bara grupper som lämnat ättlingar. Arkeologin daterar spår i marken. De kan ge olika svar, och båda har osäkerhet. Därför säger genetikens spann för Sahuls förfäder (72 000-51 000 år sedan) inget exakt om när människor kom fram.</p>" +
      "<p><b>Lapita och papuanska anor.</b> De äldsta gravarna i Vanuatu och Tonga har nästan bara anor från Taiwan och Sydostasiens öar. I dag har folket i Vanuatu mest papuanska anor, efter ett nästan fullständigt utbyte för omkring 2 300 år sedan, men talar fortfarande austronesiska språk.</p>" +
      "<p><b>Mötet med Amerika.</b> Två genetiska studier daterar mötet olika: omkring år 1200 i östra Polynesien, före bosättningen av Rapa Nui, eller år 1250-1430 enligt forntida genom från Rapa Nui. Vem som seglade till vem framgår inte av generna.</p>" +
      "<p><b>Förenklingar.</b> Där forskningen inte daterar en linje börjar den vid en vald tidpunkt; det står i linjens anteckning (håll muspekaren över linjen).</p>",
    en: "<p><b>Two clocks.</b> Genetics counts backward from present-day and ancient genomes and only sees groups that left descendants. Archaeology dates traces in the ground. They can give different answers, and both carry uncertainty. So the genetic range for the ancestors of Sahul (72,000-51,000 years ago) says nothing exact about when people arrived.</p>" +
      "<p><b>Lapita and Papuan ancestry.</b> The oldest graves in Vanuatu and Tonga carry almost only ancestry from Taiwan and Island Southeast Asia. Today the people of Vanuatu have mostly Papuan ancestry, after a near-complete turnover about 2,300 years ago, yet still speak Austronesian languages.</p>" +
      "<p><b>The meeting with the Americas.</b> Two genetic studies date it differently: around 1200 in eastern Polynesia, before Rapa Nui was settled, or 1250-1430 according to ancient genomes from Rapa Nui. Who sailed to whom cannot be read from the genes.</p>" +
      "<p><b>Simplifications.</b> Where the research gives no date for a line, it starts at a chosen time; the line's note says so (hover over the line).</p>"
  };
  UI.prototype.buildTreeNotes = function () { $("treeNotes").innerHTML = TREE_NOTES[FA.lang] || TREE_NOTES.sv; };

  /* ---------- Om källorna ---------- */
  UI.prototype.buildAbout = function () {
    var all = {}, list = [];
    FA_EVENTS.forEach(function (ev) {
      (ev.sources || []).forEach(function (s) {
        if (!all[s.url]) { all[s.url] = { s: s, ev: [] }; list.push(all[s.url]); }
        all[s.url].ev.push(FA.tx(ev, "title"));
      });
    });
    list.sort(function (a, b) { return a.s.label.localeCompare(b.s.label, FA.lang); });
    var src = list.map(function (x) {
      return '<li><a href="' + esc(x.s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(x.s.label) + "</a> <span>(" + srcKind(x.s.kind) + "; " + esc(x.ev.join(", ")) + ")</span></li>";
    }).join("");
    var envSrc = (window.FA_ENV && FA_ENV.sea_level_source) || {};
    var seaLink = '<a href="' + esc(envSrc.url || "") + '" target="_blank" rel="noopener noreferrer">';
    var html = FA.lang === "en" ?
      "<h3>What the page shows</h3><p>The page follows how people reached Sahul (today's Australia and New Guinea) and then the islands of the Pacific, from the oldest traces the finds <i>suggest</i> to the year 1520. Two kinds of evidence are combined: archaeology (finds in the ground) and genetics (ancient and present-day genomes), with climate and sea level as background. Genetic readings have their own layers, routes and a family tree.</p>" +
      "<h3>How to read the markings</h3><ul>" +
      "<li><b>Established</b> (solid line and ring): broad support in research.</li>" +
      "<li><b>Suggested</b> (dashed): a reasonable reading, often from genetics or single finds.</li>" +
      "<li><b>Disputed</b> (dotted, with a question mark): researchers disagree on the dating or the reading. Every such card explains why.</li>" +
      "<li>Arrows and routes are teaching aids. They show a reading of direction and approximate time, not exact paths. The arrow south from Taiwan is a simplified genetic reading.</li></ul>" +
      "<h3>Where the evidence rubs</h3><p>Madjedbebe in northern Australia is dated to about 65,000 years ago, but critics think about 50,000 years is more likely. The settlement of the Mariana Islands depends on how radiocarbon dates from shells are corrected. And for Hawaii, the Society Islands and the Chatham Islands, researchers differ by a century or two.</p>" +
      "<h3>Dates</h3><p>Older times are given as calibrated years before 1950 (the standard for radiocarbon dating), rounded to \"years ago\". From year 0, years are given as CE. Ranges show uncertainty or how long something lasted. A few older sources give uncalibrated radiocarbon years; those ages were converted roughly.</p>" +
      "<h3>The map</h3><ul>" +
      "<li>Coastlines, lakes and the 200 m depth contour: Natural Earth (public domain). Some small islands are missing at this scale (for example Mangareva, Pitcairn and Mangaia); their markers still show the place.</li>" +
      "<li>Sea level: global mean curve 70,000-7,000 years ago after " + seaLink + "Spratt and Lisiecki 2016</a>. The curve runs a few meters too high near the present, so the last 7,000 years are drawn at today's level. A regional Pacific highstand of about 1-2 meters is not shown. Exposed sea floor is drawn within the 200 m depth and is approximate.</li>" +
      "<li>Ice sheets: a simplified model inherited from the exhibit The First Americans, mainly for the northern hemisphere. Glaciers in the New Guinea highlands and in Aotearoa are not drawn.</li>" +
      "<li>Sound is made in the browser with Web Audio. No audio files or external libraries are used.</li></ul>" +
      "<h3>Indigenous perspectives</h3><p>The peoples of Oceania have their own histories of origins and voyages, kept in genealogies, songs and navigation knowledge. The page shows what archaeology and genetics suggest, which is one perspective among several. Place names follow the peoples' own names where possible, such as Aotearoa, Rapa Nui and Rēkohu. Magellan's arrival in 1521 is only an end point here, not a discovery.</p>" +
      "<h3>How the page was made</h3><p>The information was gathered and checked against sources in November 2026 (last check 2026-11-22). The status of every event, route and family-tree line was then set blind by an independent reviewer and compared; differences were settled against the sources. Every card links to its sources. Event texts were written in Swedish and translated into English.</p>" +
      "<h3>All sources (" + list.length + ")</h3><ol class=\"srcs\">" + src + "</ol>"
      :
      "<h3>Vad sidan visar</h3><p>Sidan följer hur människor nådde Sahul (dagens Australien och Nya Guinea) och sedan Stilla havets öar, från de äldsta spår som fynden <i>antyder</i> till år 1520. Två slags belägg vägs samman: arkeologi (fynd i marken) och genetik (forntida och nutida arvsmassa), med klimat och havsnivå som bakgrund. Genetiska tolkningar har egna lager, rutter och ett eget släktträd.</p>" +
      "<h3>Så läser du markeringarna</h3><ul>" +
      "<li><b>Belagt</b> (heldragen linje och ring): brett stöd i forskningen.</li>" +
      "<li><b>Antytt</b> (streckad): rimlig tolkning, ofta från genetik eller enstaka fynd.</li>" +
      "<li><b>Omstritt</b> (prickad, med frågetecken): forskare är oense om datering eller tolkning. Varje sådant kort förklarar varför.</li>" +
      "<li>Pilar och rutter är pedagogiska. De visar en tolkning av riktning och ungefärlig tid, inte exakta vägar. Pilen söderut från Taiwan är en förenklad genetisk tolkning.</li></ul>" +
      "<h3>Där beläggen skaver</h3><p>Madjedbebe i norra Australien dateras till omkring 65 000 år sedan, men kritiker anser att omkring 50 000 år är troligare. Bosättningen av Marianerna beror på hur kol-14-dateringar av snäckor korrigeras. Och för Hawaii, Sällskapsöarna och Chathamöarna skiljer sig forskarna åt med ett eller två sekel.</p>" +
      "<h3>Datum</h3><p>Äldre tider anges som kalibrerade år före 1950 (standard för kol-14-datering), avrundat till \"år sedan\". Från år 0 anges årtal e.Kr. Spann visar osäkerhet eller hur länge något pågick. Några äldre källor anger okalibrerade radiokolår; de åldrarna har räknats om grovt.</p>" +
      "<h3>Kartan</h3><ul>" +
      "<li>Kustlinjer, sjöar och 200-metersdjupkurvan: Natural Earth (public domain). Några små öar saknas i den skalan (till exempel Mangareva, Pitcairn och Mangaia); markörerna visar ändå platsen.</li>" +
      "<li>Havsnivå: global medelkurva 70 000-7 000 år sedan efter " + seaLink + "Spratt och Lisiecki 2016</a>. Kurvan ligger några meter för högt nära nutid, så de senaste 7 000 åren ritas med dagens nivå. En regional topp i Stilla havet på omkring 1-2 meter visas inte. Torrlagd havsbotten ritas inom 200-metersdjupet och är ungefärlig.</li>" +
      "<li>Istäcken: en förenklad modell som ärvts från visningen De första amerikanerna, främst för norra halvklotet. Glaciärer i Nya Guineas högland och på Aotearoa ritas inte.</li>" +
      "<li>Ljudet skapas i webbläsaren med Web Audio. Inga ljudfiler eller externa bibliotek används.</li></ul>" +
      "<h3>Ursprungsfolkens perspektiv</h3><p>Folken i Oceanien har egna berättelser om ursprung och resor, bevarade i släktled, sånger och navigationskunskap. Sidan visar vad arkeologi och genetik antyder, vilket är ett perspektiv bland flera. Platsnamn följer folkens egna namn där det går, som Aotearoa, Rapa Nui och Rēkohu. Magellans ankomst 1521 är här bara en slutpunkt, ingen upptäckt.</p>" +
      "<h3>Hur sidan togs fram</h3><p>Uppgifterna samlades in och kontrollerades mot källor i november 2026 (senaste kontroll 2026-11-22). Status för varje händelse, rutt och linje i släktträdet sattes därefter blint av en oberoende granskare och jämfördes; skillnader avgjordes mot källorna. Varje kort länkar till sina källor. Händelsetexterna skrevs på svenska och översattes till engelska.</p>" +
      "<h3>Alla källor (" + list.length + ")</h3><ol class=\"srcs\">" + src + "</ol>";
    $("about").innerHTML = html;
  };

  /* ---------- HUD ---------- */
  UI.prototype.updateHud = function (bp) {
    var f = FA.formatNow(bp);
    $("nowBig").textContent = f.big;
    $("nowSmall").textContent = f.small;
    var ph = FA.climatePhase(bp);
    var chip = $("climateChip");
    chip.textContent = ph.name;
    chip.className = "chip " + (ph.tone === "warm" ? "warm" : ph.tone === "cool" ? "cool" : "");
    var sl = Math.round(FA.seaLevel(bp));
    $("seaChip").textContent = Math.abs(sl) < 2 ? FA.t("sea_now") : FA.t("sea", { v: (sl < 0 ? "-" + Math.abs(sl) : "+" + sl) });
    var idx = 0, C = FA.STORY.chapters;
    for (var i = 0; i < C.length; i++) if (bp <= C[i].from) idx = i;
    if (idx !== this.chapterIdx) {
      var changed = this.chapterIdx !== -1;
      this.chapterIdx = idx;
      $("chapterNo").textContent = FA.t("chapter_of", { n: idx + 1, m: C.length });
      $("chapterTitle").textContent = FA.tx(C[idx], "title");
      $("chapterLead").textContent = FA.tx(C[idx], "lead");
      var box = $("chapterBox");
      box.classList.remove("flash"); void box.offsetWidth; box.classList.add("flash");
      var band = $("chapterBand").children;
      for (var j = 0; j < band.length; j++) band[j].classList.toggle("on", j === idx);
      return changed;
    }
    return false;
  };

  UI.prototype.toast = function (k, t) {
    var el = $("toast");
    el.innerHTML = '<div class="t-k">' + esc(k) + '</div><div class="t-t">' + esc(t) + "</div>";
    el.classList.add("show");
    clearTimeout(this._toastT);
    this._toastT = setTimeout(function () { el.classList.remove("show"); }, 2300);
  };

  FA.UI = UI;
})(window.FA = window.FA || {});
