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
 * 夜の湖畔のドット絵を低解像度キャンバスに手続き的に描画し、CSSで拡大表示する。
 * ポータルページ（app/page.tsx）専用の演出。
 */
export default function LakesideScene() {
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
    const FPS = 8;

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
      firefly: hex("#e8ff8a"),
    };

    const SKY_STOPS: [number, RGB][] = (
      [
        [0, "#0a0c28"],
        [14, "#141848"],
        [26, "#221f62"],
        [36, "#3a2a78"],
        [44, "#5e3486"],
        [51, "#8c3f84"],
        [56, "#c0527a"],
        [60, "#e87a6a"],
        [63, "#f4a868"],
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

    // 月
    const MOON_X = 196;
    const MOON_Y = 14;
    const MOON_R = 6;
    for (let my = -MOON_R - 2; my <= MOON_R + 2; my++) {
      for (let mx = -MOON_R - 2; mx <= MOON_R + 2; mx++) {
        const d = Math.sqrt(mx * mx + my * my);
        const gx = MOON_X + mx;
        const gy = MOON_Y + my;
        if (d <= MOON_R) {
          const crater =
            (mx === -2 && my === -1) ||
            (mx === -1 && my === -1) ||
            (mx === 2 && my === 2) ||
            (mx === 3 && my === -3) ||
            (mx === -3 && my === 3);
          setLand(gx, gy, crater ? C.moonCrater : C.moon);
        } else if (d <= MOON_R + 1.6 && (gx + gy) % 2 === 0) {
          land[gy * W + gx] = C.moonHalo;
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
      for (let y = nearHill(x); y < HZ; y++) {
        setLand(x, y, C.nearHill);
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
        fillRect(cx - (half - k), yBottom - k, cx + (half - k), yBottom - k, C.castle);
      }
    }
    const cx = CASTLE_X;
    fillRect(cx - 7, base - 9, cx + 7, base, C.castle); // 城壁
    for (let cr = cx - 7; cr <= cx + 7; cr += 2) {
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
    fillRect(cx - 1, base - 3, cx, base, hex("#000000")); // 門

    // 岸辺の針葉樹
    {
      let x = 0;
      while (x < W) {
        const h = 4 + Math.floor(rand() * 6);
        const gap = rand() < 0.18;
        if (!gap && Math.abs(x - CASTLE_X) > 12) {
          for (let k = 0; k < h; k++) {
            const half = Math.floor((k + 1) / 2);
            fillRect(x - half, HZ - h + k, x + half, HZ - h + k, C.tree);
          }
        }
        x += 3 + Math.floor(rand() * 3);
      }
    }

    // ---- 星 ----
    type Star = { x: number; y: number; phase: number; speed: number; big: boolean };
    const stars: Star[] = [];
    for (let i = 0; i < 80; i++) {
      const sx = Math.floor(rand() * W);
      const sy = Math.floor(rand() * 38);
      if (Math.abs(sx - MOON_X) < 10 && Math.abs(sy - MOON_Y) < 10) {
        continue;
      }
      stars.push({ x: sx, y: sy, phase: rand() * Math.PI * 2, speed: 0.3 + rand() * 0.9, big: rand() < 0.08 });
    }
    const STAR_DIM = hex("#6a6aa8");
    const STAR_MID = hex("#b8b8e8");
    const STAR_BRIGHT = hex("#ffffff");

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
      if (rand() < 0.03) {
        bank[(bt + 2) * W + x] = C.flower;
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

    // ---- 蛍 ----
    type Firefly = { x: number; y: number; phase: number };
    const flies: Firefly[] = [];
    for (let i = 0; i < 6; i++) {
      flies.push({ x: rand() * W, y: 78 + rand() * 14, phase: rand() * Math.PI * 2 });
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

    function draw(frame: number) {
      const t = frame / FPS;

      // 空と陸
      for (let y = 0; y < HZ; y++) {
        for (let x = 0; x < W; x++) {
          put(x, y, land[y * W + x]);
        }
      }

      // 星のまたたき
      stars.forEach((s) => {
        if (!isSky[s.y * W + s.x]) {
          return;
        }
        const b = (Math.sin(t * s.speed * 3 + s.phase) + 1) / 2;
        put(s.x, s.y, b > 0.8 ? STAR_BRIGHT : b > 0.4 ? STAR_MID : STAR_DIM);
        if (s.big && b > 0.7) {
          put(s.x - 1, s.y, STAR_DIM);
          put(s.x + 1, s.y, STAR_DIM);
          put(s.x, s.y - 1, STAR_DIM);
          put(s.x, s.y + 1, STAR_DIM);
        }
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
          let c = mix(src, waterC, 0.45);
          c = [c[0] * 0.88, c[1] * 0.88, c[2] * 0.92];
          if (rippleRow && (x + y * 13 + frame * (y % 2 ? 1 : -1) + 400) % 29 < 3) {
            c = mix(c, C.ripple, 0.5);
          }
          put(x, y, c);
        }
      }

      // 月明かりの反射
      for (let y = HZ + 1; y < H; y++) {
        if ((y + (frame >> 1)) % 3 === 0) {
          continue;
        }
        const dd = y - HZ;
        const halfW = Math.round(Math.abs(Math.sin(y * 0.7 + t * 1.5)) * (1 + dd * 0.12));
        const off = Math.round(Math.sin(y * 0.5 + t * 2) * 1.5);
        for (let x = -halfW; x <= halfW; x++) {
          put(MOON_X + off + x, y, Math.abs(x) === halfW && halfW > 0 ? C.glitterDim : C.glitter);
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

      // 蛍
      flies.forEach((f) => {
        const on = Math.sin(t * 1.3 + f.phase) > 0.1;
        if (!on) {
          return;
        }
        const fx = Math.round(f.x + Math.sin(t * 0.4 + f.phase) * 10);
        const fy = Math.round(f.y + Math.cos(t * 0.6 + f.phase) * 3);
        put(((fx % W) + W) % W, fy, C.firefly);
      });

      ctx.putImageData(image, 0, 0);
    }

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      draw(0);
      return;
    }

    let frame = 0;
    let last = 0;
    let rafId = 0;
    function loop(now: number) {
      if (now - last >= 1000 / FPS) {
        last = now;
        draw(frame++);
      }
      rafId = window.requestAnimationFrame(loop);
    }
    draw(frame++);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="scene-frame">
      <canvas
        ref={canvasRef}
        id="lakeside-scene"
        className="scene-canvas"
        width={240}
        height={100}
        role="img"
        aria-label="ドット絵：月夜の湖畔と丘の上の城"
      />
    </div>
  );
}
