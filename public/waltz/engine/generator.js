// 16小節（8小節のフレーズ2つ）のワルツを作る。
// 前半は半終止（Vで終わる）、後半は完全終止（Iで終わる）にして「問いと答え」にする。
import { UNITS_PER_BAR as U, chordInfo, pitchOf, snapToChord } from './theory.js';
import { getMotifOr } from './motifs.js';
import { MOOD_STYLE } from './direction.js';
import { drumsForBar } from './drums.js';

export const PHRASE_BARS = 8;
export const PERIOD_BARS = PHRASE_BARS * 2;

const MELODY_RANGE = [58, 82];

export const PROGRESSIONS = {
  major: {
    half: [
      ['I', 'vi', 'IV', 'V', 'I', 'IV', 'ii', 'V'],
      ['I', 'IV', 'I', 'V', 'vi', 'IV', 'ii', 'V'],
      ['I', 'iii', 'vi', 'IV', 'I', 'vi', 'IV', 'V'],
    ],
    full: [
      ['I', 'vi', 'ii', 'V', 'I', 'IV', 'V', 'I'],
      ['I', 'IV', 'V', 'I', 'vi', 'ii', 'V', 'I'],
      ['I', 'V', 'vi', 'iii', 'IV', 'I', 'V', 'I'],
    ],
  },
  minor: {
    half: [
      ['i', 'iv', 'VII', 'III', 'VI', 'iv', 'ii', 'V'],
      ['i', 'VI', 'III', 'VII', 'i', 'iv', 'ii', 'V'],
      ['i', 'iv', 'i', 'V', 'VI', 'iv', 'ii', 'V'],
    ],
    full: [
      ['i', 'iv', 'V', 'i', 'VI', 'iv', 'V', 'i'],
      ['i', 'VI', 'iv', 'V', 'III', 'VII', 'V', 'i'],
      ['i', 'iv', 'VII', 'III', 'VI', 'ii', 'V', 'i'],
    ],
  },
};

// カノン進行（I V vi iii IV I IV V）に特化した進行表。前半は半終止（V）、後半は完全終止（I）で終わる。
// 後半は8小節目を主和音にするため、末尾の IV → V を V → I（または IV → I）に置き換えている。
export const CANON_PROGRESSIONS = {
  major: {
    half: [
      ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
      ['I', 'V', 'vi', 'iii', 'IV', 'I', 'ii', 'V'],
    ],
    full: [
      ['I', 'V', 'vi', 'iii', 'IV', 'I', 'V', 'I'],
      ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'I'],
    ],
  },
  minor: {
    half: [
      ['i', 'V', 'VI', 'III', 'iv', 'i', 'iv', 'V'],
      ['i', 'V', 'VI', 'III', 'iv', 'i', 'ii', 'V'],
    ],
    full: [
      ['i', 'V', 'VI', 'III', 'iv', 'i', 'V', 'i'],
      ['i', 'V', 'VI', 'III', 'iv', 'i', 'iv', 'i'],
    ],
  },
};

// 進行モード: 'standard' = ワルツの定型の進行、'canon' = カノン進行だけを使う
export const PROGRESSION_MODES = ['standard', 'canon'];

// ---- 変形（度数の列を別の度数の列にする） ----

function shiftNotes(notes, steps) {
  return notes.map((n) => ({ ...n, deg: n.deg + steps }));
}

function invertNotes(notes) {
  const pivot = notes[0].deg;
  return notes.map((n) => ({ ...n, deg: 2 * pivot - n.deg }));
}

// 長い音の頭に隣接音（前打音）を付ける。前打音は和音に吸着させず、本来の音を和音に吸着させる。
function ornamentNotes(notes, rng) {
  const out = [];
  let used = 0;
  notes.forEach((n, i) => {
    if (i > 0 && n.dur >= 2 && used < 2 && rng.chance(0.6)) {
      used += 1;
      out.push({ u: n.u, deg: n.deg + rng.pick([-1, 1]), dur: 1, free: true });
      out.push({ u: n.u + 1, deg: n.deg, dur: n.dur - 1, anchor: true });
    } else {
      out.push({ ...n });
    }
  });
  return out;
}

// 裏拍の短い音を前の音に溶かして、音数を減らす
function thinNotes(notes, rng) {
  const out = [];
  for (const n of notes) {
    const prev = out[out.length - 1];
    if (prev && n.dur === 1 && n.u % 2 === 1 && prev.u + prev.dur === n.u && rng.chance(0.7)) {
      prev.dur += 1;
    } else {
      out.push({ ...n });
    }
  }
  return out;
}

// 次の音へ2度以上跳ぶ長い音を割って、経過音を入れる
function passingNotes(notes) {
  const out = [];
  notes.forEach((n, i) => {
    const next = notes[i + 1];
    if (next && n.dur >= 2 && next.u === n.u + n.dur && Math.abs(next.deg - n.deg) >= 2) {
      out.push({ ...n, dur: n.dur - 1 });
      out.push({ u: n.u + n.dur - 1, deg: n.deg + Math.sign(next.deg - n.deg), dur: 1, free: true });
    } else {
      out.push({ ...n });
    }
  });
  return out;
}

const TRANSFORMS = {
  invert: invertNotes,
  passing: passingNotes,
  thin: thinNotes,
  ornament: ornamentNotes,
};
const OP_ORDER = ['invert', 'passing', 'thin', 'ornament'];

// 親しみやすさが低いほど、変形を多くかける
function opCount(familiarity, rng) {
  return Math.floor((1 - familiarity) * 3 + rng.next());
}

function pickOps(count, density, allowInvert, rng) {
  const pool = ['ornament', 'ornament'];
  if (density >= 4) pool.push('passing', 'passing');
  else pool.push('passing');
  if (density <= 2) pool.push('thin', 'thin');
  else pool.push('thin');
  if (allowInvert) pool.push('invert');
  const chosen = new Set();
  while (chosen.size < Math.min(count, new Set(pool).size)) chosen.add(rng.pick(pool));
  return OP_ORDER.filter((op) => chosen.has(op));
}

function realize(motif, { shift = 0, ops = [] }, rng, tune) {
  let notes = motif.notes.map(([u, deg, dur]) => ({ u, deg, dur }));
  for (const op of ops) notes = TRANSFORMS[op](notes, rng);
  return fitDegrees(shiftNotes(notes, shift), tune);
}

// 断片全体を1オクターブ単位でずらして、その調の音域（MELODY_RANGE）に収める。
// 音ごとに1オクターブずらすと旋律の形が崩れるので、断片ぜんぶを同じだけずらす。
function fitDegrees(notes, { key, mode }) {
  const midiOf = (deg) => pitchOf(key, mode, deg);
  let out = notes;
  for (let i = 0; i < 3; i += 1) {
    const hi = Math.max(...out.map((n) => n.deg));
    const lo = Math.min(...out.map((n) => n.deg));
    if (midiOf(hi) > MELODY_RANGE[1] && midiOf(lo - 7) >= MELODY_RANGE[0]) out = shiftNotes(out, -7);
    else if (midiOf(lo) < MELODY_RANGE[0] && midiOf(hi + 7) <= MELODY_RANGE[1]) out = shiftNotes(out, 7);
    else break;
  }
  return out;
}

// ---- 組み立て ----

function placeNotes(bars, startBar, notes) {
  for (const n of notes) {
    bars[startBar + Math.floor(n.u / U)].notes.push({ ...n, u: n.u % U });
  }
}

function lastDegree(bar) {
  const sorted = [...bar.notes].sort((a, b) => a.u - b.u);
  return sorted.length ? sorted[sorted.length - 1].deg : null;
}

// 1小節の旋律を単音にそろえる（重なりを詰め、小節をまたがない）
function sanitize(notes) {
  const sorted = [...notes].sort((a, b) => a.u - b.u);
  const out = [];
  sorted.forEach((n, i) => {
    const limit = i + 1 < sorted.length ? sorted[i + 1].u : U;
    const dur = Math.min(n.dur, limit - n.u, U - n.u);
    if (dur > 0 && n.u >= 0 && n.u < U) out.push({ ...n, dur });
  });
  return out;
}

// 伴奏のパターン = 3拍のうち、どの拍で音を出すか（'123' は全部、'13' は1拍目と3拍目だけ）。
// 1拍目は低音、2・3拍目は和音（アルペジオなら分散和音）を受け持つ。
export const ACCOMP_PATTERNS = ['123', '12', '13', '23'];

// 利用者が作った伴奏パターン（有効なものだけ）。音は和音に対する相対で持つ:
//   { id, weight, events: [{ u, voice: 'bass', tone: 'root'|'third'|'fifth'|'octave' } | { u, voice: 'chord', tone: 0|1|2 }] }
let customPatterns = [];

export function setCustomPatterns(list) {
  customPatterns = list.map((p) => ({ ...p }));
}

// 自作パターンの音を、そのコードの実際の音に直す。低音は小節の終わりまで、和音は2単位ぶん鳴らす。
function accompanyCustom(chord, style, def, rng) {
  const chordVoice = style === 'arpeggio' ? 'harp' : 'chord';
  const bassOffset = { root: 0, third: chord.thirdSemis, fifth: chord.fifthSemis, octave: 12 };
  return def.events.map((e) => {
    if (e.voice === 'bass') {
      return { u: e.u, midi: chord.bass + bassOffset[e.tone], dur: U - e.u, vel: 0.5, voice: 'bass' };
    }
    return {
      u: e.u,
      midi: chord.tones[e.tone],
      dur: Math.min(2, U - e.u),
      vel: chordVoice === 'harp' ? 0.26 + rng.next() * 0.04 : 0.22,
      voice: chordVoice,
    };
  });
}

export function accompany(chord, style, pattern, rng) {
  if (!ACCOMP_PATTERNS.includes(pattern)) {
    const custom = customPatterns.find((p) => p.id === pattern);
    // 削除された自作パターンが残っていても、全拍で鳴らして止めない
    return custom ? accompanyCustom(chord, style, custom, rng) : accompany(chord, style, '123', rng);
  }
  const [t0, t1, t2] = chord.tones;
  const out = [];
  if (pattern.includes('1')) out.push({ u: 0, midi: chord.bass, dur: 6, vel: 0.5, voice: 'bass' });
  // 拍ごとの音: [開始単位, 音]
  const beats = style === 'arpeggio'
    ? { 2: [[2, t0], [3, t1]], 3: [[4, t2], [5, t1]] }
    : { 2: [[2, t0], [2, t1], [2, t2]], 3: [[4, t0], [4, t1], [4, t2]] };
  for (const beat of [2, 3]) {
    if (!pattern.includes(String(beat))) continue;
    for (const [u, midi] of beats[beat]) {
      out.push(
        style === 'arpeggio'
          ? { u, midi, dur: 2, vel: 0.26 + rng.next() * 0.04, voice: 'harp' }
          : { u, midi, dur: 2, vel: 0.22, voice: 'chord' },
      );
    }
  }
  return out;
}

// 2小節ごとに同じパターンを使って、ノリをつくる。音数(density)が低いほど、音の少ないパターンが増える。
// 最初の2小節は全拍になりやすく、フレーズ最後の小節は必ず全拍で落ち着かせる。
function pickPatterns(density, rng) {
  const full = Math.min(0.8, Math.max(0.4, 0.3 + 0.1 * density));
  // 全拍以外は、組み込みの3種と自作のパターンから、重み（自作は少なめ1・ふつう2・多め4）つきで選ぶ
  const sparse = [
    ...['12', '13', '23'].map((id) => ({ id, weight: 1 })),
    ...customPatterns.map((p) => ({ id: p.id, weight: p.weight })),
  ];
  const totalWeight = sparse.reduce((sum, p) => sum + p.weight, 0);
  const roll = (fullChance) => {
    if (rng.next() < fullChance) return '123';
    let r = rng.next() * totalWeight;
    return (sparse.find((p) => (r -= p.weight) < 0) ?? sparse[0]).id;
  };
  return [roll(Math.max(full, 0.7)), roll(full), roll(full), roll(full)];
}

function buildPhrase(direction, kind, rng) {
  const { key, mode } = direction;
  const table = direction.progression === 'canon' ? CANON_PROGRESSIONS : PROGRESSIONS;
  const romans = rng.pick(table[mode][kind]);
  const bars = romans.map((roman) => ({ roman, chord: chordInfo(key, mode, roman), notes: [] }));

  const motifA = getMotifOr(direction.motifA);
  const motifB = getMotifOr(direction.motifB);
  const count = opCount(direction.familiarity, rng);
  const opsA = pickOps(count, direction.density, false, rng);
  const opsB = pickOps(count, direction.density, true, rng);

  const tune = { key, mode };
  const wholePhrase = [motifA, motifB].find((m) => m.bars === PHRASE_BARS);
  if (wholePhrase) {
    // 1フレーズ分の断片（階段の上り下りなど）: 8小節目の手前までをそのまま置く。変形は親しみやすさに応じて
    const body = realize(wholePhrase, { ops: opsA }, rng, tune);
    placeNotes(bars, 0, body.filter((n) => n.u < (PHRASE_BARS - 1) * U));
  } else {
    // 2小節ずつ: 提示 → 同じ断片を別の高さ・装飾で → 対比 → 終止へ向かう
    placeNotes(bars, 0, realize(motifA, {}, rng, tune));
    placeNotes(bars, 2, realize(motifA, { shift: rng.pick([-1, 1, 2]), ops: opsA }, rng, tune));
    placeNotes(bars, 4, realize(motifB, { ops: opsB }, rng, tune));
    const lead = realize(motifA, { shift: kind === 'half' ? rng.pick([0, 1]) : rng.pick([0, -1]), ops: opsA }, rng, tune);
    placeNotes(bars, 6, lead.filter((n) => n.u < U));
  }

  const prevDeg = lastDegree(bars[6]) ?? 5;
  if (kind === 'full') {
    bars[7].notes.push({ u: 0, deg: snapToChord(prevDeg, [1]), dur: 6, anchor: true });
  } else {
    bars[7].notes.push({ u: 0, deg: snapToChord(prevDeg, [5, 9]), dur: 4, anchor: true });
  }
  return bars;
}

function finalize(bars, direction, kind, rng) {
  const { key, mode } = direction;
  const style = MOOD_STYLE[direction.mood].accomp;
  const patterns = pickPatterns(direction.density, rng);
  return bars.map((bar, i) => {
    const pattern = i === bars.length - 1 ? '123' : patterns[Math.floor(i / 2)];
    const melody = sanitize(bar.notes).map((n) => {
      const strong = !n.free && (n.anchor || n.u === 0 || n.dur >= 3);
      const deg = strong ? snapToChord(n.deg, bar.chord.degs) : n.deg;
      let midi = pitchOf(key, mode, deg, { raiseLeading: bar.chord.raise });
      while (midi > MELODY_RANGE[1]) midi -= 12;
      while (midi < MELODY_RANGE[0]) midi += 12;
      // 強拍だけ突出して耳につかないよう、強弱の幅は小さめにする
      const accent = n.u === 0 ? 1 : n.u % 2 === 0 ? 0.9 : 0.8;
      const ending = i === bars.length - 1 ? 0.9 : 1;
      return { u: n.u, midi, dur: n.dur, vel: 0.55 * accent * ending * (0.92 + rng.next() * 0.16) };
    });
    return {
      roman: bar.roman,
      chordName: bar.chord.name,
      phrase: kind,
      melody,
      pattern,
      accomp: accompany(bar.chord, style, pattern, rng),
      drums: drumsForBar({ barInPeriod: i + (kind === 'full' ? PHRASE_BARS : 0), density: direction.density }),
    };
  });
}

export function generatePeriod(direction, rng) {
  const bars = [];
  for (const kind of ['half', 'full']) {
    bars.push(...finalize(buildPhrase(direction, kind, rng), direction, kind, rng));
  }
  return { direction, bars: bars.map((bar, index) => ({ ...bar, barInPeriod: index })) };
}
