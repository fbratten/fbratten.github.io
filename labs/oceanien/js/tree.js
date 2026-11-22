/* Genetiskt släktträd som växer med tiden. x-axeln följer samma berättelsetid som reglaget. */
(function (FA) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function dashOf(status) { return status === "omstritt" ? "2 5" : status === "antytt" ? "8 5" : ""; }

  function Tree(host) {
    this.host = host;
    this.W = 380; this.H = 420;
    this.padL = 8; this.padR = 10; this.top = 32; this.rowH = 30;
    this.build();
  }

  Tree.prototype.x = function (bp) {
    return this.padL + FA.uAt(bp) * (this.W - this.padL - this.padR);
  };
  Tree.prototype.y = function (row) { return this.top + row * this.rowH; };

  Tree.prototype.build = function () {
    var T = FA.TREE, self = this;
    var rows = 0;
    T.lineages.forEach(function (l) { rows = Math.max(rows, l.row); });
    this.H = this.top + (rows + 1) * this.rowH + 26;
    var svg = this.svg = el("svg", { viewBox: "0 0 " + this.W + " " + this.H, class: "tree-svg", role: "img",
      "aria-label": FA.t("tree_aria") });
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: "fa_arrow", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", fill: "#f1e6cf" }, mk);
    // tidsaxel
    var axis = el("g", { class: "tree-axis" }, svg);
    [70000, 50000, 40000, 20000, 10000, 5000, 3500, 2700, 1100, 650].forEach(function (bp) {
      var x = self.x(bp);
      el("line", { x1: x, x2: x, y1: 18, y2: self.H - 22, class: "tree-grid" }, axis);
      var t = el("text", { x: x, y: self.H - 8, class: "tree-tick", "text-anchor": "middle" }, axis);
      t.textContent = bp >= 2000 ? (bp / 1000) + "k" : (1950 - bp) + "";
      if (bp === 50000 || bp === 3500) t.style.display = "none";
    });
    var cap = el("text", { x: this.W - this.padR, y: 12, class: "tree-tick", "text-anchor": "end" }, svg);
    cap.textContent = FA.t("tree_cap");
    this.gLines = el("g", {}, svg);
    this.gAdmix = el("g", {}, svg);
    this.gLabels = el("g", {}, svg);
    this.cursor = el("line", { y1: 18, y2: this.H - 22, class: "tree-cursor" }, svg);

    this.items = [];
    T.lineages.forEach(function (l) {
      var parent = l.parent ? T.lineages.filter(function (p) { return p.id === l.parent; })[0] : null;
      var x0 = self.x(l.from), y = self.y(l.row);
      var path = el("path", { class: "tree-line", stroke: l.color, "stroke-dasharray": dashOf(l.status), fill: "none" }, self.gLines);
      var label = el("text", { class: "tree-label", fill: l.color }, self.gLabels);
      label.textContent = FA.tx(l, "label");
      var title = el("title", {}, path); title.textContent = FA.tx(l, "label") + (FA.tx(l, "note") ? ": " + FA.tx(l, "note") : "");
      var dot = parent ? el("circle", { r: 3.4, cx: x0, cy: self.y(parent.row), fill: l.color, class: "tree-node" }, self.gLines) : null;
      self.items.push({ l: l, parent: parent, path: path, label: label, dot: dot, x0: x0, y: y });
    });
    (T.admixtures || []).forEach(function (a) {
      var from = T.lineages.filter(function (p) { return p.id === a.from; })[0];
      var to = T.lineages.filter(function (p) { return p.id === a.to; })[0];
      if (!from || !to) return;
      var x = self.x(a.bp), y1 = self.y(from.row), y2 = self.y(to.row);
      var p = el("path", { d: "M" + x + " " + y1 + " C" + (x + 18) + " " + (y1 + (y2 - y1) * 0.3) + " " + (x + 18) + " " + (y1 + (y2 - y1) * 0.7) + " " + (x + 2) + " " + (y2 + (y2 > y1 ? -4 : 4)),
        class: "tree-admix", "stroke-dasharray": dashOf(a.status) || "", "marker-end": "url(#fa_arrow)" }, self.gAdmix);
      var tl = el("title", {}, p); tl.textContent = FA.tx(a, "label");
      var lab = el("text", { x: x + 22, y: (y1 + y2) / 2 + 3, class: "tree-admix-label" }, self.gAdmix);
      lab.textContent = FA.tx(a, "label") + (a.status === "omstritt" ? " ?" : "");
      self.items.push({ admix: a, el: p, lab: lab });
    });
    this.host.innerHTML = "";
    this.host.appendChild(svg);
  };

  Tree.prototype.update = function (bp) {
    var xNow = this.x(bp), self = this;
    this.cursor.setAttribute("x1", xNow); this.cursor.setAttribute("x2", xNow);
    this.items.forEach(function (it) {
      if (it.admix) {
        var on = bp <= it.admix.bp;
        it.el.style.opacity = on ? 1 : 0;
        it.lab.style.opacity = on ? 0.9 : 0;
        return;
      }
      var l = it.l;
      if (bp > l.from) {
        it.path.setAttribute("d", ""); it.label.style.opacity = 0; if (it.dot) it.dot.style.opacity = 0;
        return;
      }
      var xEnd = Math.min(xNow, self.x(l.to != null ? l.to : FA.END_BP));
      var d;
      if (it.parent) {
        var py = self.y(it.parent.row), x0 = it.x0;
        var bend = Math.min(26, Math.max(4, xEnd - x0));
        d = "M" + x0 + " " + py + " C" + (x0 + bend * 0.6) + " " + py + " " + (x0 + bend * 0.3) + " " + it.y + " " + (x0 + bend) + " " + it.y;
        if (xEnd > x0 + bend) d += " L" + xEnd + " " + it.y;
        it.dot.style.opacity = 1;
      } else {
        d = "M" + it.x0 + " " + it.y + " L" + Math.max(it.x0 + 0.1, xEnd) + " " + it.y;
      }
      it.path.setAttribute("d", d);
      var ended = l.to != null && bp < l.to && l.to > FA.END_BP;
      it.path.style.opacity = ended ? 0.55 : 1;
      var late = it.x0 > self.W * 0.55;
      var lx = late ? Math.min(Math.max(xEnd, it.x0 + 30), self.W - self.padR) : it.x0 + (it.parent ? 30 : 4);
      it.label.setAttribute("x", lx);
      it.label.setAttribute("y", it.y - 6);
      it.label.setAttribute("text-anchor", late ? "end" : "start");
      it.label.style.opacity = 1;
      it.label.textContent = FA.tx(l, "label") + (ended && FA.tx(l, "endLabel") ? " (" + FA.tx(l, "endLabel") + ")" : "") + (l.status === "omstritt" ? " ?" : "");
    });
  };

  FA.Tree = Tree;
})(window.FA = window.FA || {});
