"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  createWaltzPlayer,
  loadWaltzEngine,
  type BarView,
  type Instrument,
  type Mood,
  type ProgressionMode,
  type TimeSlot,
  type WaltzPlayer,
  type WaltzSettings,
} from "./player";

const SETTINGS_KEY = "playground.waltz-loop.settings";

const DEFAULT_SETTINGS: WaltzSettings = {
  volume: 60,
  melody: 70,
  sway: 100,
  swing: 0,
  instrument: "piano",
  tempo: "auto",
  mood: "auto",
  slot: "auto",
  familiarity: "auto",
  progression: "standard",
};

const TEMPO_RANGE = [40, 240] as const;
const SWAY_RANGE = [0, 200] as const;
const SWING_RANGE = [0, 100] as const;

const MOOD_LABEL: Record<Mood, string> = { calm: "おだやか", bright: "あかるい", tender: "やさしい", nostalgic: "なつかしい" };
const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: "piano", label: "ピアノ" },
  { value: "flute", label: "フルート" },
  { value: "musicbox", label: "オルゴール" },
  { value: "harp", label: "ハープ" },
];
const SLOTS: { value: TimeSlot | "auto"; label: string }[] = [
  { value: "auto", label: "自動（現在時刻）" },
  { value: "morning", label: "朝" },
  { value: "day", label: "昼" },
  { value: "evening", label: "夕方" },
  { value: "night", label: "夜" },
];
const FAMILIARITIES = [
  { value: "auto", label: "おまかせ" },
  { value: "0.2", label: "薄め（大きく変える）" },
  { value: "0.5", label: "ふつう" },
  { value: "0.85", label: "濃いめ（原曲に近い）" },
];

const isOneOf = <T extends string>(value: unknown, list: readonly T[]): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

const num = (value: unknown, lo: number, hi: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(hi, Math.max(lo, value)) : fallback;

/** 保存済みの設定を安全な値に直す（壊れていても既定値で動かす） */
function normalizeSettings(raw: unknown): WaltzSettings {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const d = DEFAULT_SETTINGS;
  return {
    volume: num(src.volume, 0, 100, d.volume),
    melody: num(src.melody, 0, 100, d.melody),
    sway: num(src.sway, SWAY_RANGE[0], SWAY_RANGE[1], d.sway),
    swing: num(src.swing, SWING_RANGE[0], SWING_RANGE[1], d.swing),
    instrument: isOneOf(src.instrument, INSTRUMENTS.map((i) => i.value)) ? src.instrument : d.instrument,
    tempo: typeof src.tempo === "number" ? Math.round(num(src.tempo, TEMPO_RANGE[0], TEMPO_RANGE[1], 72)) : "auto",
    mood: isOneOf(src.mood, ["auto", "calm", "bright", "tender", "nostalgic"] as const) ? src.mood : d.mood,
    slot: isOneOf(src.slot, SLOTS.map((s) => s.value)) ? src.slot : d.slot,
    familiarity: typeof src.familiarity === "number" ? num(src.familiarity, 0, 1, 0.5) : "auto",
    progression: isOneOf(src.progression, ["standard", "canon"] as const) ? src.progression : d.progression,
  };
}

// 設定はブラウザに保存する。サーバーで作る HTML とずれないよう、読み込みは useSyncExternalStore に任せる
let cachedSettings: WaltzSettings | null = null;
const listeners = new Set<() => void>();

function readSettings(): WaltzSettings {
  if (!cachedSettings) {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      cachedSettings = saved ? normalizeSettings(JSON.parse(saved)) : DEFAULT_SETTINGS;
    } catch {
      cachedSettings = DEFAULT_SETTINGS; // 保存済みの設定が読めなくても、既定値で動かす
    }
  }
  return cachedSettings;
}

function writeSettings(next: WaltzSettings) {
  cachedSettings = next;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // 保存できなくても再生には影響しない
  }
  listeners.forEach((listener) => listener());
}

function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const serverSettings = () => DEFAULT_SETTINGS;

type Status = "idle" | "loading" | "playing" | "error";

export default function WaltzLoop() {
  const settings = useSyncExternalStore(subscribeSettings, readSettings, serverSettings);
  const [status, setStatus] = useState<Status>("idle");
  const [bar, setBar] = useState<BarView | null>(null);
  const [motifs, setMotifs] = useState<BarView["motifs"]>();

  const playerRef = useRef<WaltzPlayer | null>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  // ページを離れたら音を止める
  useEffect(() => {
    return () => {
      void playerRef.current?.stop();
    };
  }, []);

  const update = useCallback(<K extends keyof WaltzSettings>(key: K, value: WaltzSettings[K]) => {
    writeSettings({ ...readSettings(), [key]: value });
    if (key === "volume") playerRef.current?.setVolume(value as number);
    if (key === "instrument") playerRef.current?.setInstrument(value as Instrument);
  }, []);

  const onBar = useCallback((view: BarView) => {
    setBar(view);
    if (view.motifs) setMotifs(view.motifs);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      orbRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], {
        duration: view.seconds * 500,
        easing: "ease-in-out",
      });
    }
  }, []);

  const toggle = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (playerRef.current?.playing) {
        await playerRef.current.stop();
        setStatus("idle");
        return;
      }
      setStatus("loading");
      const engine = await loadWaltzEngine();
      playerRef.current ??= createWaltzPlayer(engine, readSettings, onBar);
      await playerRef.current.start();
      setStatus("playing");
    } catch (err) {
      console.error("waltz-loop failed:", err);
      setStatus("error");
    } finally {
      busyRef.current = false;
    }
  }, [onBar]);

  const playing = status === "playing";
  const tempoAuto = settings.tempo === "auto";

  return (
    <div className="waltz">
      <div className="waltz-stage">
        <div ref={orbRef} className={`waltz-orb ${playing ? "is-playing" : ""}`} aria-hidden="true" />
        <button type="button" className="waltz-play" onClick={toggle} disabled={status === "loading"}>
          {status === "loading" ? "LOADING…" : playing ? "■ STOP" : "▶ PLAY"}
        </button>
        {status === "error" && (
          <p className="waltz-error" role="alert">
            再生を始められませんでした。ページを読み込み直してから、もう一度お試しください。
          </p>
        )}
      </div>

      <dl className="waltz-now" aria-live="off">
        <div>
          <dt>CHORD</dt>
          <dd className="waltz-chord">{bar?.chordName ?? "―"}</dd>
        </div>
        <div>
          <dt>KEY</dt>
          <dd>{bar ? `${bar.key} ${bar.mode === "major" ? "長調" : "短調"}` : "―"}</dd>
        </div>
        <div>
          <dt>MOOD</dt>
          <dd>{bar ? MOOD_LABEL[bar.mood] : "―"}</dd>
        </div>
        <div>
          <dt>TEMPO</dt>
          <dd>{bar ? `♩=${bar.tempo}` : "―"}</dd>
        </div>
        <div>
          <dt>BAR</dt>
          <dd>{bar ? `${bar.barInPeriod + 1} / 16` : "―"}</dd>
        </div>
      </dl>
      <p className="waltz-motifs">
        {motifs
          ? `断片: ${motifs.a} → ${motifs.b}　原曲の面影 ${Math.round(motifs.familiarity * 100)}%`
          : "再生を押すと、旋律の断片から新しいワルツが16小節ずつ生まれます。"}
      </p>

      <div className="waltz-controls">
        <label>
          音量
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => update("volume", Number(e.target.value))}
          />
        </label>
        <label>
          主旋律の音量
          <input
            type="range"
            min={0}
            max={100}
            value={settings.melody}
            onChange={(e) => update("melody", Number(e.target.value))}
          />
        </label>
        <label>
          主旋律の楽器
          <select value={settings.instrument} onChange={(e) => update("instrument", e.target.value as Instrument)}>
            {INSTRUMENTS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          テンポ
          <span className="waltz-range-row">
            <input
              type="range"
              min={TEMPO_RANGE[0]}
              max={TEMPO_RANGE[1]}
              value={tempoAuto ? 72 : settings.tempo}
              disabled={tempoAuto}
              onChange={(e) => update("tempo", Number(e.target.value))}
            />
            <output>{tempoAuto ? "自動" : settings.tempo}</output>
          </span>
        </label>
        <label>
          テンポの決め方
          <span>
            <input
              type="checkbox"
              checked={tempoAuto}
              onChange={(e) => update("tempo", e.target.checked ? "auto" : (bar?.tempo ?? 72))}
            />{" "}
            おまかせ（時間帯に任せる）
          </span>
        </label>
        <label>
          揺らぎ
          <span className="waltz-range-row">
            <input
              type="range"
              min={SWAY_RANGE[0]}
              max={SWAY_RANGE[1]}
              step={10}
              value={settings.sway}
              onChange={(e) => update("sway", Number(e.target.value))}
            />
            <output>{settings.sway}%</output>
          </span>
        </label>
        <label>
          スウィング
          <span className="waltz-range-row">
            <input
              type="range"
              min={SWING_RANGE[0]}
              max={SWING_RANGE[1]}
              step={10}
              value={settings.swing}
              onChange={(e) => update("swing", Number(e.target.value))}
            />
            <output>{settings.swing}%</output>
          </span>
        </label>
        <label>
          雰囲気
          <select value={settings.mood} onChange={(e) => update("mood", e.target.value as WaltzSettings["mood"])}>
            <option value="auto">おまかせ</option>
            {(Object.keys(MOOD_LABEL) as Mood[]).map((m) => (
              <option key={m} value={m}>
                {MOOD_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
        <label>
          時間帯
          <select value={settings.slot} onChange={(e) => update("slot", e.target.value as WaltzSettings["slot"])}>
            {SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          原曲の面影
          <select
            value={settings.familiarity === "auto" ? "auto" : String(settings.familiarity)}
            onChange={(e) => update("familiarity", e.target.value === "auto" ? "auto" : Number(e.target.value))}
          >
            {FAMILIARITIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          進行モード
          <select value={settings.progression} onChange={(e) => update("progression", e.target.value as ProgressionMode)}>
            <option value="standard">おまかせ（ワルツの定型）</option>
            <option value="canon">カノン進行特化</option>
          </select>
        </label>
        <p className="waltz-hint">
          音量・楽器・テンポ・揺らぎ・スウィングは数秒以内に切り替わります。雰囲気・時間帯・面影・進行モードは、次の16小節から反映されます。
        </p>
      </div>
    </div>
  );
}
