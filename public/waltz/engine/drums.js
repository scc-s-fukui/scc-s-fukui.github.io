// ワルツのドラム。サンプル音源は使わず、音は audio.js で合成する。
// 1拍目にバスドラム、2・3拍目に短く切るブラシ。
// 乱数は使わず、小節の位置と音数だけで決める（旋律や伴奏の乱数の並びを変えないため）。
import { UNITS_PER_BAR as U } from './theory.js';

export const DRUM_VOICES = ['kick', 'brush', 'hat'];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function drumsForBar({ barInPeriod, density }) {
  const phraseBar = barInPeriod % 8;
  // 音数が少ない（夜など）ほど控えめに、多いほど少しだけ強く
  const level = clamp(0.7 + 0.1 * density, 0.8, 1.2);

  const out = [
    { u: 0, voice: 'kick', vel: 0.5 * level },
    { u: 2, voice: 'brush', vel: 0.3 * level },
    { u: 4, voice: 'brush', vel: 0.27 * level },
  ];

  // 音数が多いときは、拍の裏に細かいハイハットを足す
  if (density >= 3) {
    out.push({ u: 3, voice: 'hat', vel: 0.12 * level });
    out.push({ u: 5, voice: 'hat', vel: 0.12 * level });
  }
  // フレーズ終わりの手前の小節: 3拍目を8分の刻みにして、終止へ向かう軽い区切りにする
  if (phraseBar === 6 && density >= 3) out.push({ u: 5, voice: 'hat', vel: 0.16 * level });

  // フレーズ最後の小節は長い終止の音を邪魔しないよう、3拍目を省いて落ち着かせる
  const body = phraseBar === 7 ? out.filter((e) => e.u < 4) : out;
  return body.sort((a, b) => a.u - b.u).filter((e) => e.u >= 0 && e.u < U);
}
