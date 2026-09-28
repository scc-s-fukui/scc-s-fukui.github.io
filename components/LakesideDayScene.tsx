"use client";

import { useEffect, useRef } from "react";

type RGB = [number, number, number];

function hex(c: string): RGB {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/**
 * 昼の湖畔のドット絵（夜版の昼バージョン）。城をクリックすると花火が上がる。
 * playgroundページ専用の演出。
 */
export default function LakesideDayScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    const ctx: CanvasRenderingContext2D = context;

    const W = 240;
    const H = 100;
    const HZ = 64; // 水面の開始行（水平線）
    const FPS = 12;

    canvas.width = W;
    canvas.height = H;
    const image = ctx.createImageData(W, H);
    const px = image.data;

    let seed = 20260925;
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    const BAYER = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    function dither(x: number, y: number, t: number) {
      return t * 16 > BAYER[y & 3][x & 3] + 0.5;
    }

    const C = {
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
      butterfly2: hex("#ffffff"),
    };

    const SKY_STOPS: [number, RGB][] = (
      [
        [0, "#2e6ad8"],
        [16, "#4a8ae6"],
        [32, "#6ea6f0"],
        [46, "#96c2f6"],
        [56, "#bcdafa"],
        [63, "#e2f0fc"],
      ] as [number, string][]
    ).map(([stop, c]) => [stop, hex(c)]);

    function skyColor(x: number, y: number): RGB {
      for (let i = 0; i < SKY_STOPS.length - 1; i++) {
        const [aStop, aColor] = SKY_STOPS[i];
        const [bStop, bColor] = SKY_STOPS[i + 1];
        if (y >= aStop && y <= bStop) {
          const t = (y - aStop) / (bStop - aStop);
          return dither(x, y, t) ? bColor : aColor;
        }
      }
      return SKY_STOPS[SKY_STOPS.length - 1][1];
    }

    // ---- 静的レイヤー（空・山・城・木）----
    const land: RGB[] = new Array(W * HZ);
    const isSky = new Uint8Array(W * HZ);

    function farRidge(x: number) {
      return Math.round(50 - (6 * Math.sin(x * 0.045 + 1) + 4 * Math.sin(x * 0.11 + 2) + 2 * Math.sin(x * 0.23)));
    }
    const CASTLE_X = 60;
    function nearHill(x: number) {
      const bump = 7 * Math.exp(-Math.pow((x - CASTLE_X) / 13, 2));
      return Math.round(58 - (2.5 * Math.sin(x * 0.03 + 4) + 1.5 * Math.sin(x * 0.09)) - bump);
    }

    function setLand(x: number, y: number, c: RGB) {
      if (x < 0 || x >= W || y < 0 || y >= HZ) {
        return;
      }
      land[y * W + x] = c;
      isSky[y * W + x] = 0;
    }

    for (let y = 0; y < HZ; y++) {
      for (let x = 0; x < W; x++) {
        land[y * W + x] = skyColor(x, y);
        isSky[y * W + x] = 1;
      }
    }

    // 太陽
    const SUN_X = 196;
    const SUN_Y = 14;
    const SUN_R = 6;
    for (let my = -SUN_R - 3; my <= SUN_R + 3; my++) {
      for (let mx = -SUN_R - 3; mx <= SUN_R + 3; mx++) {
        const d = Math.sqrt(mx * mx + my * my);
        const gx = SUN_X + mx;
        const gy = SUN_Y + my;
        if (d <= SUN_R) {
          land[gy * W + gx] = C.sun;
        } else if (d <= SUN_R + 1.5) {
          land[gy * W + gx] = C.sunHalo;
        } else if (d <= SUN_R + 3 && (gx + gy) % 2 === 0) {
          land[gy * W + gx] = mix(land[gy * W + gx], C.sunHalo, 0.6);
        }
      }
    }

    // 遠くの山並み（雪を頂く）
    for (let x = 0; x < W; x++) {
      const top = farRidge(x);
      const peak = farRidge(x - 1) > top && farRidge(x + 1) >= top;
      for (let y = top; y < HZ; y++) {
        const shade = farRidge(x + 1) > farRidge(x - 1);
        let c = shade ? C.farMountainShade : C.farMountain;
        const snowLine = (44 - top) * 0.6 + (peak ? 1 : 0);
        if (top < 44 && y - top < snowLine && dither(x, y, 1 - ((y - top) / (snowLine + 1)) * 0.5)) {
          c = C.snow;
        }
        setLand(x, y, c);
      }
    }

    // 手前の丘
    for (let x = 0; x < W; x++) {
      const ht = nearHill(x);
      for (let y = ht; y < HZ; y++) {
        setLand(x, y, y - ht < 2 || dither(x, y, 0.25) ? C.nearHillLight : C.nearHill);
      }
    }

    // 丘の上の城
    const base = nearHill(CASTLE_X);
    function fillRect(x0: number, y0: number, x1: number, y1: number, c: RGB) {
      for (let yy = y0; yy <= y1; yy++) {
        for (let xx = x0; xx <= x1; xx++) {
          setLand(xx, yy, c);
        }
      }
    }
    function roof(cx: number, yBottom: number, half: number) {
      for (let k = 0; k <= half; k++) {
        fillRect(cx - (half - k), yBottom - k, cx + (half - k), yBottom - k, C.roof);
      }
    }
    const cx = CASTLE_X;
    fillRect(cx - 7, base - 9, cx + 7, base, C.castle); // 城壁
    for (let cr = cx - 7; cr <= cx + 7; cr += 2) {
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
    (
      [
        [cx - 1, base - 14],
        [cx, base - 14],
        [cx - 9, base - 9],
        [cx + 9, base - 9],
        [cx - 5, base - 5],
        [cx + 4, base - 5],
      ] as [number, number][]
    ).forEach(([px0, py0]) => {
      setLand(px0, py0, C.window);
    });
    fillRect(cx - 1, base - 3, cx, base, C.gate); // 門

    // 岸辺の針葉樹
    {
      let x = 0;
      while (x < W) {
        const h = 4 + Math.floor(rand() * 6);
        const gap = rand() < 0.18;
        if (!gap && Math.abs(x - CASTLE_X) > 12) {
          for (let k = 0; k < h; k++) {
            const half = Math.floor((k + 1) / 2);
            fillRect(x - half, HZ - h + k, x, HZ - h + k, C.treeLight);
            fillRect(x + 1, HZ - h + k, x + half, HZ - h + k, C.tree);
          }
        }
        x += 3 + Math.floor(rand() * 3);
      }
    }

    // ---- 雲・鳥 ----
    type Cloud = { x: number; y: number; speed: number; puffs: { dx: number; dy: number; r: number }[] };
    const clouds: Cloud[] = [];
    (
      [
        [20, 12, 1],
        [110, 22, 0.8],
        [160, 8, 0.6],
        [230, 30, 0.9],
        [70, 34, 0.7],
      ] as [number, number, number][]
    ).forEach(([cx0, cy0, scale]) => {
      const puffs: { dx: number; dy: number; r: number }[] = [];
      const n = 3 + Math.floor(rand() * 3);
      for (let p = 0; p < n; p++) {
        puffs.push({ dx: (p - n / 2) * 6 * scale + rand() * 3, dy: -rand() * 3 * scale, r: (3 + rand() * 3) * scale + 1 });
      }
      clouds.push({ x: cx0, y: cy0, speed: 0.6 + scale * 0.8, puffs });
    });
    const CLOUD_SPAN = W + 60;
    function cloudPixel(cl: Cloud, x: number, y: number, offset: number) {
      let hit = 0;
      for (let p = 0; p < cl.puffs.length; p++) {
        const pf = cl.puffs[p];
        const ddx = x - (cl.x + offset + pf.dx);
        const ddy = (y - (cl.y + pf.dy)) * 1.6;
        if (ddx * ddx + ddy * ddy <= pf.r * pf.r) {
          hit = ddy > pf.r * 0.35 ? Math.max(hit, 1) : 2;
        }
      }
      return hit;
    }
    type Bird = { x: number; y: number; speed: number; phase: number };
    const birds: Bird[] = [];
    for (let i = 0; i < 3; i++) {
      birds.push({ x: rand() * W, y: 18 + rand() * 16, speed: 3 + rand() * 2, phase: rand() * 4 });
    }

    // ---- 手前の岸（草地・葦）----
    const bank: (RGB | undefined)[] = new Array(W * H);
    function bankTop(x: number) {
      return Math.round(89 + 1.6 * Math.sin(x * 0.05) + Math.sin(x * 0.13 + 1) - 2 * Math.exp(-Math.pow((x - 40) / 30, 2)));
    }
    for (let x = 0; x < W; x++) {
      const bt = bankTop(x);
      for (let y = bt; y < H; y++) {
        let gc = y === bt ? C.grassLight : dither(x, y, (y - bt) / 10) ? C.grassDark : C.grass;
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
    (
      [
        [18, 7],
        [26, 5],
        [104, 6],
        [150, 4],
        [214, 7],
        [226, 5],
      ] as [number, number][]
    ).forEach(([clusterX, count]) => {
      for (let n = 0; n < count; n++) {
        const rx = clusterX + Math.floor(rand() * 8) - 4;
        const rh = 3 + Math.floor(rand() * 5);
        const rb = bankTop(rx);
        for (let r = 1; r <= rh; r++) {
          bank[(rb - r) * W + rx] = C.reed;
        }
        if (rand() < 0.6) {
          bank[(rb - rh) * W + rx] = C.cattail;
          bank[(rb - rh - 1) * W + rx] = C.cattail;
        }
      }
    });

    // ---- 蝶 ----
    type Butterfly = { x: number; y: number; phase: number };
    const flies: Butterfly[] = [];
    for (let i = 0; i < 4; i++) {
      flies.push({ x: rand() * W, y: 80 + rand() * 10, phase: rand() * Math.PI * 2 });
    }

    function put(x: number, y: number, c: RGB) {
      if (x < 0 || x >= W || y < 0 || y >= H) {
        return;
      }
      const o = (y * W + x) * 4;
      px[o] = c[0];
      px[o + 1] = c[1];
      px[o + 2] = c[2];
      px[o + 3] = 255;
    }

    // ---- 花火（城をクリックすると打ち上がる）----
    const CASTLE_BOX = { x0: CASTLE_X - 11, x1: CASTLE_X + 11, y0: base - 26, y1: base };
    const FIREWORK_COLORS = (["#ff5a5a", "#ffd23c", "#4ad8ff", "#ff7ae0", "#7cff6a", "#ffffff"] as string[]).map(hex);
    type Rocket = { x: number; y: number; vx: number; targetY: number; color: RGB };
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: RGB };
    let rockets: Rocket[] = [];
    let sparks: Spark[] = [];

    function launch() {
      if (rockets.length + sparks.length / 30 >= 6) {
        return;
      }
      rockets.push({
        x: CASTLE_X + Math.round((rand() - 0.5) * 10),
        y: base - 26,
        vx: (rand() - 0.5) * 1.2,
        targetY: 8 + Math.floor(rand() * 20),
        color: FIREWORK_COLORS[Math.floor(rand() * FIREWORK_COLORS.length)],
      });
    }

    function burst(r: Rocket) {
      const n = 26 + Math.floor(rand() * 10);
      const power = 1.3 + rand() * 0.8;
      const second = FIREWORK_COLORS[Math.floor(rand() * FIREWORK_COLORS.length)];
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2 + rand() * 0.2;
        const sp = power * (0.7 + rand() * 0.3);
        sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 0,
          maxLife: 14 + Math.floor(rand() * 8),
          color: k % 3 === 0 ? second : r.color,
        });
      }
    }

    function updateFireworks() {
      rockets = rockets.filter((r) => {
        r.y -= 3;
        r.x += r.vx;
        if (r.y <= r.targetY) {
          burst(r);
          return false;
        }
        return true;
      });
      sparks = sparks.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.9;
        p.vy = p.vy * 0.9 + 0.08;
        p.life++;
        return p.life < p.maxLife;
      });
    }

    function sparkColor(p: Spark) {
      const fade = p.life / p.maxLife;
      return fade < 0.2 ? C.glitter : fade > 0.7 ? mix(p.color, C.cloudShade, 0.5) : p.color;
    }

    function drawFireworks() {
      rockets.forEach((r) => {
        put(Math.round(r.x), Math.round(r.y), C.glitter);
        put(Math.round(r.x - r.vx), Math.round(r.y) + 1, C.glitterDim);
        put(Math.round(r.x - r.vx * 2), Math.round(r.y) + 2, C.glitterDim);
      });
      sparks.forEach((p) => {
        const fade = p.life / p.maxLife;
        if (fade > 0.75 && (p.life + Math.round(p.x)) % 2) {
          return;
        }
        put(Math.round(p.x), Math.round(p.y), sparkColor(p));
      });
    }

    function toScene(event: PointerEvent | MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * W,
        y: ((event.clientY - rect.top) / rect.height) * H,
      };
    }
    function onCastle(p: { x: number; y: number }) {
      return p.x >= CASTLE_BOX.x0 && p.x <= CASTLE_BOX.x1 && p.y >= CASTLE_BOX.y0 && p.y <= CASTLE_BOX.y1;
    }
    function handleClick(event: MouseEvent) {
      if (onCastle(toScene(event))) {
        launch();
        if (rand() < 0.4) {
          launch();
        }
      }
    }
    function handlePointerMove(event: PointerEvent) {
      canvas!.style.cursor = onCastle(toScene(event)) ? "pointer" : "";
    }
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("pointermove", handlePointerMove);

    function draw(frame: number) {
      const t = frame / FPS;
      const step = Math.floor(t * 8); // さざ波などはフレームレートに依存しない速さで動かす

      // 空と陸
      for (let y = 0; y < HZ; y++) {
        for (let x = 0; x < W; x++) {
          put(x, y, land[y * W + x]);
        }
      }

      // 流れる雲
      clouds.forEach((cl) => {
        const shifted = ((cl.x + t * cl.speed + 30) % CLOUD_SPAN) - 30 - cl.x;
        const x0 = Math.floor(cl.x + shifted - 30);
        for (let yy = Math.max(0, cl.y - 12); yy < Math.min(HZ, cl.y + 8); yy++) {
          for (let xx = Math.max(0, x0); xx < Math.min(W, x0 + 60); xx++) {
            if (!isSky[yy * W + xx]) {
              continue;
            }
            const hit = cloudPixel(cl, xx, yy, shifted);
            if (hit) {
              put(xx, yy, hit === 2 ? C.cloud : C.cloudShade);
            }
          }
        }
      });

      // 鳥
      birds.forEach((b) => {
        const bx = Math.round((((b.x + t * b.speed) % (W + 10)) + W + 10) % (W + 10)) - 5;
        const by = Math.round(b.y + Math.sin(t * 0.8 + b.phase) * 2);
        const up = Math.floor(t * 4 + b.phase) % 2 === 0;
        put(bx, by, C.bird);
        put(bx - 1, by + (up ? -1 : 0), C.bird);
        put(bx + 1, by + (up ? -1 : 0), C.bird);
        put(bx - 2, by + (up ? -1 : 1), C.bird);
        put(bx + 2, by + (up ? -1 : 1), C.bird);
      });

      // 水面（景色の反射＋揺らぎ）
      for (let y = HZ; y < H; y++) {
        const dist = y - HZ;
        const srcY = Math.max(0, HZ - 1 - dist);
        const amp = 0.6 + dist * 0.07;
        const shift = Math.round(Math.sin(y * 0.9 + t * 2.2) * amp);
        const depth = Math.min(1, dist / 30);
        const waterC = mix(C.water, C.waterDeep, depth);
        const rippleRow = y % 3 === 0;
        for (let x = 0; x < W; x++) {
          const sx = Math.min(W - 1, Math.max(0, x + shift));
          const src = land[srcY * W + sx];
          let c = mix(src, waterC, 0.5);
          c = [c[0] * 0.92, c[1] * 0.94, c[2] * 0.98];
          if (rippleRow && (x + y * 13 + step * (y % 2 ? 1 : -1) + 400) % 29 < 3) {
            c = mix(c, C.ripple, 0.5);
          }
          put(x, y, c);
        }
      }

      // 日差しの反射
      for (let y = HZ + 1; y < H; y++) {
        if ((y + (step >> 1)) % 3 === 0) {
          continue;
        }
        const dd = y - HZ;
        const halfW = Math.round(Math.abs(Math.sin(y * 0.7 + t * 1.5)) * (1 + dd * 0.12));
        const off = Math.round(Math.sin(y * 0.5 + t * 2) * 1.5);
        for (let x = -halfW; x <= halfW; x++) {
          put(SUN_X + off + x, y, Math.abs(x) === halfW && halfW > 0 ? C.glitterDim : C.glitter);
        }
      }

      // 岸
      for (let y = HZ; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const bc = bank[y * W + x];
          if (bc) {
            put(x, y, bc);
          }
        }
      }

      // 蝶（羽ばたきで1px⇔2px幅を切り替える）
      flies.forEach((f, n) => {
        const fx = ((Math.round(f.x + Math.sin(t * 0.5 + f.phase) * 14) % W) + W) % W;
        const fy = Math.round(f.y + Math.sin(t * 1.7 + f.phase) * 2);
        const col = n % 2 ? C.butterfly : C.butterfly2;
        if (Math.floor(t * 5 + f.phase) % 2) {
          put(fx - 1, fy, col);
          put(fx + 1, fy, col);
        } else {
          put(fx, fy, col);
        }
      });

      drawFireworks();

      ctx.putImageData(image, 0, 0);
    }

    // 動きを減らす設定の場合、景色は静止させ、クリックで上げた花火だけ動かす
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let last = 0;
    let rafId = 0;
    function loop(now: number) {
      if (now - last >= 1000 / FPS) {
        last = now;
        const active = rockets.length || sparks.length;
        updateFireworks();
        if (!reduceMotion) {
          draw(frame++);
        } else if (active) {
          draw(0);
        }
      }
      rafId = window.requestAnimationFrame(loop);
    }
    draw(frame++);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div className="scene-frame is-day">
      <canvas
        ref={canvasRef}
        id="lakeside-day-scene"
        className="scene-canvas"
        width={240}
        height={100}
        role="img"
        aria-label="ドット絵：昼の湖畔と丘の上の城"
      />
    </div>
  );
}
