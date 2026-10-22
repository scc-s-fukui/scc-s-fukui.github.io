"use client";

import { useEffect, useId, useRef, useState } from "react";

const MIN_AXES = 4;
const MAX_AXES = 6;
const MIN_TICKS = 2;
const MAX_TICKS = 10;
const DEFAULT_MAX_VALUE = 100;
const NAME_MAX_LENGTH = 8;

const DEFAULT_NAMES = ["攻撃", "防御", "速度", "知力", "体力", "運"];
const DEFAULT_VALUES = ["80", "55", "70", "90", "45", "60"];

const PALETTES = [
  { label: "ブルー", color: "#6c8cff" },
  { label: "グリーン", color: "#4ade80" },
  { label: "オレンジ", color: "#fb923c" },
  { label: "ピンク", color: "#f472b6" },
  { label: "パープル", color: "#a78bfa" },
  { label: "イエロー", color: "#facc15" },
];

// SVGは単体のファイルとして書き出すため、CSS変数ではなく固定色で描く
const SVG_SIZE = 600;
const CENTER = SVG_SIZE / 2;
const RADIUS = 135;
// 外枠を超えた値を描く上限（外枠=1。キャンバスの外にはみ出さない範囲）
const OVERFLOW_LIMIT = 2;
const LABEL_OFFSET_X = 16;
const LABEL_OFFSET_Y = 24;
const SURFACE_COLOR = "#171a21";
const GRID_COLOR = "#2a2e38";
const AXIS_COLOR = "#3a3f4c";
const LABEL_COLOR = "#e8e9ec";
const TICK_LABEL_COLOR = "#9aa0ac";
const FONT_FAMILY = "system-ui, 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif";
const EXPORT_SCALE = 2;
const TWEEN_MS = 350;

const inputClass =
  "rounded-md border border-line bg-bg px-3 py-1.5 text-sm text-ink outline-none focus:border-accent";
const buttonClass =
  "rounded-md border border-line bg-bg px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent";

function toNumber(text: string): number {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatTick(value: number): string {
  return String(Number(value.toFixed(2)));
}

/** 軸iの頂点（真上から時計回り）。ratioは中心(0)〜外枠(1) */
function pointAt(index: number, count: number, ratio: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  return {
    x: CENTER + RADIUS * ratio * Math.cos(angle),
    y: CENTER + RADIUS * ratio * Math.sin(angle),
    cos: Math.cos(angle),
    sin: Math.sin(angle),
  };
}

function toPoints(ratios: number[], count: number): string {
  return ratios
    .slice(0, count)
    .map((ratio, i) => {
      const p = pointAt(i, count, ratio);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ");
}

/** 目標の比率へ滑らかに追従させる（値を変えたとき頂点がぬるっと動く） */
function useTweenedRatios(target: number[]): number[] {
  const [displayed, setDisplayed] = useState(target);
  const displayedRef = useRef(target);
  const targetKey = target.join(",");

  useEffect(() => {
    const to = targetKey.split(",").map(Number);
    const from = displayedRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const startedAt = performance.now();

    const step = (now: number) => {
      const t = reduceMotion ? 1 : Math.min(1, (now - startedAt) / TWEEN_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = to.map((end, i) => from[i] + (end - from[i]) * eased);
      displayedRef.current = next;
      setDisplayed(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [targetKey]);

  return displayed;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RadarChartTool() {
  const formId = useId();
  const svgRef = useRef<SVGSVGElement>(null);

  const [axisCount, setAxisCount] = useState(5);
  const [tickCount, setTickCount] = useState(5);
  const [maxText, setMaxText] = useState(String(DEFAULT_MAX_VALUE));
  const [names, setNames] = useState(DEFAULT_NAMES);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [color, setColor] = useState(PALETTES[0].color);

  const maxValue = toNumber(maxText) || DEFAULT_MAX_VALUE;
  const ratios = values.map((v) => Math.min(OVERFLOW_LIMIT, toNumber(v) / maxValue));
  const animatedRatios = useTweenedRatios(ratios);

  const updateName = (index: number, text: string) =>
    setNames((prev) => prev.map((n, i) => (i === index ? text : n)));
  const updateValue = (index: number, text: string) =>
    setValues((prev) => prev.map((v, i) => (i === index ? text : v)));

  const randomize = () =>
    setValues((prev) => prev.map(() => String(Math.round(Math.random() * maxValue))));

  const serializeSvg = () => {
    const svg = svgRef.current;
    if (!svg) return null;
    return new XMLSerializer().serializeToString(svg);
  };

  const downloadSvg = () => {
    const source = serializeSvg();
    if (!source) return;
    triggerDownload(new Blob([source], { type: "image/svg+xml;charset=utf-8" }), "radar-chart.svg");
  };

  const downloadPng = () => {
    const source = serializeSvg();
    if (!source) return;
    const svgUrl = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SVG_SIZE * EXPORT_SCALE;
      canvas.height = SVG_SIZE * EXPORT_SCALE;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) triggerDownload(blob, "radar-chart.png");
        }, "image/png");
      }
      URL.revokeObjectURL(svgUrl);
    };
    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  };

  const ariaLabel = `レーダーチャート（最大値${formatTick(maxValue)}）: ${names
    .slice(0, axisCount)
    .map((n, i) => `${n || `項目${i + 1}`} ${formatTick(toNumber(values[i]))}`)
    .join("、")}`;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="rounded-xl border border-line bg-surface p-2">
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            role="img"
            aria-label={ariaLabel}
            className="block h-auto w-full"
          >
            <rect width={SVG_SIZE} height={SVG_SIZE} fill={SURFACE_COLOR} />

            {/* 目盛りの多角形（外枠が最大値） */}
            {Array.from({ length: tickCount }, (_, i) => (i + 1) / tickCount).map((ratio) => (
              <polygon
                key={ratio}
                points={toPoints(Array(axisCount).fill(ratio), axisCount)}
                fill="none"
                stroke={ratio === 1 ? AXIS_COLOR : GRID_COLOR}
                strokeWidth={ratio === 1 ? 1.5 : 1}
              />
            ))}

            {/* 軸線 */}
            {Array.from({ length: axisCount }, (_, i) => {
              const p = pointAt(i, axisCount, 1);
              return (
                <line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke={GRID_COLOR} strokeWidth={1} />
              );
            })}

            {/* 値の多角形 */}
            <polygon
              points={toPoints(animatedRatios, axisCount)}
              fill={color}
              fillOpacity={0.3}
              stroke={color}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />

            {/* 目盛りの数値（真上の軸に沿って表示） */}
            {Array.from({ length: tickCount }, (_, i) => (i + 1) / tickCount).map((ratio) => (
              <text
                key={ratio}
                x={CENTER + 5}
                y={CENTER - RADIUS * ratio + 14}
                fontSize={13}
                fill={TICK_LABEL_COLOR}
                fontFamily={FONT_FAMILY}
              >
                {formatTick(maxValue * ratio)}
              </text>
            ))}

            {/* 項目名 */}
            {Array.from({ length: axisCount }, (_, i) => {
              const p = pointAt(i, axisCount, 1);
              const anchor = Math.abs(p.cos) < 0.2 ? "middle" : p.cos > 0 ? "start" : "end";
              return (
                <text
                  key={i}
                  x={p.x + p.cos * LABEL_OFFSET_X}
                  y={p.y + p.sin * LABEL_OFFSET_Y}
                  fontSize={18}
                  fontWeight={600}
                  fill={LABEL_COLOR}
                  fontFamily={FONT_FAMILY}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                >
                  {names[i] || `項目${i + 1}`}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={buttonClass} onClick={downloadPng}>
            PNGで保存
          </button>
          <button type="button" className={buttonClass} onClick={downloadSvg}>
            SVGで保存
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted" htmlFor={`${formId}-axes`}>
              項目数（{MIN_AXES}〜{MAX_AXES}）
            </label>
            <select
              id={`${formId}-axes`}
              className={inputClass}
              value={axisCount}
              onChange={(e) => setAxisCount(Number(e.target.value))}
            >
              {Array.from({ length: MAX_AXES - MIN_AXES + 1 }, (_, i) => MIN_AXES + i).map((n) => (
                <option key={n} value={n}>
                  {n}項目
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted" htmlFor={`${formId}-ticks`}>
              目盛りの段数（{MIN_TICKS}〜{MAX_TICKS}）
            </label>
            <select
              id={`${formId}-ticks`}
              className={inputClass}
              value={tickCount}
              onChange={(e) => setTickCount(Number(e.target.value))}
            >
              {Array.from({ length: MAX_TICKS - MIN_TICKS + 1 }, (_, i) => MIN_TICKS + i).map((n) => (
                <option key={n} value={n}>
                  {n}段
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted" htmlFor={`${formId}-max`}>
              外枠の値（最大値）
            </label>
            <input
              id={`${formId}-max`}
              type="number"
              min={1}
              className={inputClass}
              value={maxText}
              onChange={(e) => setMaxText(e.target.value)}
            />
          </div>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs text-muted">配色</legend>
          <div className="flex flex-wrap gap-2.5">
            {PALETTES.map((palette) => {
              const selected = palette.color === color;
              return (
                <button
                  key={palette.color}
                  type="button"
                  aria-label={palette.label}
                  aria-pressed={selected}
                  title={palette.label}
                  onClick={() => setColor(palette.color)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selected ? "border-ink" : "border-transparent"
                  }`}
                  style={{ backgroundColor: palette.color }}
                />
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">項目名と値</p>
            <button type="button" className={buttonClass} onClick={randomize}>
              値をランダムに
            </button>
          </div>
          {Array.from({ length: axisCount }, (_, i) => {
            const numeric = toNumber(values[i]);
            const isOver = numeric > maxValue;
            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2" key={i}>
                <input
                  type="text"
                  aria-label={`項目${i + 1}の名前`}
                  maxLength={NAME_MAX_LENGTH}
                  placeholder={`項目${i + 1}`}
                  className={`${inputClass} w-28`}
                  value={names[i]}
                  onChange={(e) => updateName(i, e.target.value)}
                />
                <input
                  type="range"
                  aria-label={`項目${i + 1}の値（スライダー）`}
                  min={0}
                  max={maxValue}
                  step="any"
                  className="min-w-24 flex-1 accent-accent"
                  value={Math.min(numeric, maxValue)}
                  onChange={(e) => updateValue(i, String(Math.round(Number(e.target.value) * 100) / 100))}
                />
                <input
                  type="number"
                  aria-label={`項目${i + 1}の値`}
                  min={0}
                  className={`${inputClass} w-24`}
                  value={values[i]}
                  onChange={(e) => updateValue(i, e.target.value)}
                />
                {isOver && (
                  <span className="basis-full text-xs text-muted">
                    最大値を超えているため、外枠からはみ出して描画しています。
                    {numeric > maxValue * OVERFLOW_LIMIT && `（最大値の${OVERFLOW_LIMIT * 100}%が描画の上限です）`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
