(function () {
  // 昼の湖畔のドット絵（ポータルの夜版の昼バージョン）を低解像度キャンバスに手続き的に描画し、CSSで拡大表示する
  var canvas = document.getElementById("lakeside-day-scene");
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
    water: hex("#3a7ccc"),
    ripple: hex("#d8f0ff"),
    waterDeep: hex("#2a5aa8"),
    farMountain: hex("#7c98d0"),
    farMountainShade: hex("#6682bc"),
    snow: hex("#ffffff"),
    nearHill: hex("#4a9448"),
    nearHillLight: hex("#5aac52"),
    tree: hex("#2a6a34"),
    treeLight: hex("#3c8a3e"),
    castle: hex("#c8c0ae"),
    castleShade: hex("#a09884"),
    roof: hex("#3c5cb4"),
    window: hex("#3a3848"),
    flag: hex("#e04848"),
    gate: hex("#5a4230"),
    sun: hex("#fff6c8"),
    sunHalo: hex("#fffbe6"),
    glitter: hex("#ffffff"),
    glitterDim: hex("#fff2b0"),
    cloud: hex("#ffffff"),
    cloudShade: hex("#dceaf8"),
    bird: hex("#2a3450"),
    grassDark: hex("#2e7a34"),
    grass: hex("#43983e"),
    grassLight: hex("#7cc85a"),
    reed: hex("#3c7a2c"),
    cattail: hex("#8a5a2a"),
    flower: hex("#ffe060"),
    flower2: hex("#ff90a8"),
    butterfly: hex("#fff4a0"),
    butterfly2: hex("#ffffff")
  };

  var SKY_STOPS = [
    [0, "#2e6ad8"],
    [16, "#4a8ae6"],
    [32, "#6ea6f0"],
    [46, "#96c2f6"],
    [56, "#bcdafa"],
    [63, "#e2f0fc"]
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

  // 太陽
  var MOON_X = 196;
  var MOON_Y = 14;
  var MOON_R = 6;
  for (var my = -MOON_R - 3; my <= MOON_R + 3; my++) {
    for (var mx = -MOON_R - 3; mx <= MOON_R + 3; mx++) {
      var d = Math.sqrt(mx * mx + my * my);
      var gx = MOON_X + mx;
      var gy = MOON_Y + my;
      if (d <= MOON_R) {
        land[gy * W + gx] = C.sun;
      } else if (d <= MOON_R + 1.5) {
        land[gy * W + gx] = C.sunHalo;
      } else if (d <= MOON_R + 3 && (gx + gy) % 2 === 0) {
        land[gy * W + gx] = mix(land[gy * W + gx], C.sunHalo, 0.6);
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
    var ht = nearHill(x);
    for (y = ht; y < HZ; y++) {
      setLand(x, y, y - ht < 2 || dither(x, y, 0.25) ? C.nearHillLight : C.nearHill);
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
      fillRect(cx - (half - k), yBottom - k, cx + (half - k), yBottom - k, C.roof);
    }
  }
  var cx = CASTLE_X;
  fillRect(cx - 7, base - 9, cx + 7, base, C.castle); // 城壁
  for (var cr = cx - 7; cr <= cx + 7; cr += 2) {
    setLand(cr, base - 10, C.castle); // 狭間
  }
  fillRect(cx + 1, base - 9, cx + 7, base, C.castleShade); // 城壁の陰
  fillRect(cx - 10, base - 13, cx - 8, base, C.castle); // 左の塔
  fillRect(cx + 8, base - 13, cx + 10, base, C.castleShade); // 右の塔
  roof(cx - 9, base - 14, 2);
  roof(cx + 9, base - 14, 2);
  fillRect(cx - 3, base - 18, cx + 2, base - 9, C.castle); // 天守
  fillRect(cx + 1, base - 18, cx + 2, base - 9, C.castleShade);
  roof(cx, base - 19, 3);
  fillRect(cx, base - 25, cx, base - 22, C.castle); // 尖塔
  setLand(cx + 1, base - 25, C.flag);
  setLand(cx + 2, base - 25, C.flag); // 旗
  [[cx - 1, base - 14], [cx, base - 14], [cx - 9, base - 9], [cx + 9, base - 9], [cx - 5, base - 5], [cx + 4, base - 5]].forEach(function (p) {
    setLand(p[0], p[1], C.window);
  });
  fillRect(cx - 1, base - 3, cx, base, C.gate); // 門

  // 岸辺の針葉樹
  x = 0;
  while (x < W) {
    var h = 4 + Math.floor(rand() * 6);
    var gap = rand() < 0.18;
    if (!gap && Math.abs(x - CASTLE_X) > 12) {
      for (var k = 0; k < h; k++) {
        var half = Math.floor((k + 1) / 2);
        fillRect(x - half, HZ - h + k, x, HZ - h + k, C.treeLight);
        fillRect(x + 1, HZ - h + k, x + half, HZ - h + k, C.tree);
      }
    }
    x += 3 + Math.floor(rand() * 3);
  }

  // ---- 雲・鳥 ----
  // 雲は楕円の集まりで形を作り、横に流す
  var clouds = [];
  [[20, 12, 1], [110, 22, 0.8], [160, 8, 0.6], [230, 30, 0.9], [70, 34, 0.7]].forEach(function (c0) {
    var puffs = [];
    var n = 3 + Math.floor(rand() * 3);
    for (var p = 0; p < n; p++) {
      puffs.push({ dx: (p - n / 2) * 6 * c0[2] + rand() * 3, dy: -rand() * 3 * c0[2], r: (3 + rand() * 3) * c0[2] + 1 });
    }
    clouds.push({ x: c0[0], y: c0[1], speed: 0.6 + c0[2] * 0.8, puffs: puffs });
  });
  var CLOUD_SPAN = W + 60;
  function cloudPixel(cl, x, y, offset) {
    var hit = 0;
    for (var p = 0; p < cl.puffs.length; p++) {
      var pf = cl.puffs[p];
      var ddx = x - (cl.x + offset + pf.dx);
      var ddy = (y - (cl.y + pf.dy)) * 1.6;
      if (ddx * ddx + ddy * ddy <= pf.r * pf.r) {
        hit = ddy > pf.r * 0.35 ? Math.max(hit, 1) : 2;
      }
    }
    return hit;
  }
  var birds = [];
  for (var i = 0; i < 3; i++) {
    birds.push({ x: rand() * W, y: 18 + rand() * 16, speed: 3 + rand() * 2, phase: rand() * 4 });
  }

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
    if (rand() < 0.05) {
      bank[(bt + 2) * W + x] = rand() < 0.5 ? C.flower : C.flower2;
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

  // ---- 蝶 ----
  var flies = [];
  for (i = 0; i < 4; i++) {
    flies.push({ x: rand() * W, y: 80 + rand() * 10, phase: rand() * Math.PI * 2 });
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

    // 流れる雲
    clouds.forEach(function (cl) {
      var shifted = ((cl.x + t * cl.speed + 30) % CLOUD_SPAN) - 30 - cl.x;
      var x0 = Math.floor(cl.x + shifted - 30);
      for (var yy = Math.max(0, cl.y - 12); yy < Math.min(HZ, cl.y + 8); yy++) {
        for (var xx = Math.max(0, x0); xx < Math.min(W, x0 + 60); xx++) {
          if (!isSky[yy * W + xx]) {
            continue;
          }
          var hit = cloudPixel(cl, xx, yy, shifted);
          if (hit) {
            put(xx, yy, hit === 2 ? C.cloud : C.cloudShade);
          }
        }
      }
    });

    // 鳥
    birds.forEach(function (b) {
      var bx = Math.round((((b.x + t * b.speed) % (W + 10)) + W + 10) % (W + 10)) - 5;
      var by = Math.round(b.y + Math.sin(t * 0.8 + b.phase) * 2);
      var up = Math.floor(t * 4 + b.phase) % 2 === 0;
      put(bx, by, C.bird);
      put(bx - 1, by + (up ? -1 : 0), C.bird);
      put(bx + 1, by + (up ? -1 : 0), C.bird);
      put(bx - 2, by + (up ? -1 : 1), C.bird);
      put(bx + 2, by + (up ? -1 : 1), C.bird);
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
        var c = mix(src, waterC, 0.5);
        c = [c[0] * 0.92, c[1] * 0.94, c[2] * 0.98];
        // 流れるさざ波のハイライト
        if (rippleRow && (x + y * 13 + frame * (y % 2 ? 1 : -1) + 400) % 29 < 3) {
          c = mix(c, C.ripple, 0.5);
        }
        put(x, y, c);
      }
    }

    // 日差しの反射
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

    // 蝶（羽ばたきで1px⇔2px幅を切り替える）
    flies.forEach(function (f, n) {
      var fx = ((Math.round(f.x + Math.sin(t * 0.5 + f.phase) * 14) % W) + W) % W;
      var fy = Math.round(f.y + Math.sin(t * 1.7 + f.phase) * 2);
      var col = n % 2 ? C.butterfly : C.butterfly2;
      if (Math.floor(t * 5 + f.phase) % 2) {
        put(fx - 1, fy, col);
        put(fx + 1, fy, col);
      } else {
        put(fx, fy, col);
      }
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
