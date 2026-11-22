/* Tidsskala, formattering och miljökurvor.
   All tid lagras som kalibrerade år före 1950 (BP). Reglaget arbetar i "berättelsetid" u (0..1),
   som är styckvis linjär mot BP så att täta perioder får mer skärmtid. */
(function (FA) {
  "use strict";

  // [u, BP] - stigande u, fallande BP
  var ANCHORS = [
    [0.00, 70000],
    [0.10, 50000],
    [0.17, 40000],
    [0.25, 20000],
    [0.31, 10000],
    [0.38, 5000],
    [0.45, 3500],
    [0.58, 2700],
    [0.67, 1100],
    [0.91, 650],
    [1.00, 430]
  ];
  FA.START_BP = 70000;
  FA.END_BP = 430;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  FA.clamp = clamp;
  FA.lerp = function (a, b, t) { return a + (b - a) * t; };
  FA.smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  FA.ageAt = function (u) {
    u = clamp(u, 0, 1);
    for (var i = 1; i < ANCHORS.length; i++) {
      var a = ANCHORS[i - 1], b = ANCHORS[i];
      if (u <= b[0]) {
        var t = (u - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return FA.END_BP;
  };

  FA.uAt = function (bp) {
    bp = clamp(bp, FA.END_BP, FA.START_BP);
    for (var i = 1; i < ANCHORS.length; i++) {
      var a = ANCHORS[i - 1], b = ANCHORS[i];
      if (bp >= b[1]) {
        var t = (bp - a[1]) / (b[1] - a[1]);
        return a[0] + (b[0] - a[0]) * t;
      }
    }
    return 1;
  };

  // Tal: svenska med hårt mellanslag, engelska med komma som tusentalsavgränsare
  FA.num = function (n) {
    var s = String(Math.round(n));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, FA.lang === "en" ? "," : "\u00a0");
  };

  FA.ceOf = function (bp) { return 1950 - bp; };

  function roundAge(bp) {
    if (bp >= 20000) return Math.round(bp / 500) * 500;
    if (bp >= 5000) return Math.round(bp / 100) * 100;
    if (bp >= 2500) return Math.round(bp / 50) * 50;
    return Math.round(bp / 10) * 10;
  }

  // Huvudetikett för aktuell tid
  FA.formatNow = function (bp) {
    var en = FA.lang === "en", ce = FA.ceOf(bp);
    if (ce >= 1) {
      return en ? { big: Math.round(ce) + " CE", small: "c. " + FA.num(roundAge(bp + 75)) + " years ago" }
        : { big: "år " + Math.round(ce) + " e.Kr.", small: "ca " + FA.num(roundAge(bp + 75)) + " år sedan" };
    }
    if (bp < 2500) {
      var bce = FA.num(Math.round(-ce / 10) * 10);
      return en ? { big: "c. " + FA.num(roundAge(bp + 75)) + " years ago", small: "c. " + bce + " BCE" }
        : { big: "ca " + FA.num(roundAge(bp + 75)) + " år sedan", small: "ca " + bce + " f.Kr." };
    }
    return { big: FA.num(roundAge(bp)) + " " + FA.t("ago"), small: FA.t("cal") };
  };

  // Intervall för en händelse
  FA.formatRange = function (ev) {
    var en = FA.lang === "en";
    if (ev.ce && ev.ce.from != null) {
      if (ev.ce.to != null && ev.ce.to !== ev.ce.from) return ev.ce.from + "-" + ev.ce.to + (en ? " CE" : " e.Kr.");
      return en ? ev.ce.from + " CE" : "år " + ev.ce.from + " e.Kr.";
    }
    var a = ev.age_bp || {};
    var f = a.from, t = a.to, ago = " " + FA.t("ago"), ca = FA.t("ca") + " ";
    if (f != null && t != null && Math.abs(f - t) >= 50) return FA.num(roundAge(f)) + "-" + FA.num(roundAge(t)) + ago;
    if (a.show != null) return ca + FA.num(roundAge(a.show)) + ago;
    if (f != null) return ca + FA.num(roundAge(f)) + ago;
    return "";
  };

  /* ---- Miljökurvor (ersätts av källsatta värden från FA.ENV om de finns) ---- */
  var SEA = [
    [70000, -65], [65000, -85], [57000, -75], [50000, -70], [44000, -70], [40000, -75], [35000, -80], [30000, -90], [26000, -120], [21000, -130], [19000, -125],
    [16500, -115], [14700, -105], [14300, -85], [13000, -75], [12000, -62], [11500, -58],
    [10000, -45], [9000, -32], [8000, -18], [7000, -8], [6000, -3], [5000, -1], [0, 0]
  ];

  function curve(points, bp) {
    if (bp >= points[0][0]) return points[0][1];
    for (var i = 1; i < points.length; i++) {
      if (bp >= points[i][0]) {
        var a = points[i - 1], b = points[i];
        var t = (a[0] - bp) / (a[0] - b[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return points[points.length - 1][1];
  }
  FA.curve = curve;

  FA.seaLevel = function (bp) {
    var env = window.FA_ENV;
    var pts = (env && env.sea_level && env.sea_level.length > 3) ? env.sea_level : SEA;
    return curve(pts, bp);
  };

  // Andel av kontinentalsockeln (0-200 m) som ritas som torrlagd
  FA.shelfExposure = function (bp) {
    var m = -FA.seaLevel(bp);
    return clamp((m - 18) / 112, 0, 1);
  };

  // Beringia: hur långt (i breddgrader från sundet vid 65,8 N) landbryggan når. Ärvd från visning 1
  // och utanför den här berättelsen; före 40 000 år sedan hålls värdet konstant (inte källsatt här).
  // Landbryggan bildas ca 35 700 år sedan (Farmer, Pico m.fl. 2022) och bryts ca 11 000 år sedan (Jakobsson m.fl. 2017).
  var BRIDGE = [[40000, -0.8], [36500, -0.3], [35700, 0.6], [34000, 4], [31000, 7], [27000, 9], [23000, 10], [19000, 9.6],
    [16000, 8], [14500, 5.5], [13000, 3.2], [12000, 1.6], [11300, 0.5], [11000, -0.4], [0, -1]];
  FA.bridgeReach = function (bp) { return curve(BRIDGE, bp); };

  // 0 = dagens klimat, 1 = istidsmaximum (för landfärger och ljud)
  var GLACIAL = [[70000, 0.75], [65000, 0.8], [57000, 0.6], [50000, 0.6], [40000, 0.7], [30000, 0.8], [26000, 0.95], [21000, 1], [18000, 0.95], [16000, 0.85],
    [14700, 0.55], [13000, 0.6], [12800, 0.75], [11700, 0.7], [11000, 0.45], [9000, 0.2], [7000, 0.05], [0, 0]];
  FA.glacial = function (bp) { return curve(GLACIAL, bp); };

  // Klimatfas för etikett
  FA.climatePhase = function (bp) {
    var en = FA.lang === "en";
    if (bp > 57000) return { name: en ? "Ice Age (MIS 4)" : "Istid (MIS 4)", tone: "cold" };
    if (bp > 26500) return { name: en ? "Ice Age, milder phase (MIS 3)" : "Istid, mildare fas (MIS 3)", tone: "cool" };
    if (bp > 19000) return { name: en ? "Last Glacial Maximum" : "Istidsmaximum (LGM)", tone: "cold" };
    if (bp > 14700) return { name: en ? "Deglaciation begins" : "Avsmältningen börjar", tone: "cool" };
    if (bp > 12900) return { name: en ? "Bølling-Allerød, warm" : "Bølling-Allerød, varmt", tone: "warm" };
    if (bp > 11700) return { name: en ? "Younger Dryas, cold snap" : "Yngre dryas, bakslag", tone: "cold" };
    if (bp > 8200) return { name: en ? "Early Holocene" : "Tidig holocen", tone: "warm" };
    if (bp > 1200) return { name: en ? "Holocene" : "Holocen", tone: "warm" };
    return { name: en ? "Late Holocene" : "Sen holocen", tone: "warm" };
  };
})(window.FA = window.FA || {});
