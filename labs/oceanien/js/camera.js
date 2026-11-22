/* Kamera: ortografisk glob. Berättelsekamera styrd av tiden, eller fri kamera när användaren drar. */
(function (FA) {
  "use strict";
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;

  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function toLatLon(v) { return { lat: Math.asin(FA.clamp(v[2], -1, 1)) * R2D, lon: Math.atan2(v[1], v[0]) * R2D }; }
  function slerp(a, b, t) {
    var d = FA.clamp(dot(a, b), -1, 1);
    var om = Math.acos(d);
    if (om < 1e-5) return a.slice();
    var s = Math.sin(om);
    var k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
    return norm([a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]);
  }
  FA.slerp = slerp;
  FA.toLatLon = toLatLon;

  FA.basis = function (lat, lon) {
    var F = FA.vec(lat, lon);
    var E = [-Math.sin(lon * D2R), Math.cos(lon * D2R), 0];
    var N = FA.cross(F, E);
    return { F: F, E: E, N: N };
  };

  // Projicera lat/lon till skärm (css px). z > 0 = synlig sida.
  FA.project = function (view, lat, lon) {
    var W = FA.vec(lat, lon), b = view.basis;
    var x = dot(W, b.E), y = dot(W, b.N), z = dot(W, b.F);
    return { x: view.cx + x * view.R, y: view.cy - y * view.R, z: z };
  };
  FA.projectVec = function (view, W) {
    var b = view.basis;
    return { x: view.cx + dot(W, b.E) * view.R, y: view.cy - dot(W, b.N) * view.R, z: dot(W, b.F) };
  };
  // Skärm till lat/lon (eller null utanför globen)
  FA.unproject = function (view, sx, sy) {
    var x = (sx - view.cx) / view.R, y = -(sy - view.cy) / view.R;
    var r2 = x * x + y * y;
    if (r2 > 1) return null;
    var z = Math.sqrt(1 - r2), b = view.basis;
    var W = [x * b.E[0] + y * b.N[0] + z * b.F[0], x * b.E[1] + y * b.N[1] + z * b.F[1], x * b.E[2] + y * b.N[2] + z * b.F[2]];
    return toLatLon(W);
  };

  function Camera() {
    this.mode = "story";
    this.cur = { v: FA.vec(-8, 135), zoom: 1.2 };
    this.manual = { v: FA.vec(-8, 135), zoom: 1.2 };
    this.blend = 1; // 1 = helt berättelse
  }

  Camera.prototype.storyTarget = function (bp) {
    var K = FA.STORY.camera;
    if (bp >= K[0].bp) return { v: FA.vec(K[0].lat, K[0].lon), zoom: K[0].zoom };
    for (var i = 1; i < K.length; i++) {
      if (bp >= K[i].bp) {
        var a = K[i - 1], b = K[i];
        var ua = FA.uAt(a.bp), ub = FA.uAt(b.bp), uu = FA.uAt(bp);
        var t = FA.smooth((uu - ua) / ((ub - ua) || 1));
        return {
          v: slerp(FA.vec(a.lat, a.lon), FA.vec(b.lat, b.lon), t),
          zoom: Math.exp(FA.lerp(Math.log(a.zoom), Math.log(b.zoom), t))
        };
      }
    }
    var L = K[K.length - 1];
    return { v: FA.vec(L.lat, L.lon), zoom: L.zoom };
  };

  Camera.prototype.update = function (bp, dt, instant) {
    var target;
    if (this.mode === "story") {
      target = this.storyTarget(bp);
      if (this.blend < 1) {
        this.blend = Math.min(1, this.blend + dt / 1.4);
        var t = FA.smooth(this.blend);
        target = { v: slerp(this.manual.v, target.v, t), zoom: Math.exp(FA.lerp(Math.log(this.manual.zoom), Math.log(target.zoom), t)) };
      }
    } else {
      target = this.manual;
    }
    if (instant) { this.cur = { v: target.v.slice(), zoom: target.zoom }; return; }
    var k = 1 - Math.exp(-dt * 5);
    this.cur = { v: slerp(this.cur.v, target.v, k), zoom: Math.exp(FA.lerp(Math.log(this.cur.zoom), Math.log(target.zoom), k)) };
  };

  Camera.prototype.toManual = function () {
    if (this.mode !== "manual") {
      this.manual = { v: this.cur.v.slice(), zoom: this.cur.zoom };
      this.mode = "manual";
    }
  };
  Camera.prototype.toStory = function () {
    if (this.mode === "manual") {
      this.manual = { v: this.cur.v.slice(), zoom: this.cur.zoom };
      this.mode = "story";
      this.blend = 0;
    }
  };
  Camera.prototype.flyTo = function (lat, lon, zoom) {
    this.toManual();
    this.manual = { v: FA.vec(lat, lon), zoom: zoom || Math.max(this.cur.zoom, 2.2) };
  };
  Camera.prototype.drag = function (dx, dy, R) {
    this.toManual();
    var ll = toLatLon(this.manual.v);
    var lat = FA.clamp(ll.lat + (dy / R) * R2D, -85, 85);
    var lon = ll.lon - (dx / R) * R2D / Math.max(0.2, Math.cos(ll.lat * D2R));
    this.manual.v = FA.vec(lat, lon);
    this.cur.v = this.manual.v.slice();
  };
  Camera.prototype.zoomBy = function (f) {
    this.toManual();
    this.manual.zoom = FA.clamp(this.manual.zoom * f, 0.55, 9);
  };

  // Bygger vy-objektet för aktuell ram
  Camera.prototype.view = function (area) {
    var ll = toLatLon(this.cur.v);
    var base = (area.w < 700 ? 0.5 : 0.47) * Math.min(area.w, area.h);
    return {
      lat: ll.lat, lon: ll.lon, zoom: this.cur.zoom,
      cx: area.x + area.w / 2, cy: area.y + area.h / 2,
      R: base * this.cur.zoom,
      basis: FA.basis(ll.lat, ll.lon)
    };
  };

  FA.Camera = Camera;
})(window.FA = window.FA || {});
