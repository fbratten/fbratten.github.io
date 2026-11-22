/* WebGL-glob utan bibliotek.
   Bygger en ekvirektangulär masktextur ur Natural Earth-ringarna (R = land, G = djuphav > 200 m,
   B = Beringias landbrygga) och en istextur (yttre isgräns vid istidsmaximum). En fragmentshader
   ritar varje pixel ortografiskt, så horisonten klipps exakt. */
(function (FA) {
  "use strict";

  var VS = [
    "attribute vec2 aPos;",
    "uniform vec2 uRes;",
    "varying vec2 vPx;",
    "void main(){",
    "  vPx = vec2((aPos.x*0.5+0.5)*uRes.x, (0.5-aPos.y*0.5)*uRes.y);",
    "  gl_Position = vec4(aPos,0.0,1.0);",
    "}"
  ].join("\n");

  function fragmentSource(hasDeriv, hasLod) {
    return [
      hasDeriv ? "#extension GL_OES_standard_derivatives : enable" : "",
      hasLod ? "#extension GL_EXT_shader_texture_lod : enable" : "",
      "precision highp float;",
      "#define HAS_DERIV " + (hasDeriv ? 1 : 0),
      "#define HAS_LOD " + (hasLod ? 1 : 0),
      "varying vec2 vPx;",
      "uniform vec2 uCenter; uniform float uR; uniform float uDpr;",
      "uniform vec3 uE; uniform vec3 uN; uniform vec3 uF;",
      "uniform sampler2D uMask; uniform sampler2D uEnv;",
      "uniform float uExposure; uniform float uBridge; uniform float uGlacial; uniform float uIceOn; uniform float uGrid;",
      "uniform vec4 uDC[16]; uniform vec4 uDT[16]; uniform vec4 uDS[16];",
      "const float PI = 3.14159265;",
      "float hash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }",
      "float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);",
      "  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),",
      "             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }",
      "float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }",
      "float fw(float v){",
      "#if HAS_DERIV",
      "  return fwidth(v);",
      "#else",
      "  return 0.02;",
      "#endif",
      "}",
      "float aa(float v, float e){ float w = fw(v)*0.7 + 0.0005; return smoothstep(e-w, e+w, v); }",
      "vec4 tex(sampler2D s, vec2 uv, vec2 gx, vec2 gy){",
      "#if HAS_LOD",
      "  return texture2DGradEXT(s, uv, gx, gy);",
      "#else",
      "  return texture2D(s, uv);",
      "#endif",
      "}",
      "void main(){",
      "  vec2 p = (vPx - uCenter) / uR; p.y = -p.y;",
      "  float r = length(p);",
      "  vec2 sp = floor(vPx / (1.6*uDpr));",
      "  float star = step(0.9975, hash(vec3(sp, 7.0))) * (0.25 + 0.75*hash(vec3(sp, 3.0)));",
      "  vec3 space = vec3(0.010,0.016,0.032) + vec3(0.025,0.035,0.07)*(1.0 - smoothstep(0.6, 2.6, r));",
      "  if (r > 1.0) {",
      "    float d = r - 1.0;",
      "    float glow = exp(-d*22.0)*0.55 + exp(-d*5.0)*0.10;",
      "    vec3 c = space + star*vec3(0.75,0.82,1.0)*clamp(1.0-glow*2.0,0.0,1.0) + vec3(0.22,0.47,0.95)*glow;",
      "    gl_FragColor = vec4(c, 1.0); return;",
      "  }",
      "  float z = sqrt(max(0.0, 1.0 - r*r));",
      "  vec3 W = normalize(p.x*uE + p.y*uN + z*uF);",
      "  float lat = asin(clamp(W.z, -1.0, 1.0));",
      "  float lon = atan(W.y, W.x);",
      "  vec2 uv = vec2(lon/(2.0*PI) + 0.5, 0.5 - lat/PI);",
      "  vec2 gx = vec2(0.0), gy = vec2(0.0);",
      "#if HAS_DERIV",
      "  float dlx = dFdx(lon), dly = dFdy(lon);",
      "  if (dlx > PI) dlx -= 2.0*PI; if (dlx < -PI) dlx += 2.0*PI;",
      "  if (dly > PI) dly -= 2.0*PI; if (dly < -PI) dly += 2.0*PI;",
      "  gx = vec2(dlx/(2.0*PI), -dFdx(lat)/PI); gy = vec2(dly/(2.0*PI), -dFdy(lat)/PI);",
      "#endif",
      "  vec4 m = tex(uMask, uv, gx, gy);",
      "  float land = aa(m.r, 0.5);",
      "  float deep = aa(m.g, 0.5);",
      "  float bridgeM = aa(m.b, 0.5);",
      "  float prox = tex(uMask, uv, gx*14.0 + vec2(0.0015,0.0), gy*14.0 + vec2(0.0,0.0015)).g;",
      "  float latD = degrees(lat), absLat = abs(latD);",
      "  float nz = fbm(W*9.0);",
      // land
      "  vec3 lc = vec3(0.27,0.42,0.25);",
      "  lc = mix(lc, vec3(0.66,0.58,0.41), 0.75*smoothstep(12.0, 22.0, absLat));",
      "  lc = mix(lc, vec3(0.53,0.54,0.39), smoothstep(30.0, 40.0, absLat));",
      "  lc = mix(lc, vec3(0.40,0.47,0.35), smoothstep(46.0, 54.0, absLat));",
      "  lc = mix(lc, vec3(0.66,0.66,0.60), smoothstep(64.0, 72.0, absLat));",
      "  lc = mix(lc, vec3(0.63,0.61,0.49), uGlacial*0.7*smoothstep(28.0, 50.0, absLat));",
      "  lc *= 0.84 + 0.30*nz;",
      // sea and shelf
      "  vec3 deepCol = mix(vec3(0.018,0.070,0.140), vec3(0.030,0.105,0.190), nz);",
      "  vec3 shelfSea = mix(vec3(0.06,0.22,0.30), vec3(0.09,0.29,0.37), nz);",
      "  vec3 dry = vec3(0.56,0.56,0.43)*(0.86 + 0.26*nz);",
      // Tröskeln hålls över 0: mitt i breda grunda sockelhav är prox nära 0, och i visning 1 blev de då
      // halvt torrlagda även vid dagens havsnivå (syntes över Sunda- och Sahulsockeln i Oceanien)
      "  float pth = max(prox, 0.07);",
      "  float exG = smoothstep(pth - 0.06, pth + 0.06, uExposure);",
      "  float exB = smoothstep(-0.35, 0.35, uBridge - abs(latD - 65.8));",
      "  float expo = mix(exG, exB, bridgeM);",
      "  vec3 shelf = mix(shelfSea, dry, expo);",
      "  float coastShelf = (1.0 - smoothstep(0.0, 0.18, abs(expo - 0.5)))*(1.0-deep)*0.0;",
      "  vec3 col = mix(shelf, deepCol, deep);",
      "  col = mix(col, lc, land);",
      // coastline
      "  float coast = clamp(aa(m.r, 0.40) - aa(m.r, 0.60), 0.0, 1.0);",
      "  col = mix(col, vec3(0.86,0.80,0.64), coast*0.35);",
      "  float dryEdge = (1.0-land)*(1.0-deep)*clamp(1.0 - abs(expo-0.5)*7.0, 0.0, 1.0);",
      "  col = mix(col, vec3(0.80,0.76,0.60), dryEdge*0.25);",
      // ice
      "  float qn = 1.0 + 0.30*(fbm(W*7.0 + 11.3) - 0.5);",
      "  float acc = 0.0;",
      "  for (int i = 0; i < 16; i++) {",
      "    vec4 c = uDC[i];",
      "    if (c.w < 0.5) continue;",
      "    if (dot(W, c.xyz) <= 0.0) continue;",
      "    float u = dot(W, uDT[i].xyz) / uDT[i].w;",
      "    float v = dot(W, uDS[i].xyz) / uDS[i].w;",
      "    float f = 1.0 - sqrt(u*u + v*v)*qn;",
      "    acc += exp(max(f, -4.0) / 0.14);",
      "  }",
      "  float field = acc > 0.0 ? 0.14*log(acc) : -4.0;",
      "  float env = tex(uEnv, uv, gx, gy).r;",
      "  float iN = (fbm(W*13.0 + 3.7) - 0.5)*0.26;",
      "  float iceS = min((env - 0.5)*5.0 + iN*0.6, field*3.2 + iN);",
      "  float ice = aa(iceS, 0.0) * uIceOn;",
      "  vec3 iceCol = mix(vec3(0.78,0.86,0.93), vec3(0.97,0.985,1.0), smoothstep(0.0, 0.7, iceS));",
      "  iceCol *= 0.95 + 0.07*fbm(W*26.0);",
      "  float iceEdge = 1.0 - smoothstep(0.0, 0.14, iceS);",
      "  iceCol = mix(iceCol, vec3(0.58,0.72,0.86), iceEdge*0.55);",
      "  col = mix(col, iceCol, ice);",
      // graticule
      "  float lonD = degrees(lon);",
      "  float gLat = abs(fract(latD/15.0 + 0.5) - 0.5)*15.0;",
      "  float gLon = abs(fract(lonD/15.0 + 0.5) - 0.5)*15.0*cos(lat);",
      "#if HAS_DERIV",
      "  float wl = length(vec2(dFdx(latD), dFdy(latD)))*0.9 + 0.001;",
      "#else",
      "  float wl = 0.05;",
      "#endif",
      "  float grid = max(1.0 - smoothstep(0.0, wl, gLat), (1.0 - smoothstep(0.0, wl, gLon))*step(absLat, 80.0));",
      "  col = mix(col, vec3(0.75,0.85,1.0), grid*uGrid*0.10);",
      // light
      "  vec3 nrm = vec3(p.x, p.y, z);",
      "  vec3 L = normalize(vec3(-0.45, 0.55, 0.70));",
      "  float dif = 0.60 + 0.40*max(dot(nrm, L), 0.0);",
      "  col *= dif;",
      "  float water = (1.0-land)*(1.0-ice)*(1.0 - expo*(1.0-deep));",
      "  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));",
      "  col += pow(max(dot(nrm, H), 0.0), 70.0)*0.18*water*vec3(0.75,0.88,1.0);",
      "  float rim = pow(1.0 - z, 2.4);",
      "  col = mix(col, vec3(0.30,0.55,1.0), rim*0.42);",
      "  gl_FragColor = vec4(col, 1.0);",
      "}"
    ].join("\n");
  }

  function decodeRings(str, q) {
    var rings = [];
    if (!str) return rings;
    var parts = str.split(";");
    for (var i = 0; i < parts.length; i++) {
      var nums = parts[i].split(",");
      var x = +nums[0], y = +nums[1];
      var ring = new Float32Array(nums.length);
      ring[0] = x / q; ring[1] = y / q;
      for (var k = 2; k < nums.length; k += 2) {
        x += +nums[k]; y += +nums[k + 1];
        ring[k] = x / q; ring[k + 1] = y / q;
      }
      rings.push(ring);
    }
    return rings;
  }
  FA.decodeRings = decodeRings;

  function pathRings(ctx, rings, W, H) {
    ctx.beginPath();
    for (var i = 0; i < rings.length; i++) {
      var r = rings[i];
      ctx.moveTo((r[0] + 180) / 360 * W, (90 - r[1]) / 180 * H);
      for (var k = 2; k < r.length; k += 2) ctx.lineTo((r[k] + 180) / 360 * W, (90 - r[k + 1]) / 180 * H);
      ctx.closePath();
    }
  }

  // Beringias sockel (grovt område där landbryggan ritas med egen tidskurva)
  var BRIDGE_POLY = [[51.5, 160], [57, 160], [62, 163], [66, 168], [71, 172], [74.5, 178], [74.5, -168],
    [72.5, -158], [71.5, -152], [68.5, -160], [64, -158], [59, -156], [56.5, -160], [54.5, -166], [52.5, -175], [51.5, 172]];

  function buildMaskCanvas(W, H) {
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    var geo = window.FA_GEO, q = geo.meta.q;
    ctx.globalCompositeOperation = "lighter";
    pathRings(ctx, decodeRings(geo.deep, q), W, H);
    ctx.fillStyle = "rgb(0,255,0)"; ctx.fill("evenodd");
    pathRings(ctx, decodeRings(geo.land, q), W, H);
    ctx.fillStyle = "rgb(255,0,0)"; ctx.fill("evenodd");
    // Beringia-polygonen korsar datumgränsen: rita den i två varv
    ctx.fillStyle = "rgb(0,0,255)";
    for (var shift = -360; shift <= 0; shift += 360) {
      ctx.beginPath();
      BRIDGE_POLY.forEach(function (pt, i) {
        var lon = pt[1] < 0 ? pt[1] + 360 : pt[1];
        var x = (lon + shift + 180) / 360 * W, y = (90 - pt[0]) / 180 * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.fill();
    }
    ctx.globalCompositeOperation = "difference";
    pathRings(ctx, decodeRings(geo.lakes, q), W, H);
    ctx.fillStyle = "rgb(255,0,0)"; ctx.fill("evenodd");
    ctx.globalCompositeOperation = "source-over";
    return cv;
  }

  function buildEnvelope(W, H) {
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    FA.ICE_ENVELOPE.forEach(function (poly) {
      ctx.beginPath();
      poly.forEach(function (pt, i) {
        var x = (pt[1] + 180) / 360 * W, y = (90 - pt[0]) / 180 * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.fill();
    });
    var img = ctx.getImageData(0, 0, W, H).data;
    var a = new Float32Array(W * H), b = new Float32Array(W * H);
    for (var i = 0; i < W * H; i++) a[i] = img[i * 4] / 255;
    // tre pass boxoskärpa (ungefär gaussisk), radie 3 px
    var R = 3;
    for (var pass = 0; pass < 3; pass++) {
      for (var y = 0; y < H; y++) {
        var acc = 0, row = y * W, x;
        for (x = -R; x <= R; x++) acc += a[row + ((x + W) % W)];
        for (x = 0; x < W; x++) {
          b[row + x] = acc / (2 * R + 1);
          acc += a[row + ((x + R + 1) % W)] - a[row + ((x - R + W) % W)];
        }
      }
      for (var x2 = 0; x2 < W; x2++) {
        var acc2 = 0, y2;
        for (y2 = -R; y2 <= R; y2++) acc2 += b[Math.min(H - 1, Math.max(0, y2)) * W + x2];
        for (y2 = 0; y2 < H; y2++) {
          a[y2 * W + x2] = acc2 / (2 * R + 1);
          acc2 += b[Math.min(H - 1, y2 + R + 1) * W + x2] - b[Math.max(0, y2 - R) * W + x2];
        }
      }
    }
    var out = new Uint8Array(W * H);
    for (var j = 0; j < W * H; j++) out[j] = Math.round(a[j] * 255);
    return out;
  }

  function Globe(canvas) {
    this.canvas = canvas;
    var opts = { antialias: false, alpha: false, preserveDrawingBuffer: false, powerPreference: "high-performance" };
    var gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts);
    if (!gl) throw new Error("WebGL saknas");
    this.gl = gl;
    var deriv = gl.getExtension("OES_standard_derivatives");
    var lod = gl.getExtension("EXT_shader_texture_lod");
    this.prog = this._program(VS, fragmentSource(!!deriv, !!(lod && deriv)));
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(this.prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    var names = ["uRes", "uCenter", "uR", "uDpr", "uE", "uN", "uF", "uMask", "uEnv", "uExposure", "uBridge",
      "uGlacial", "uIceOn", "uGrid", "uDC", "uDT", "uDS"];
    for (var i = 0; i < names.length; i++) this.u[names[i]] = gl.getUniformLocation(this.prog, names[i]);
    this.domes = { C: new Float32Array(FA.MAX_DOMES * 4), T: new Float32Array(FA.MAX_DOMES * 4), S: new Float32Array(FA.MAX_DOMES * 4), count: 0 };

    var maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var TW = maxTex >= 4096 ? 4096 : 2048, TH = TW / 2;
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    this.maskTex = this._texture(gl.TEXTURE0, function () {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildMaskCanvas(TW, TH));
    });
    var EW = 1024, EH = 512;
    var env = buildEnvelope(EW, EH);
    this.envTex = this._texture(gl.TEXTURE1, function () {
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, EW, EH, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, env);
    });
    this.textureSize = TW;
  }

  Globe.prototype._program = function (vs, fs) {
    var gl = this.gl;
    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("Shader: " + gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("Program: " + gl.getProgramInfoLog(p));
    gl.useProgram(p);
    return p;
  };

  Globe.prototype._texture = function (unit, upload) {
    var gl = this.gl, t = gl.createTexture();
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    upload();
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  // view: {cx, cy, R (css px), basis {E,N,F}, dpr, bp, ice, grid}
  Globe.prototype.render = function (view) {
    var gl = this.gl, u = this.u, dpr = view.dpr;
    var w = this.canvas.width, h = this.canvas.height;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.uRes, w, h);
    gl.uniform2f(u.uCenter, view.cx * dpr, view.cy * dpr);
    gl.uniform1f(u.uR, view.R * dpr);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform3fv(u.uE, view.basis.E);
    gl.uniform3fv(u.uN, view.basis.N);
    gl.uniform3fv(u.uF, view.basis.F);
    gl.uniform1i(u.uMask, 0);
    gl.uniform1i(u.uEnv, 1);
    gl.uniform1f(u.uExposure, FA.shelfExposure(view.bp));
    gl.uniform1f(u.uBridge, FA.bridgeReach(view.bp));
    gl.uniform1f(u.uGlacial, FA.glacial(view.bp));
    gl.uniform1f(u.uIceOn, view.ice === false ? 0 : 1);
    gl.uniform1f(u.uGrid, view.grid === false ? 0 : 1);
    FA.domeUniforms(view.bp, this.domes);
    gl.uniform4fv(u.uDC, this.domes.C);
    gl.uniform4fv(u.uDT, this.domes.T);
    gl.uniform4fv(u.uDS, this.domes.S);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  FA.Globe = Globe;
})(window.FA = window.FA || {});
