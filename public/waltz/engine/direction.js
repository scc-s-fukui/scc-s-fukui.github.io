// 「方針」= 次の16小節をどんな雰囲気で作るか。LLMでもルールでも同じ形で表す。
import { KEY_CHOICES } from './theory.js';
import { motifPool } from './motifs.js';

export const MOODS = ['calm', 'bright', 'tender', 'nostalgic'];
export const MODES = ['major', 'minor'];
export const TIME_SLOTS = ['morning', 'day', 'evening', 'night'];
export const TEMPO_MIN = 58;
export const TEMPO_MAX = 84;

// 隣り合う調は五度圏で隣り合うもの。急な転調を避けるために使う。
const CIRCLE = ['Eb', 'Bb', 'F', 'C', 'G', 'D', 'A'];

export const TIME_PROFILES = {
  morning: { tempo: [70, 80], density: [2, 3], level: 0.9, brightness: 0.75 },
  day: { tempo: [68, 80], density: [2, 4], level: 1, brightness: 0.8 },
  evening: { tempo: [62, 72], density: [2, 3], level: 0.8, brightness: 0.55 },
  night: { tempo: [58, 66], density: [1, 2], level: 0.6, brightness: 0.4 },
};

const MOOD_BY_SLOT = {
  morning: ['bright', 'bright', 'calm', 'tender'],
  day: ['calm', 'bright', 'tender', 'nostalgic'],
  evening: ['nostalgic', 'tender', 'calm', 'nostalgic'],
  night: ['calm', 'tender', 'tender', 'calm'],
};

export const MOOD_STYLE = {
  calm: { accomp: 'arpeggio', warmth: 0.8 },
  tender: { accomp: 'arpeggio', warmth: 1 },
  bright: { accomp: 'block', warmth: 0.4 },
  nostalgic: { accomp: 'block', warmth: 0.7 },
};

export function timeSlotOf(hour) {
  const h = Number.isFinite(hour) ? ((Math.floor(hour) % 24) + 24) % 24 : 12;
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function clamp(value, lo, hi) {
  return Math.min(hi, Math.max(lo, value));
}

// 画面で指定できるテンポの範囲（方針のテンポは TEMPO_MIN〜TEMPO_MAX だが、指定はもっと遅く・速くできる）
export const TEMPO_OVERRIDE_RANGE = [40, 240];

// 画面でテンポを指定していればそれを、'auto'（おまかせ）なら方針（LLM・ルール）のテンポを使う
export function resolveTempo(direction, setting) {
  if (typeof setting !== 'number' || !Number.isFinite(setting)) return direction.tempo;
  return clamp(Math.round(setting), TEMPO_OVERRIDE_RANGE[0], TEMPO_OVERRIDE_RANGE[1]);
}

// 揺らぎ（%）: テンポのゆるやかなうねり・フレーズ終わりの減速・音の出だしのずれの大きさ。100 が従来の大きさ。
export const SWAY_RANGE = [0, 200];
export const SWAY_DEFAULT = 100;

// 揺らぎの倍率（0〜2）。数値以外は既定（1）にする
export function swayScale(setting) {
  if (typeof setting !== 'number' || !Number.isFinite(setting)) return SWAY_DEFAULT / 100;
  return clamp(setting, SWAY_RANGE[0], SWAY_RANGE[1]) / 100;
}

// 小節の長さにかける倍率。ゆるやかなうねりに、フレーズ終わり（7・8小節目）の減速を重ねる。
export function barTempoFactor(barInPeriod, setting) {
  const s = swayScale(setting);
  const phraseBar = barInPeriod % 8;
  let factor = 1 + 0.025 * s * Math.sin((barInPeriod / 8) * 2 * Math.PI);
  if (phraseBar === 6) factor *= 1 + 0.03 * s;
  if (phraseBar === 7) factor *= 1 + 0.07 * s;
  return factor;
}

// スウィング（%）: 拍の裏（8分音符の2つ目）を後ろへずらして、3連符の跳ねに近づける。0 が直線的（従来）、100 で 2:1 の完全な3連。
export const SWING_RANGE = [0, 100];
export const SWING_DEFAULT = 0;

// スウィングの倍率（0〜1）。数値以外は既定にする
export function swingScale(setting) {
  if (typeof setting !== 'number' || !Number.isFinite(setting)) return SWING_DEFAULT / 100;
  return clamp(setting, SWING_RANGE[0], SWING_RANGE[1]) / 100;
}

// 小節内の位置（8分音符単位）にスウィングをかける。裏拍（奇数）だけ、最大で1/3単位（1拍の1/6）遅らせる。
export function swingUnit(u, setting) {
  return u + (Math.round(u) % 2 === 1 ? swingScale(setting) / 3 : 0);
}

// 音の開始位置と長さ（8分音符単位）にスウィングをかける。終わりの位置も同じ規則でずらすので、音がつながったまま跳ねる。
export function swingSpan(u, dur, setting) {
  const start = swingUnit(u, setting);
  return { start, dur: swingUnit(u + dur, setting) - start };
}

// 直前に使った断片は避ける（同じ組が続くと単調になるため）
function pickMotifPair(mood, rng, exclude = []) {
  const candidates = motifPool().filter((m) => !exclude.includes(m.id));
  const matching = candidates.filter((m) => m.moods.includes(mood));
  const a = rng.pick(matching.length >= 2 ? matching : candidates);
  const b = rng.pick(candidates.filter((m) => m.id !== a.id));
  return [a.id, b.id];
}

const range = (from, to, step = 1) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

export const CHOICE_MOTIF_COUNT = 6;

// LLMに選ばせる候補。偏りを防ぐため、コード側で「選べる範囲」を絞って渡す。
//   調: 前の調と五度圏で隣り合うものまで / 断片: 直前の組を除いてシャッフルした6個
//   雰囲気・テンポ・音数: 時間帯の範囲内
export function allowedChoices(prev, slot, rng) {
  const profile = TIME_PROFILES[slot] ?? TIME_PROFILES.day;

  let keys = ['C', 'G', 'F', 'D'];
  if (prev) {
    const idx = CIRCLE.indexOf(prev.key);
    keys = CIRCLE.filter((_, i) => Math.abs(i - idx) <= 1);
  }

  let tempos = range(profile.tempo[0], profile.tempo[1], 2);
  if (prev) {
    const near = tempos.filter((t) => Math.abs(t - prev.tempo) <= 6);
    if (near.length >= 2) tempos = near;
  }

  const exclude = prev ? [prev.motifA, prev.motifB] : [];
  const motifs = rng
    .shuffle(motifPool().filter((m) => !exclude.includes(m.id)))
    .slice(0, CHOICE_MOTIF_COUNT)
    .map((m) => m.id);

  return {
    moods: [...new Set(MOOD_BY_SLOT[slot] ?? MOOD_BY_SLOT.day)],
    keys,
    modes: prev ? [prev.mode, prev.mode === 'major' ? 'minor' : 'major'] : [...MODES],
    tempos,
    familiarities: range(2, 8),
    densities: range(profile.density[0], profile.density[1]),
    motifs,
  };
}

// ルールだけで方針を作る（LLMが使えないとき・間に合わないときの代わり）
export function randomDirection(prev, slot, rng) {
  const profile = TIME_PROFILES[slot] ?? TIME_PROFILES.day;
  const mood = rng.pick(MOOD_BY_SLOT[slot] ?? MOOD_BY_SLOT.day);

  let key;
  let mode;
  if (prev) {
    const idx = CIRCLE.indexOf(prev.key);
    key = CIRCLE[clamp(idx + rng.pick([-1, 0, 0, 1]), 0, CIRCLE.length - 1)];
    mode = rng.chance(0.2) ? (prev.mode === 'major' ? 'minor' : 'major') : prev.mode;
  } else {
    key = rng.pick(['C', 'G', 'F', 'D']);
    mode = rng.chance(slot === 'night' ? 0.35 : 0.2) ? 'minor' : 'major';
  }

  let tempo = rng.int(profile.tempo[0], profile.tempo[1]);
  if (prev) tempo = Math.round((prev.tempo + tempo) / 2);

  const [motifA, motifB] = pickMotifPair(mood, rng, prev ? [prev.motifA, prev.motifB] : []);
  return {
    mood,
    key,
    mode,
    tempo: clamp(tempo, TEMPO_MIN, TEMPO_MAX),
    familiarity: rng.int(3, 7) / 10,
    density: rng.int(profile.density[0], profile.density[1]),
    motifA,
    motifB,
  };
}

// 作業タイマーの位相に合わせた方針の調整。集中中は音数を減らして静かに、休憩中は少し明るく軽やかにする。
// 雰囲気は「おだやか/やさしい」（集中）・「あかるい/なつかしい」（休憩）のどちらかに寄せ、音数とテンポは決まった幅だけずらす。
// 画面で雰囲気やテンポを固定している場合は、呼び出し側でこのあとに上書きする。
export const PHASE_PROFILES = {
  focus: { moods: { calm: 'calm', tender: 'tender', bright: 'calm', nostalgic: 'tender' }, densityDelta: -1, tempoDelta: -4 },
  break: { moods: { calm: 'bright', tender: 'nostalgic', bright: 'bright', nostalgic: 'nostalgic' }, densityDelta: 1, tempoDelta: 6 },
};

// phase が未指定・不明なら方針をそのまま返す。元の方針は書き換えない。
export function applyPhase(direction, phase) {
  const profile = PHASE_PROFILES[phase];
  if (!profile) return direction;
  return {
    ...direction,
    mood: profile.moods[direction.mood] ?? direction.mood,
    density: clamp(direction.density + profile.densityDelta, 1, 5),
    tempo: clamp(direction.tempo + profile.tempoDelta, TEMPO_MIN, TEMPO_MAX),
  };
}

// 進行モード（画面の選択）: 'standard' = ワルツの定型の進行、'canon' = カノン進行特化、
// 'major' = 長調特化、'minor' = 短調特化（進行は定型で、調の長短だけ固定する）
export const PROGRESSION_SETTINGS = ['standard', 'canon', 'major', 'minor'];

// 画面の進行モードを方針に反映する。未指定・不明な値は 'standard'。元の方針は書き換えない。
// 長調・短調の特化は、LLM・ルールが選んだ長短を上書きする（調そのものは方針のまま）。
export function applyProgressionSetting(direction, setting) {
  const chosen = PROGRESSION_SETTINGS.includes(setting) ? setting : 'standard';
  return {
    ...direction,
    progression: chosen === 'canon' ? 'canon' : 'standard',
    mode: chosen === 'major' || chosen === 'minor' ? chosen : direction.mode,
  };
}

// 断片のつなぎ方: 'free' = 方針どおり（従来）、'same' = 前半（A）と後半（B）を同じ断片にする（例: メヌエット風 → メヌエット風）
export const MOTIF_LINK_MODES = ['free', 'same'];

// 'same' のとき、B を A と同じ断片にする。A は変えない。元の方針は書き換えない。
export function applyMotifLink(direction, mode) {
  return mode === 'same' ? { ...direction, motifB: direction.motifA } : direction;
}

// 外から来た値（LLMの出力・ブラウザからの入力）を安全な範囲に収める。fallback は必須。
export function normalizeDirection(raw, fallback) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const ids = motifPool().map((m) => m.id);
  const enumOr = (value, list, fb) => (list.includes(value) ? value : fb);
  const numOr = (value, lo, hi, fb) => {
    const n = typeof value === 'number' ? value : Number.NaN;
    return Number.isFinite(n) ? clamp(n, lo, hi) : fb;
  };

  const motifA = enumOr(src.motifA, ids, fallback.motifA);
  let motifB = enumOr(src.motifB, ids, fallback.motifB);
  if (motifB === motifA) motifB = ids[(ids.indexOf(motifA) + 1) % ids.length];

  return {
    mood: enumOr(src.mood, MOODS, fallback.mood),
    key: enumOr(src.key, KEY_CHOICES, fallback.key),
    mode: enumOr(src.mode, MODES, fallback.mode),
    tempo: Math.round(numOr(src.tempo, TEMPO_MIN, TEMPO_MAX, fallback.tempo)),
    familiarity: numOr(src.familiarity, 0, 1, fallback.familiarity),
    density: Math.round(numOr(src.density, 1, 5, fallback.density)),
    motifA,
    motifB,
  };
}

// LLMは familiarity を 0〜10 の整数で返す（小型モデルでも扱いやすいため）。内部では 0〜1。
export function directionFromLlm(raw, fallback) {
  const familiarity = raw && typeof raw.familiarity === 'number' ? raw.familiarity / 10 : undefined;
  return normalizeDirection({ ...raw, familiarity }, fallback);
}
