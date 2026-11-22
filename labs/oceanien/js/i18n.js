/* Språk: svenska och engelska. Väljs med ?lang=sv|en, annars sparat val, annars webbläsarens språk. */
(function (FA) {
  "use strict";

  var STR = {
    sv: {
      doc_title: "Oceaniens folk - hur människor nådde Stilla havets öar, från istid till år 1520",
      doc_desc: "Interaktiv glob och tidslinje: hur människor nådde Australien, Nya Guinea och Stilla havets öar enligt arkeologi och genetik, från de äldsta omstridda spåren till år 1520.",
      h1: "Oceaniens folk",
      sub: "Hur människor nådde Stilla havets öar, från istid till år 1520",
      nogl: "Den här webbläsaren kan inte visa globen (WebGL saknas). Tidslinjen, händelserna och släktträdet fungerar ändå.",
      panel_aria: "Händelser, släktträd och källor",
      grip_aria: "Visa eller dölj panelen",
      tab_events: "Händelser", tab_tree: "Släktträd", tab_about: "Om källorna",
      tree_intro: "Släktträdet bygger på forntida och nutida arvsmassa. Linjerna växer fram i takt med tiden. Pilar visar inblandning mellan grupper. Heldragen linje = belagt, streckad = antytt, prickad = omstritt.",
      play: "Spela upp", pause: "Pausa", time: "Tid", speed: "Uppspelningshastighet", sound: "Ljud", layers: "Lager",
      follow: "Följ", follow_aria: "Följ berättelsen", lang_btn: "EN", lang_aria: "Switch to English",
      layers_title: "Visa på kartan", l_ark: "Arkeologi", l_gen: "Genetik", l_kon: "Kontakter", l_mil: "Klimat och miljö",
      l_routes: "Rutter och pilar", l_ice: "Istäcken", l_labels: "Namn på kartan", l_grid: "Gradnät", l_dwell: "Sakta in vid händelser",
      intro_title: "Hur nådde människorna Stilla havets öar?",
      intro_p: "Följ 70 000 år på en glob. Haven sjunker och stiger, land växer ihop och delas, och fynd och arvsmassa berättar hur människor tog sig över allt större hav.",
      key_b: "<b>Belagt</b>: brett stöd i forskningen.",
      key_a: "<b>Antytt</b>: rimlig tolkning, ofta från genetik eller enstaka fynd.",
      key_o: "<b>Omstritt</b>: forskare är oense om datering eller tolkning.",
      start: "Starta resan", explore: "Utforska själv",
      intro_note: "Ljud skapas i webbläsaren. Mellanslag spelar och pausar, piltangenterna hoppar mellan händelser.",
      chapter_of: "Kapitel {n} av {m}", chapter: "Kapitel {n}",
      kind_arkeologi: "Arkeologi", kind_genetik: "Genetik", kind_miljo: "Klimat och miljö", kind_kontakt: "Kontakt",
      st_belagt: "Belagt", st_antytt: "Antytt", st_omstritt: "Omstritt",
      lg_belagt: "belagt", lg_antytt: "antytt", lg_omstritt: "omstritt", lg_klimat: "Klimat",
      src_primar: "forskningsartikel", src_oversikt: "översikt", src_nyhet: "nyhet",
      why: "Varför det spelar roll", disputed_why: "Därför är det omstritt", uncertainty: "Osäkerhet",
      show_map: "Visa på kartan", goto_time: "Gå till tidpunkten",
      next: "Nästa: {t} ({d})", the_end: "Slutet av tidslinjen.", new_event: "Ny händelse: {t}, {d}",
      sea_now: "Havsnivå nära dagens", sea: "Havsnivå {v} m", sea_title: "Havsnivå jämfört med i dag (global medelnivå, förenklad kurva)",
      tree_aria: "Genetiskt släktträd för folken i Oceanien, som växer med tiden",
      tree_cap: "k = tusental år sedan, 850 = år e.Kr.",
      ago: "år sedan", cal: "kalibrerade år före 1950", ce: "e.Kr.", bce: "f.Kr.", year: "år", ca: "ca"
    },
    en: {
      doc_title: "The Peoples of Oceania - how people reached the islands of the Pacific, from the Ice Age to 1520",
      doc_desc: "Interactive globe and timeline: how people reached Australia, New Guinea and the islands of the Pacific according to archaeology and genetics, from the oldest disputed traces to the year 1520.",
      h1: "The Peoples of Oceania",
      sub: "How people reached the islands of the Pacific, from the Ice Age to 1520",
      nogl: "This browser cannot show the globe (WebGL is missing). The timeline, events and family tree still work.",
      panel_aria: "Events, family tree and sources",
      grip_aria: "Show or hide the panel",
      tab_events: "Events", tab_tree: "Family tree", tab_about: "About the sources",
      tree_intro: "The family tree is based on ancient and present-day genomes. The lines grow as time passes. Arrows show mixing between groups. Solid line = established, dashed = suggested, dotted = disputed.",
      play: "Play", pause: "Pause", time: "Time", speed: "Playback speed", sound: "Sound", layers: "Layers",
      follow: "Follow", follow_aria: "Follow the story", lang_btn: "SV", lang_aria: "Byt till svenska",
      layers_title: "Show on the map", l_ark: "Archaeology", l_gen: "Genetics", l_kon: "Contacts", l_mil: "Climate and environment",
      l_routes: "Routes and arrows", l_ice: "Ice sheets", l_labels: "Map names", l_grid: "Graticule", l_dwell: "Slow down at events",
      intro_title: "How did people reach the islands of the Pacific?",
      intro_p: "Follow 70,000 years on a globe. Seas fall and rise, land joins and splits, and finds and genomes tell how people crossed ever wider seas.",
      key_b: "<b>Established</b>: broad support in research.",
      key_a: "<b>Suggested</b>: a reasonable reading, often from genetics or single finds.",
      key_o: "<b>Disputed</b>: researchers disagree on the dating or the reading.",
      start: "Start the journey", explore: "Explore on your own",
      intro_note: "Sound is made in the browser. Space plays and pauses, the arrow keys jump between events.",
      chapter_of: "Chapter {n} of {m}", chapter: "Chapter {n}",
      kind_arkeologi: "Archaeology", kind_genetik: "Genetics", kind_miljo: "Climate and environment", kind_kontakt: "Contact",
      st_belagt: "Established", st_antytt: "Suggested", st_omstritt: "Disputed",
      lg_belagt: "established", lg_antytt: "suggested", lg_omstritt: "disputed", lg_klimat: "Climate",
      src_primar: "research article", src_oversikt: "review", src_nyhet: "news",
      why: "Why it matters", disputed_why: "Why it is disputed", uncertainty: "Uncertainty",
      show_map: "Show on map", goto_time: "Go to this time",
      next: "Next: {t} ({d})", the_end: "End of the timeline.", new_event: "New event: {t}, {d}",
      sea_now: "Sea level near today's", sea: "Sea level {v} m", sea_title: "Sea level compared with today (global mean, simplified curve)",
      tree_aria: "Genetic family tree of the peoples of Oceania, growing with time",
      tree_cap: "k = thousand years ago, 850 = year CE",
      ago: "years ago", cal: "calibrated years before 1950", ce: "CE", bce: "BCE", year: "year", ca: "c."
    }
  };
  FA.STR = STR;

  function pick() {
    var m = /[?&]lang=(sv|en)\b/.exec(location.search);
    if (m) return m[1];
    try { var s = localStorage.getItem("fa-lang"); if (s === "sv" || s === "en") return s; } catch (e) { /* ingen lagring */ }
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "sv";
    return /^(sv|no|nb|nn|da|fi)/i.test(nav) ? "sv" : "en";
  }
  FA.lang = pick();

  FA.t = function (key, vars) {
    var s = (STR[FA.lang] && STR[FA.lang][key]);
    if (s == null) s = STR.sv[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
    return s;
  };
  // Text ur ett dataobjekt: fältet med _en om engelska och om det finns, annars _sv eller utan suffix
  FA.tx = function (obj, field) {
    if (!obj) return "";
    if (FA.lang === "en") {
      var en = obj[field + "_en"];
      if (en != null && en !== "") return en;
    }
    var sv = obj[field + "_sv"];
    return sv != null ? sv : (obj[field] != null ? obj[field] : "");
  };

  FA.setLang = function (lang) {
    FA.lang = lang;
    try { localStorage.setItem("fa-lang", lang); } catch (e) { /* ingen lagring */ }
    try {
      var url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url.pathname + url.search + location.hash);
    } catch (e) { /* file:// eller sandlåda */ }
    FA.applyStatic();
  };

  // Statisk text i HTML: data-i18n (text), data-i18n-html (html), data-i18n-aria, data-i18n-title
  FA.applyStatic = function () {
    document.documentElement.lang = FA.lang;
    document.title = FA.t("doc_title");
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", FA.t("doc_desc"));
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = FA.t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { el.innerHTML = FA.t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", FA.t(el.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) { el.setAttribute("title", FA.t(el.dataset.i18nTitle)); });
  };
})(window.FA = window.FA || {});
