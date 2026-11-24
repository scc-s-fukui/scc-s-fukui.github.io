// エンドレス・ワルツの再生ループ。
// 16小節ぶんの楽譜をその都度作り、AudioContext の時計に合わせて少し先まで予約する。
// 方針（雰囲気・調・テンポ・断片）はルールだけで決めるので、サーバーもローカルLLMも使わない。
// 楽譜を作るエンジンと音源は public/waltz にある素の JS で、実行時に読み込む。

export type Mood = "calm" | "bright" | "tender" | "nostalgic";
export type TimeSlot = "morning" | "day" | "evening" | "night";
export type Instrument = "piano" | "flute" | "musicbox" | "xylo" | "glock" | "glockHigh" | "harp";
export type ProgressionMode = "standard" | "canon" | "major" | "minor";
export type MotifLink = "free" | "same";

export type Direction = {
  mood: Mood;
  key: string;
  mode: "major" | "minor";
  tempo: number;
  familiarity: number;
  density: number;
  motifA: string;
  motifB: string;
  progression?: ProgressionMode;
};

type Note = { u: number; dur: number; midi: number; vel: number; voice?: string };
type DrumHit = { u: number; voice: string; vel: number };
type PeriodBar = { melody: Note[]; accomp: Note[]; drums?: DrumHit[]; chordName: string; barInPeriod: number };
type QueuedBar = PeriodBar & { direction: Direction; slot: TimeSlot };

type Rng = { next(): number };
type Audio = {
  ctx: AudioContext;
  play(note: { time: number; midi: number; dur: number; vel: number; voice: string }): void;
  playDrum(hit: { time: number; voice: string; vel: number }): void;
  resume(): Promise<void>;
  setMelodyInstrument(instrument: string): void;
  setVolume(volume: number): void;
  setBrightness(brightness: number): void;
  close(): Promise<void>;
};

/** public/waltz のモジュールのうち、使うものだけの型 */
export type WaltzEngine = {
  createRng(): Rng;
  createAudio(): Audio;
  generatePeriod(direction: Direction, rng: Rng): { bars: PeriodBar[] };
  randomDirection(prev: Direction | null, slot: TimeSlot, rng: Rng): Direction;
  getMotif(id: string): { label: string };
  resolveTempo(direction: Direction, setting: "auto" | number): number;
  barTempoFactor(barInPeriod: number, setting: number): number;
  swayScale(setting: number): number;
  swingSpan(u: number, dur: number, setting: number): { start: number; dur: number };
  swingUnit(u: number, setting: number): number;
  applyProgressionSetting(direction: Direction, setting: ProgressionMode): Direction;
  applyMotifLink(direction: Direction, mode: MotifLink): Direction;
  timeSlotOf(hour: number): TimeSlot;
  clamp(value: number, lo: number, hi: number): number;
  TIME_PROFILES: Record<TimeSlot, { level: number; brightness: number }>;
  MOOD_STYLE: Record<Mood, { warmth: number }>;
};

export type WaltzSettings = {
  volume: number; // 0〜100
  melody: number; // 主旋律の音量 0〜100
  drums: number; // ドラムの音量 0〜100（0 でなし）
  sway: number; // 揺らぎ（%）
  swing: number; // スウィング（%）
  instrument: Instrument;
  tempo: "auto" | number; // 'auto' なら方針に任せる。数値なら拍/分で固定
  mood: Mood | "auto";
  slot: TimeSlot | "auto";
  familiarity: "auto" | number; // 原曲の面影 0〜1
  progression: ProgressionMode;
  motifLink: MotifLink;
};

/** 画面に出す、いま鳴っている小節の情報 */
export type BarView = {
  chordName: string;
  key: string;
  mode: "major" | "minor";
  mood: Mood;
  tempo: number;
  barInPeriod: number;
  seconds: number;
  /** 16小節の先頭だけ入る */
  motifs?: { a: string; b: string; familiarity: number };
};

const LOOKAHEAD_S = 1.5;
const TICK_MS = 200;
const MODULE_BASE = "/waltz";

// 素の JS をバンドルせず、そのままブラウザに読み込ませる（ビルド時に解決しないよう変数で指定する）
const importPlain = (path: string): Promise<Record<string, unknown>> => {
  const url = `${MODULE_BASE}/${path}`;
  return import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
};

let engineLoad: Promise<WaltzEngine> | null = null;

export function loadWaltzEngine(): Promise<WaltzEngine> {
  engineLoad ??= (async () => {
    const [rng, direction, generator, motifs, audio] = await Promise.all([
      importPlain("engine/rng.js"),
      importPlain("engine/direction.js"),
      importPlain("engine/generator.js"),
      importPlain("engine/motifs.js"),
      importPlain("audio.js"),
    ]);
    return { ...rng, ...direction, ...generator, ...motifs, ...audio } as unknown as WaltzEngine;
  })().catch((err) => {
    engineLoad = null; // 読み込みに失敗しても、次の再生で再挑戦できるようにする
    throw err;
  });
  return engineLoad;
}

export type WaltzPlayer = {
  readonly playing: boolean;
  start(): Promise<void>;
  stop(): Promise<void>;
  setVolume(percent: number): void;
  setInstrument(instrument: Instrument): void;
};

export function createWaltzPlayer(
  engine: WaltzEngine,
  getSettings: () => WaltzSettings,
  onBar: (view: BarView) => void,
): WaltzPlayer {
  const rng = engine.createRng();
  let audio: Audio | null = null;
  let playing = false;
  let starting = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let raf = 0;
  let queue: QueuedBar[] = [];
  let uiEvents: { time: number; bar: QueuedBar; dur: number; first: boolean }[] = [];
  let nextBarTime = 0;
  let direction: Direction | null = null;

  const currentSlot = (s: WaltzSettings): TimeSlot =>
    s.slot === "auto" ? engine.timeSlotOf(new Date().getHours()) : s.slot;

  function applyOverrides(base: Direction, s: WaltzSettings): Direction {
    const out = { ...base };
    if (s.mood !== "auto") out.mood = s.mood;
    if (s.familiarity !== "auto") out.familiarity = s.familiarity;
    const withProgression = engine.applyProgressionSetting(out, s.progression);
    return { ...withProgression, motifB: engine.applyMotifLink(withProgression, s.motifLink).motifB };
  }

  function buildNextPeriod() {
    const s = getSettings();
    const slot = currentSlot(s);
    const next = applyOverrides(engine.randomDirection(direction, slot, rng), s);
    direction = next;
    const { bars } = engine.generatePeriod(next, rng);
    queue.push(...bars.map((bar) => ({ ...bar, direction: next, slot })));
  }

  // 小節ごとに、ゆるやかなテンポの揺れと、フレーズの終わりの減速をかける（大きさは「揺らぎ」の設定）
  function barDuration(bar: QueuedBar, s: WaltzSettings) {
    const beat = 60 / engine.resolveTempo(bar.direction, s.tempo);
    return beat * 3 * engine.barTempoFactor(bar.barInPeriod, s.sway);
  }

  function scheduleBar(a: Audio, bar: QueuedBar, t0: number, barDur: number, s: WaltzSettings) {
    const unit = barDur / 6;
    const profile = engine.TIME_PROFILES[bar.slot];
    const sway = engine.swayScale(s.sway);
    const jitter = (amount: number) => (rng.next() - 0.5) * 2 * amount * sway; // 音の出だしのずれ

    if (bar.barInPeriod === 0) {
      const { warmth } = engine.MOOD_STYLE[bar.direction.mood];
      a.setBrightness(engine.clamp(profile.brightness * (1.2 - 0.4 * warmth), 0.2, 1));
    }
    for (const n of bar.melody) {
      const at = engine.swingSpan(n.u, n.dur, s.swing);
      a.play({
        time: t0 + at.start * unit + jitter(0.006),
        midi: n.midi,
        dur: at.dur * unit,
        vel: n.vel * profile.level * (s.melody / 100),
        voice: "melody",
      });
    }
    if (s.drums > 0) {
      for (const n of bar.drums ?? []) {
        a.playDrum({
          time: t0 + engine.swingUnit(n.u, s.swing) * unit + jitter(0.003),
          voice: n.voice,
          vel: n.vel * profile.level * (s.drums / 100),
        });
      }
    }
    for (const n of bar.accomp) {
      const at = engine.swingSpan(n.u, n.dur, s.swing);
      a.play({
        time: t0 + at.start * unit + jitter(0.003),
        midi: n.midi,
        dur: at.dur * unit,
        vel: n.vel * profile.level,
        voice: n.voice ?? "chord",
      });
    }
  }

  function tick() {
    if (!audio) return;
    const { ctx } = audio;
    const s = getSettings();
    if (nextBarTime < ctx.currentTime) nextBarTime = ctx.currentTime + 0.1; // 止まっていた後の立て直し
    while (nextBarTime < ctx.currentTime + LOOKAHEAD_S) {
      if (queue.length === 0) buildNextPeriod();
      const bar = queue.shift();
      if (!bar) return;
      const dur = barDuration(bar, s);
      scheduleBar(audio, bar, nextBarTime, dur, s);
      uiEvents.push({ time: nextBarTime, bar, dur, first: bar.barInPeriod === 0 });
      if (uiEvents.length > 64) uiEvents.shift();
      nextBarTime += dur;
    }
  }

  function showBar({ bar, dur, first }: (typeof uiEvents)[number]) {
    const { direction: d } = bar;
    onBar({
      chordName: bar.chordName,
      key: d.key,
      mode: d.mode,
      mood: d.mood,
      tempo: engine.resolveTempo(d, getSettings().tempo),
      barInPeriod: bar.barInPeriod,
      seconds: dur,
      motifs: first
        ? { a: engine.getMotif(d.motifA).label, b: engine.getMotif(d.motifB).label, familiarity: d.familiarity }
        : undefined,
    });
  }

  function frame() {
    if (!audio) return;
    const now = audio.ctx.currentTime;
    while (uiEvents.length && uiEvents[0].time <= now) {
      const event = uiEvents.shift();
      if (event) showBar(event);
    }
    raf = requestAnimationFrame(frame);
  }

  return {
    get playing() {
      return playing;
    },
    async start() {
      if (starting || playing) return;
      starting = true;
      try {
        const s = getSettings();
        const created = engine.createAudio();
        audio = created;
        await created.resume(); // ブラウザの仕様で、再生はユーザー操作が起点
        created.setVolume(s.volume / 100);
        created.setMelodyInstrument(s.instrument);
        queue = [];
        uiEvents = [];
        direction = null;
        nextBarTime = created.ctx.currentTime + 0.3;
        playing = true;
        timer = setInterval(tick, TICK_MS);
        tick();
        raf = requestAnimationFrame(frame);
      } finally {
        starting = false;
      }
    },
    async stop() {
      playing = false;
      clearInterval(timer);
      cancelAnimationFrame(raf);
      const closing = audio;
      audio = null;
      // 予約済みの音が次の再生に混ざらないよう、毎回作り直す
      await closing?.close();
    },
    setVolume(percent) {
      audio?.setVolume(percent / 100);
    },
    setInstrument(instrument) {
      audio?.setMelodyInstrument(instrument);
    },
  };
}
