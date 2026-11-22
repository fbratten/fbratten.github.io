/* 2D-lager ovanpå globen: rutter, fyndplatser, etiketter och pulser. */
(function (FA) {
  "use strict";

  var TONES = {
    human: "#ffb44d",
    genetic: "#c4a3ff",
    contested: "#ff8fb8",
    arctic: "#9fdcff",
    norse: "#ff8a6a",
    pacific: "#52e3c6",
    env: "#bfe6ff"
  };
  FA.TONES = TONES;
  var KIND_COLOR = { arkeologi: "#ffb44d", genetik: "#c4a3ff", miljo: "#a8dcff", kontakt: "#52e3c6" };
  FA.KIND_COLOR = KIND_COLOR;

  function densify(waypoints) {
    var pts = [], i, k, wpIdx = [];
    for (i = 0; i < waypoints.length - 1; i++) {
      wpIdx.push(pts.length);
      var a = FA.vec(waypoints[i].lat, waypoints[i].lon), b = FA.vec(waypoints[i + 1].lat, waypoints[i + 1].lon);
      var ang = Math.acos(FA.clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
      var n = Math.max(2, Math.ceil(ang / (0.6 * Math.PI / 180)));
      for (k = 0; k < n; k++) pts.push(FA.slerp(a, b, k / n));
    }
    var last = waypoints[waypoints.length - 1];
    pts.push(FA.vec(last.lat, last.lon));
    wpIdx.push(pts.length - 1);
    var cum = [0], total = 0;
    for (i = 1; i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i];
      total += Math.acos(FA.clamp(p[0] * q[0] + p[1] * q[1] + p[2] * q[2], -1, 1));
      cum.push(total);
    }
    for (i = 0; i < cum.length; i++) cum[i] /= total || 1;
    return { pts: pts, cum: cum, len: total, wpCum: wpIdx.map(function (j) { return cum[j]; }) };
  }

  function Overlay(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hits = [];
    this.routes = [];
    this.selected = null;
    this.hover = null;
  }

  Overlay.prototype.setRoutes = function (routes) {
    this.routes = routes.map(function (r) {
      var d = densify(r.waypoints);
      var R = Object.assign({}, r, d);
      // tidpunkt (u) per waypoint: angivna bp, annars interpolerat längs rutten
      var n = r.waypoints.length, U = new Array(n);
      for (var i = 0; i < n; i++) U[i] = r.waypoints[i].bp != null ? FA.uAt(r.waypoints[i].bp) : null;
      if (U[0] == null) U[0] = FA.uAt(r.start);
      if (U[n - 1] == null) U[n - 1] = FA.uAt(r.end);
      for (var a = 0; a < n; a++) {
        if (U[a] != null) continue;
        var lo = a - 1, hi = a + 1;
        while (U[hi] == null) hi++;
        var f = (d.wpCum[a] - d.wpCum[lo]) / ((d.wpCum[hi] - d.wpCum[lo]) || 1);
        U[a] = U[lo] + (U[hi] - U[lo]) * f;
      }
      R.wpU = U;
      return R;
    });
  };

  Overlay.prototype.resize = function (w, h, dpr) {
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.w = w; this.h = h; this.dpr = dpr; FA.overlayDpr = dpr;
  };

  function vis(z) { return FA.clamp((z - 0.02) / 0.14, 0, 1); }

  Overlay.prototype.drawRoute = function (view, r, bp, uNow, t) {
    var ctx = this.ctx;
    // progress
    var U = r.wpU, u0 = U[0];
    if (uNow < u0) return;
    var p = 1;
    for (var w = 0; w < U.length - 1; w++) {
      if (uNow <= U[w + 1]) {
        var fw = FA.clamp((uNow - U[w]) / ((U[w + 1] - U[w]) || 1e-6), 0, 1);
        p = r.wpCum[w] + (r.wpCum[w + 1] - r.wpCum[w]) * fw;
        break;
      }
    }
    var fadeU = r.fade != null ? FA.uAt(r.fade) : 2;
    var life = uNow > fadeU ? FA.clamp(1 - (uNow - fadeU) / 0.06, 0.25, 1) : 1;
    var growing = p < 1;
    var color = TONES[r.tone] || TONES.human;
    var dash = r.status === "omstritt" ? [2, 6] : r.status === "antytt" ? [9, 6] : [];
    var nEnd = 0;
    while (nEnd < r.cum.length - 1 && r.cum[nEnd + 1] <= p) nEnd++;
    // bygg synliga segment
    var segs = [], cur = [];
    for (var i = 0; i <= nEnd + 1 && i < r.pts.length; i++) {
      var P = r.pts[i];
      if (i === nEnd + 1) {
        var f = (p - r.cum[nEnd]) / ((r.cum[nEnd + 1] - r.cum[nEnd]) || 1);
        P = FA.slerp(r.pts[nEnd], r.pts[nEnd + 1], FA.clamp(f, 0, 1));
      }
      var s = FA.projectVec(view, P);
      if (s.z > 0.01) cur.push(s); else if (cur.length) { segs.push(cur); cur = []; }
    }
    if (cur.length) segs.push(cur);
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    var alpha = (growing ? 1 : 0.8) * life;
    segs.forEach(function (sg) {
      if (sg.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(sg[0].x, sg[0].y);
      for (var j = 1; j < sg.length; j++) ctx.lineTo(sg[j].x, sg[j].y);
      ctx.setLineDash([]);
      ctx.strokeStyle = color; ctx.globalAlpha = 0.16 * alpha; ctx.lineWidth = 9; ctx.stroke();
      ctx.globalAlpha = 0.95 * alpha; ctx.lineWidth = 2.2; ctx.setLineDash(dash);
      ctx.lineDashOffset = -t * 14;
      ctx.stroke();
    });
    ctx.setLineDash([]);
    // spets
    var last = segs.length ? segs[segs.length - 1] : null;
    if (growing && last && last.length >= 2) {
      var a = last[last.length - 2], b = last[last.length - 1];
      var ang = Math.atan2(b.y - a.y, b.x - a.x);
      ctx.globalAlpha = life;
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(b.x + Math.cos(ang) * 9, b.y + Math.sin(ang) * 9);
      ctx.lineTo(b.x + Math.cos(ang + 2.5) * 8, b.y + Math.sin(ang + 2.5) * 8);
      ctx.lineTo(b.x + Math.cos(ang - 2.5) * 8, b.y + Math.sin(ang - 2.5) * 8);
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    }
    // vandrande ljuspunkter (riktning)
    if (r.len > 0) {
      var spacing = 0.07, speed = 0.05;
      ctx.fillStyle = "#fff";
      for (var k = 0; k < 1 / spacing; k++) {
        var fr = ((t * speed) / Math.max(0.3, r.len) + k * spacing) % 1;
        if (fr > p) continue;
        var idx = 0;
        while (idx < r.cum.length - 2 && r.cum[idx + 1] < fr) idx++;
        var ff = (fr - r.cum[idx]) / ((r.cum[idx + 1] - r.cum[idx]) || 1);
        var Pv = FA.slerp(r.pts[idx], r.pts[idx + 1], FA.clamp(ff, 0, 1));
        var sp = FA.projectVec(view, Pv);
        if (sp.z <= 0.02) continue;
        ctx.globalAlpha = 0.75 * vis(sp.z) * life;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }
    // etikett vid ruttens mitt
    if (FA.tx(r, "label") && life > 0.5) {
      var mid = r.labelAt != null ? r.labelAt : 0.5;
      if (p >= mid) {
        var mi = 0;
        while (mi < r.cum.length - 2 && r.cum[mi + 1] < mid) mi++;
        var ms = FA.projectVec(view, r.pts[mi]);
        if (ms.z > 0.1) {
          ctx.globalAlpha = 0.95 * vis(ms.z) * life;
          FA.drawTag(ctx, FA.tx(r, "label"), ms.x, ms.y, color, r.status);
        }
      }
    }
    ctx.restore();
  };

  FA.drawTag = function (ctx, text, x, y, color, status) {
    ctx.font = "600 11.5px system-ui, -apple-system, 'Segoe UI', sans-serif";
    var label = text + (status === "omstritt" ? " ?" : "");
    var w = ctx.measureText(label).width + 14;
    var bx = x + 10, by = y - 10;
    var cw = ctx.canvas.width / (FA.overlayDpr || 1);
    if (bx + w > cw - 6) bx = Math.max(6, x - 10 - w);
    if (by - 9 < 4) by = 13;
    ctx.fillStyle = "rgba(8,14,26,0.78)";
    roundRect(ctx, bx, by - 9, w, 19, 9.5); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha *= 0.9; ctx.stroke();
    ctx.fillStyle = "#eef3ff";
    ctx.fillText(label, bx + 7, by + 4.5);
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }

  function spacedText(ctx, text, x, y, spacing) {
    var total = 0, i, widths = [];
    for (i = 0; i < text.length; i++) { widths.push(ctx.measureText(text[i]).width); total += widths[i] + (i ? spacing : 0); }
    var cx = x - total / 2;
    for (i = 0; i < text.length; i++) { ctx.fillText(text[i], cx, y); cx += widths[i] + spacing; }
  }

  Overlay.prototype.drawLabels = function (view, bp) {
    var ctx = this.ctx;
    ctx.save();
    ctx.textBaseline = "middle";
    FA.STORY.labels.forEach(function (L) {
      if (L.from != null && bp > L.from) return;
      if (L.to != null && bp < L.to) return;
      var s = FA.project(view, L.lat, L.lon);
      if (s.z < 0.15) return;
      var a = vis(s.z);
      // tona in/ut nära gränserna
      // Ett namn med bara to (eller bara from) räknar spannet mot tidslinjens ände; i visning 1 gav det NaN
      var lf = L.from != null ? L.from : FA.START_BP, lt = L.to != null ? L.to : FA.END_BP;
      if (L.from != null) a *= FA.clamp((L.from - bp) / ((lf - lt) * 0.08 + 1), 0, 1);
      if (L.to != null) a *= FA.clamp((bp - L.to) / ((lf - lt) * 0.08 + 1), 0, 1);
      var size = (L.size || 13) * FA.clamp(view.R / 380, 0.62, 1.05);
      if (L.minZoom && view.zoom < L.minZoom) return;
      ctx.font = (L.italic ? "italic " : "") + (L.weight || 500) + " " + size + "px 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
      ctx.globalAlpha = a * (L.alpha || 0.78);
      ctx.fillStyle = L.color || "#f3ead6";
      ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 6;
      spacedText(ctx, FA.tx(L, "text"), s.x, s.y, (L.spacing != null ? L.spacing : size * 0.22) * FA.clamp(view.R / 380, 0.5, 1));
    });
    ctx.restore();
  };

  Overlay.prototype.drawSites = function (view, bp, uNow, t, events, filters) {
    var ctx = this.ctx, self = this;
    this.hits = [];
    ctx.save();
    events.forEach(function (ev) {
      if (ev.lat == null || ev.lon == null) return;
      if (!filters[ev.kind]) return;
      var show = ev.age_bp.show;
      if (show < bp) return;
      var s = FA.project(view, ev.lat, ev.lon);
      if (s.z < 0.02) return;
      var a = vis(s.z);
      var du = uNow - FA.uAt(show);
      var fresh = FA.clamp(1 - du / 0.03, 0, 1);
      var color = KIND_COLOR[ev.kind] || "#fff";
      var isSel = self.selected === ev.id, isHov = self.hover === ev.id;
      var r = 4.2 + fresh * 2.2 + (isSel ? 2 : 0);
      // puls
      if (fresh > 0) {
        var ph = (t * 0.9) % 1;
        ctx.globalAlpha = a * fresh * (1 - ph) * 0.9;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, r + 4 + ph * 22, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = a * (0.55 + 0.45 * Math.max(fresh, isSel || isHov ? 1 : 0.4));
      ctx.shadowColor = color; ctx.shadowBlur = 10 * (0.4 + fresh);
      ctx.fillStyle = color;
      ctx.beginPath();
      if (ev.kind === "genetik") {
        ctx.moveTo(s.x, s.y - r * 1.2); ctx.lineTo(s.x + r * 1.2, s.y); ctx.lineTo(s.x, s.y + r * 1.2); ctx.lineTo(s.x - r * 1.2, s.y);
      } else if (ev.kind === "kontakt") {
        ctx.rect(s.x - r, s.y - r, r * 2, r * 2);
      } else if (ev.kind === "miljo") {
        ctx.moveTo(s.x, s.y - r * 1.25); ctx.lineTo(s.x + r * 1.15, s.y + r * 0.85); ctx.lineTo(s.x - r * 1.15, s.y + r * 0.85);
      } else {
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      // statusring
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash(ev.status === "omstritt" ? [1.5, 2.5] : ev.status === "antytt" ? [4, 3] : []);
      ctx.beginPath(); ctx.arc(s.x, s.y, r + 3.2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      self.hits.push({ id: ev.id, x: s.x, y: s.y, r: r + 8 });
      var la = Math.max(FA.smooth((fresh - 0.3) / 0.35), isSel || isHov ? 1 : 0);
      if (la > 0.02) {
        ctx.globalAlpha = a * la;
        FA.drawTag(ctx, FA.tx(ev, "title"), s.x, s.y, color, ev.status);
      }
    });
    ctx.restore();
  };

  Overlay.prototype.drawStandstill = function (view, bp, t) {
    var S = FA.STORY.standstill;
    if (!S || bp > S.from || bp < S.to) return;
    var ctx = this.ctx;
    var s = FA.project(view, S.lat, S.lon);
    if (s.z < 0.05) return;
    var span = S.from - S.to;
    var env = FA.clamp(Math.min((S.from - bp) / (span * 0.08), (bp - S.to) / (span * 0.08)), 0, 1);
    var rad = view.R * S.radius * Math.PI / 180;
    ctx.save();
    var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad);
    var pulse = 0.85 + 0.15 * Math.sin(t * 1.6);
    // Färgen följer S.tone (i visning 1 alltid genetikens lila)
    var hex = TONES[S.tone] || TONES.genetic;
    var rgb = [1, 3, 5].map(function (i) { return parseInt(hex.substr(i, 2), 16); }).join(",");
    g.addColorStop(0, "rgba(" + rgb + "," + (0.26 * env * pulse) + ")");
    g.addColorStop(0.7, "rgba(" + rgb + "," + (0.10 * env) + ")");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, rad, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = env * vis(s.z);
    FA.drawTag(ctx, FA.tx(S, "label"), s.x - 20, s.y + rad * 0.55, hex, S.status);
    ctx.restore();
  };

  Overlay.prototype.render = function (view, bp, t, events, filters) {
    var ctx = this.ctx, dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    var uNow = FA.uAt(bp);
    if (filters.labels) this.drawLabels(view, bp);
    if (filters.routes) {
      this.drawStandstill(view, bp, t);
      for (var i = 0; i < this.routes.length; i++) {
        var r = this.routes[i];
        if (r.kind && !filters[r.kind]) continue;
        this.drawRoute(view, r, bp, uNow, t);
      }
    }
    this.drawSites(view, bp, uNow, t, events, filters);
  };

  Overlay.prototype.hitTest = function (x, y) {
    var best = null, bd = 1e9;
    for (var i = 0; i < this.hits.length; i++) {
      var h = this.hits[i], d = Math.hypot(h.x - x, h.y - y);
      if (d < h.r && d < bd) { bd = d; best = h.id; }
    }
    return best;
  };

  FA.Overlay = Overlay;
})(window.FA = window.FA || {});
