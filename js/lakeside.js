(function () {
  // 夜の湖畔のドット絵を低解像度キャンバスに手続き的に描画し、CSSで拡大表示する
  var canvas = document.getElementById("lakeside-scene");
  if (!canvas || !canvas.getContext) {
    return;
  }

  var W = 240;
  var H = 100;
  var HZ = 64; // 水面の開始行（水平線）
  var FPS = 8;

  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d");
  var image = ctx.createImageData(W, H);
  var px = image.data;

  function hex(c) {
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  // 再現性のある乱数（描画のたびに景色が変わらないように固定シード）
  var seed = 20260925;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  var BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  function dither(x, y, t) {
    return t * 16 > BAYER[y & 3][x & 3] + 0.5;
  }

  var C = {
    water: hex("#0e1b46"),
    ripple: hex("#5a5ea8"),
    waterDeep: hex("#081230"),
    farMountain: hex("#332c6c"),
    farMountainShade: hex("#28235a"),
    snow: hex("#c9bde8"),
    nearHill: hex("#1f2150"),
    tree: hex("#0f2436"),
    castle: hex("#0d1030"),
    window: hex("#ffd46a"),
    moon: hex("#f6ecc0"),
    moonCrater: hex("#d6ca96"),
    moonHalo: hex("#2e3274"),
    glitter: hex("#f8e8a8"),
    glitterDim: hex("#a89c78"),
    grassDark: hex("#143822"),
    grass: hex("#1f5230"),
    grassLight: hex("#3a7a3a"),
    reed: hex("#2a4a24"),
    cattail: hex("#6a4e2a"),
    flower: hex("#e8d0f0"),
    firefly: hex("#e8ff8a")
  };

  var SKY_STOPS = [
    [0, "#0a0c28"],
    [14, "#141848"],
    [26, "#221f62"],
    [36, "#3a2a78"],
    [44, "#5e3486"],
    [51, "#8c3f84"],
    [56, "#c0527a"],
    [60, "#e87a6a"],
    [63, "#f4a868"]
  ].map(function (s) {
    return [s[0], hex(s[1])];
  });

  function skyColor(x, y) {
    for (var i = 0; i < SKY_STOPS.length - 1; i++) {
      var a = SKY_STOPS[i];
      var b = SKY_STOPS[i + 1];
      if (y >= a[0] && y <= b[0]) {
        var t = (y - a[0]) / (b[0] - a[0]);
        return dither(x, y, t) ? b[1] : a[1];
      }
    }
    return SKY_STOPS[SKY_STOPS.length - 1][1];
  }

  // ---- 静的レイヤー（空・山・城・木）----
  var land = new Array(W * HZ);
  var isSky = new Uint8Array(W * HZ);

  function farRidge(x) {
    return Math.round(50 - (6 * Math.sin(x * 0.045 + 1) + 4 * Math.sin(x * 0.11 + 2) + 2 * Math.sin(x * 0.23)));
  }
  var CASTLE_X = 60;
  function nearHill(x) {
    var bump = 7 * Math.exp(-Math.pow((x - CASTLE_X) / 13, 2));
    return Math.round(58 - (2.5 * Math.sin(x * 0.03 + 4) + 1.5 * Math.sin(x * 0.09)) - bump);
  }

  function setLand(x, y, c) {
    if (x < 0 || x >= W || y < 0 || y >= HZ) {
      return;
    }
    land[y * W + x] = c;
    isSky[y * W + x] = 0;
  }

  for (var y = 0; y < HZ; y++) {
    for (var x = 0; x < W; x++) {
      land[y * W + x] = skyColor(x, y);
      isSky[y * W + x] = 1;
    }
  }

  // 月
  var MOON_X = 196;
  var MOON_Y = 14;
  var MOON_R = 6;
  for (var my = -MOON_R - 2; my <= MOON_R + 2; my++) {
    for (var mx = -MOON_R - 2; mx <= MOON_R + 2; mx++) {
      var d = Math.sqrt(mx * mx + my * my);
      var gx = MOON_X + mx;
      var gy = MOON_Y + my;
      if (d <= MOON_R) {
        var crater = (mx === -2 && my === -1) || (mx === -1 && my === -1) || (mx === 2 && my === 2) || (mx === 3 && my === -3) || (mx === -3 && my === 3);
        setLand(gx, gy, crater ? C.moonCrater : C.moon);
      } else if (d <= MOON_R + 1.6 && (gx + gy) % 2 === 0) {
        land[gy * W + gx] = C.moonHalo;
      }
    }
  }

  // 遠くの山並み（雪を頂く）
  for (x = 0; x < W; x++) {
    var top = farRidge(x);
    var peak = farRidge(x - 1) > top && farRidge(x + 1) >= top;
    for (y = top; y < HZ; y++) {
      var shade = farRidge(x + 1) > farRidge(x - 1);
      var c = shade ? C.farMountainShade : C.farMountain;
      var snowLine = (44 - top) * 0.6 + (peak ? 1 : 0);
      if (top < 44 && y - top < snowLine && dither(x, y, 1 - ((y - top) / (snowLine + 1)) * 0.5)) {
        c = C.snow;
      }
      setLand(x, y, c);
    }
  }

  // 手前の丘
  for (x = 0; x < W; x++) {
    for (y = nearHill(x); y < HZ; y++) {
      setLand(x, y, C.nearHill);
    }
  }

  // 丘の上の城
  var base = nearHill(CASTLE_X);
  function fillRect(x0, y0, x1, y1, c) {
    for (var yy = y0; yy <= y1; yy++) {
      for (var xx = x0; xx <= x1; xx++) {
        setLand(xx, yy, c);
      }
    }
  }
  function roof(cx, yBottom, half) {
    for (var k = 0; k <= half; k++) {
      fillRect(cx - (half - k), yBottom - k, cx + (half - k), yBottom - k, C.castle);
    }
  }
  var cx = CASTLE_X;
  fillRect(cx - 7, base - 9, cx + 7, base, C.castle); // 城壁
  for (var cr = cx - 7; cr <= cx + 7; cr += 2) {
    setLand(cr, base - 10, C.castle); // 狭間
  }
  fillRect(cx - 10, base - 13, cx - 8, base, C.castle); // 左の塔
  fillRect(cx + 8, base - 13, cx + 10, base, C.castle); // 右の塔
  roof(cx - 9, base - 14, 2);
  roof(cx + 9, base - 14, 2);
  fillRect(cx - 3, base - 18, cx + 2, base - 9, C.castle); // 天守
  roof(cx, base - 19, 3);
  fillRect(cx, base - 25, cx, base - 22, C.castle); // 尖塔
  setLand(cx + 1, base - 25, C.window);
  setLand(cx + 2, base - 25, C.window); // 旗
  [[cx - 1, base - 14], [cx, base - 14], [cx - 9, base - 9], [cx + 9, base - 9], [cx - 5, base - 5], [cx + 4, base - 5]].forEach(function (p) {
    setLand(p[0], p[1], C.window);
  });
  fillRect(cx - 1, base - 3, cx, base, hex("#000000")); // 門

  // 岸辺の針葉樹
  x = 0;
  while (x < W) {
    var h = 4 + Math.floor(rand() * 6);
    var gap = rand() < 0.18;
    if (!gap && Math.abs(x - CASTLE_X) > 12) {
      for (var k = 0; k < h; k++) {
        var half = Math.floor((k + 1) / 2);
        fillRect(x - half, HZ - h + k, x + half, HZ - h + k, C.tree);
      }
    }
    x += 3 + Math.floor(rand() * 3);
  }

  // ---- 星 ----
  var stars = [];
  for (var i = 0; i < 80; i++) {
    var sx = Math.floor(rand() * W);
    var sy = Math.floor(rand() * 38);
    if (Math.abs(sx - MOON_X) < 10 && Math.abs(sy - MOON_Y) < 10) {
      continue;
    }
    stars.push({ x: sx, y: sy, phase: rand() * Math.PI * 2, speed: 0.3 + rand() * 0.9, big: rand() < 0.08 });
  }
  var STAR_DIM = hex("#6a6aa8");
  var STAR_MID = hex("#b8b8e8");
  var STAR_BRIGHT = hex("#ffffff");

  // ---- 手前の岸（草地・葦）----
  var bank = new Array(W * H);
  function bankTop(x) {
    return Math.round(89 + 1.6 * Math.sin(x * 0.05) + Math.sin(x * 0.13 + 1) - 2 * Math.exp(-Math.pow((x - 40) / 30, 2)));
  }
  for (x = 0; x < W; x++) {
    var bt = bankTop(x);
    for (y = bt; y < H; y++) {
      var gc = y === bt ? C.grassLight : dither(x, y, (y - bt) / 10) ? C.grassDark : C.grass;
      if (y > bt && rand() < 0.04) {
        gc = C.grassLight;
      }
      bank[y * W + x] = gc;
    }
    if (rand() < 0.03) {
      bank[(bt + 2) * W + x] = C.flower;
    }
  }
  // 葦の群生
  [[18, 7], [26, 5], [104, 6], [150, 4], [214, 7], [226, 5]].forEach(function (cluster) {
    for (var n = 0; n < cluster[1]; n++) {
      var rx = cluster[0] + Math.floor(rand() * 8) - 4;
      var rh = 3 + Math.floor(rand() * 5);
      var rb = bankTop(rx);
      for (var r = 1; r <= rh; r++) {
        bank[(rb - r) * W + rx] = C.reed;
      }
      if (rand() < 0.6) {
        bank[(rb - rh) * W + rx] = C.cattail;
        bank[(rb - rh - 1) * W + rx] = C.cattail;
      }
    }
  });

  // ---- 蛍 ----
  var flies = [];
  for (i = 0; i < 6; i++) {
    flies.push({ x: rand() * W, y: 78 + rand() * 14, phase: rand() * Math.PI * 2 });
  }

  function put(x, y, c) {
    if (x < 0 || x >= W || y < 0 || y >= H) {
      return;
    }
    var o = (y * W + x) * 4;
    px[o] = c[0];
    px[o + 1] = c[1];
    px[o + 2] = c[2];
    px[o + 3] = 255;
  }

  function draw(frame) {
    var t = frame / FPS;
    var x;
    var y;

    // 空と陸
    for (y = 0; y < HZ; y++) {
      for (x = 0; x < W; x++) {
        put(x, y, land[y * W + x]);
      }
    }

    // 星のまたたき
    stars.forEach(function (s) {
      if (!isSky[s.y * W + s.x]) {
        return;
      }
      var b = (Math.sin(t * s.speed * 3 + s.phase) + 1) / 2;
      put(s.x, s.y, b > 0.8 ? STAR_BRIGHT : b > 0.4 ? STAR_MID : STAR_DIM);
      if (s.big && b > 0.7) {
        put(s.x - 1, s.y, STAR_DIM);
        put(s.x + 1, s.y, STAR_DIM);
        put(s.x, s.y - 1, STAR_DIM);
        put(s.x, s.y + 1, STAR_DIM);
      }
    });

    // 水面（景色の反射＋揺らぎ）
    for (y = HZ; y < H; y++) {
      var dist = y - HZ;
      var srcY = Math.max(0, HZ - 1 - dist);
      var amp = 0.6 + dist * 0.07;
      var shift = Math.round(Math.sin(y * 0.9 + t * 2.2) * amp);
      var depth = Math.min(1, dist / 30);
      var waterC = mix(C.water, C.waterDeep, depth);
      var rippleRow = y % 3 === 0;
      for (x = 0; x < W; x++) {
        var sx = Math.min(W - 1, Math.max(0, x + shift));
        var src = land[srcY * W + sx];
        var c = mix(src, waterC, 0.45);
        c = [c[0] * 0.88, c[1] * 0.88, c[2] * 0.92];
        // 流れるさざ波のハイライト
        if (rippleRow && (x + y * 13 + frame * (y % 2 ? 1 : -1) + 400) % 29 < 3) {
          c = mix(c, C.ripple, 0.5);
        }
        put(x, y, c);
      }
    }

    // 月明かりの反射
    for (y = HZ + 1; y < H; y++) {
      if ((y + (frame >> 1)) % 3 === 0) {
        continue;
      }
      var dd = y - HZ;
      var halfW = Math.round(Math.abs(Math.sin(y * 0.7 + t * 1.5)) * (1 + dd * 0.12));
      var off = Math.round(Math.sin(y * 0.5 + t * 2) * 1.5);
      for (x = -halfW; x <= halfW; x++) {
        put(MOON_X + off + x, y, Math.abs(x) === halfW && halfW > 0 ? C.glitterDim : C.glitter);
      }
    }

    // 岸
    for (y = HZ; y < H; y++) {
      for (x = 0; x < W; x++) {
        var bc = bank[y * W + x];
        if (bc) {
          put(x, y, bc);
        }
      }
    }

    // 蛍
    flies.forEach(function (f) {
      var on = Math.sin(t * 1.3 + f.phase) > 0.1;
      if (!on) {
        return;
      }
      var fx = Math.round(f.x + Math.sin(t * 0.4 + f.phase) * 10);
      var fy = Math.round(f.y + Math.cos(t * 0.6 + f.phase) * 3);
      put(((fx % W) + W) % W, fy, C.firefly);
    });

    ctx.putImageData(image, 0, 0);
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    draw(0);
    return;
  }

  var frame = 0;
  var last = 0;
  function loop(now) {
    if (now - last >= 1000 / FPS) {
      last = now;
      draw(frame++);
    }
    window.requestAnimationFrame(loop);
  }
  draw(frame++);
  window.requestAnimationFrame(loop);
})();
