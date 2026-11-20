// 音楽理論の基礎: 度数 → MIDI、コード、コードトーンへの吸着
// 時間は3/4拍子を8分音符単位（1小節 = 6単位）で数える。

export const UNITS_PER_BAR = 6;

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

const PITCH_CLASS = { C: 0, D: 2, Eb: 3, F: 5, G: 7, A: 9, Bb: 10 };
const PC_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const KEY_CHOICES = Object.keys(PITCH_CLASS);

const CHORD_ROOTS = {
  major: { I: 1, ii: 2, iii: 3, IV: 4, V: 5, vi: 6 },
  minor: { i: 1, ii: 2, III: 3, iv: 4, V: 5, VI: 6, VII: 7 },
};

export function isRoman(mode, roman) {
  return roman in CHORD_ROOTS[mode];
}

export function keyPitchClass(key) {
  return PITCH_CLASS[key];
}

// 旋律の主音（C4〜Bb4 に収まる）
export function tonicMidi(key) {
  return 60 + PITCH_CLASS[key];
}

// 度数（1 = 主音、8 = 1オクターブ上、0 = 主音の1つ下）から MIDI ノートへ。
// 短調のドミナント上では導音を半音上げる（和声的短音階）。
export function pitchOf(key, mode, deg, { raiseLeading = false, octaveShift = 0 } = {}) {
  const idx = deg - 1;
  const octave = Math.floor(idx / 7);
  const step = idx - octave * 7;
  let semis = SCALES[mode][step] + 12 * octave;
  if (mode === 'minor' && raiseLeading && step === 6) semis += 1;
  return tonicMidi(key) + semis + 12 * octaveShift;
}

function fold(midi, lo, hi) {
  let m = midi;
  while (m > hi) m -= 12;
  while (m < lo) m += 12;
  return m;
}

// ローマ数字のコードから、伴奏用の音（MIDI）・低音・表示名を作る
export function chordInfo(key, mode, roman) {
  const root = CHORD_ROOTS[mode][roman];
  const raise = mode === 'minor' && roman === 'V';
  const degs = [root, root + 2, root + 4];
  const pitch = (d, octaveShift = 0) => pitchOf(key, mode, d, { raiseLeading: raise, octaveShift });
  const tones = degs.map((d) => fold(pitch(d, -1), 46, 60)).sort((a, b) => a - b);
  const rootMidi = pitch(root);
  let bass = 36 + (rootMidi % 12);
  if (bass > 45) bass -= 12;
  const third = pitch(root + 2) - rootMidi;
  const fifth = pitch(root + 4) - rootMidi;
  const quality = third === 4 ? '' : fifth === 6 ? 'dim' : 'm';
  return { roman, degs, tones, bass, raise, thirdSemis: third, fifthSemis: fifth, name: PC_NAMES[rootMidi % 12] + quality };
}

// 度数 deg に最も近い、和音構成音（度数のクラス）の度数を返す。同距離なら低い方。
export function snapToChord(deg, chordDegs) {
  const classOf = (d) => (((d - 1) % 7) + 7) % 7;
  const groupStart = deg - classOf(deg);
  let best = deg;
  let bestDist = Infinity;
  for (const c of new Set(chordDegs.map(classOf))) {
    for (const cand of [groupStart + c - 7, groupStart + c, groupStart + c + 7]) {
      const dist = Math.abs(cand - deg);
      if (dist < bestDist || (dist === bestDist && cand < best)) {
        best = cand;
        bestDist = dist;
      }
    }
  }
  return best;
}
