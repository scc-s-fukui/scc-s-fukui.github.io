// Web Audio による合成音源。サンプル音源は使わない（権利を持ち込まないため）。
// 音色は倍音の足し合わせと音量の変化（減衰型 / 持続型）で作る。

// harmonics: 倍音の強さ（先頭は使わない）/ attack: 立ち上がり(秒) / gain: 音量
// 減衰型: tau = 減衰の時定数(秒)
// 持続型（sustain）: release = 音が終わってから消えるまで(秒)。vibrato と breath（息の音）を持てる
const VOICES = {
  // 伴奏
  bass: { harmonics: [0, 1, 0.38, 0.12], attack: 0.015, tau: 0.55, gain: 0.55 },
  harp: { harmonics: [0, 1, 0.3, 0.1, 0.04], attack: 0.006, tau: 0.38, gain: 0.45 },
  chord: { harmonics: [0, 1, 0.35, 0.12, 0.05], attack: 0.02, tau: 0.3, gain: 0.4 },
  // 主旋律
  piano: { harmonics: [0, 1, 0.42, 0.18, 0.08, 0.04], attack: 0.01, tau: 0.5, gain: 0.5, detunes: [0, 4] },
  harpLead: { harmonics: [0, 1, 0.3, 0.1, 0.04], attack: 0.006, tau: 0.45, gain: 0.63, detunes: [0] },
  musicbox: { harmonics: [0, 1, 0, 0.5, 0, 0.28, 0, 0.12], attack: 0.003, tau: 0.32, gain: 0.62, detunes: [0] },
  flute: {
    harmonics: [0, 1, 0.2, 0.06, 0.02],
    attack: 0.07,
    sustain: true,
    release: 0.18,
    gain: 0.28,
    detunes: [0],
    vibrato: { rate: 5, cents: 8, delay: 0.3 },
    breath: 0.05,
  },
};

// 画面の選択肢 → 主旋律に使う音色
export const MELODY_INSTRUMENTS = { piano: 'piano', flute: 'flute', musicbox: 'musicbox', harp: 'harpLead' };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function makeImpulse(ctx, seconds = 3, decay = 2.4) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch);
    let lowpassed = 0;
    for (let i = 0; i < length; i += 1) {
      lowpassed += 0.3 * (Math.random() * 2 - 1 - lowpassed); // 高域を丸めて、やわらかい残響にする
      data[i] = lowpassed * (1 - i / length) ** decay;
    }
  }
  return buffer;
}

function makeNoise(ctx, seconds = 1) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function createAudio() {
  const ctx = new AudioContext({ latencyHint: 'playback' });

  const waves = {};
  for (const [name, voice] of Object.entries(VOICES)) {
    waves[name] = ctx.createPeriodicWave(new Float32Array(voice.harmonics.length), Float32Array.from(voice.harmonics));
  }
  const noise = makeNoise(ctx);
  let melodyInstrument = 'piano';

  // 声部 → bus → (直接音 + 残響) → 高域を丸めるフィルタ → コンプレッサ → 音量 → 出力
  const bus = ctx.createGain();
  const dry = ctx.createGain();
  dry.gain.value = 0.8;
  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 4500;
  tone.Q.value = 0.5;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 24;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.3;
  const master = ctx.createGain();
  master.gain.value = 0;

  // 無音になっていないかを調べるための計測用（出力には繋がない）
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  const samples = new Float32Array(analyser.fftSize);

  bus.connect(dry);
  bus.connect(reverb);
  reverb.connect(wet);
  dry.connect(tone);
  wet.connect(tone);
  tone.connect(compressor);
  compressor.connect(master);
  master.connect(ctx.destination);
  master.connect(analyser);

  function playBreath(time, freq, vel, level) {
    const source = ctx.createBufferSource();
    source.buffer = noise;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = clamp(freq * 3, 1500, 5000);
    band.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vel * level, time + 0.03);
    gain.gain.setTargetAtTime(0, time + 0.03, 0.06);
    source.connect(band);
    band.connect(gain);
    gain.connect(bus);
    source.start(time, Math.random() * 0.5);
    source.stop(time + 0.4);
    source.onended = () => {
      source.disconnect();
      band.disconnect();
      gain.disconnect();
    };
  }

  function play({ time, midi, dur, vel, voice }) {
    const name = voice === 'melody' ? MELODY_INSTRUMENTS[melodyInstrument] : voice;
    const v = VOICES[name];
    const freq = 440 * 2 ** ((midi - 69) / 12);
    const peak = vel * v.gain;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(peak, time + v.attack);
    let end;
    if (v.sustain) {
      // 持続型: 音の長さの間は鳴らし続け、終わったらふわっと消す
      const hold = Math.max(dur, v.attack + 0.05);
      gain.gain.linearRampToValueAtTime(peak * 0.85, time + hold);
      gain.gain.setTargetAtTime(0, time + hold, v.release / 3);
      end = time + hold + v.release * 2;
    } else {
      // 減衰型: 高い音ほど早く消える
      const pitchFactor = clamp(1.25 - (midi - 48) / 48, 0.45, 1.2);
      const tau = v.tau * pitchFactor * (0.75 + 0.25 * Math.min(dur, 3));
      gain.gain.setTargetAtTime(0, time + v.attack, tau);
      end = time + v.attack + tau * 7;
    }
    gain.connect(bus);

    const nodes = [gain];
    let remaining = 0;
    const finish = () => {
      remaining -= 1;
      if (remaining === 0) nodes.forEach((n) => n.disconnect());
    };
    const start = (source) => {
      remaining += 1;
      source.start(time);
      source.stop(end);
      source.onended = finish;
      nodes.push(source);
    };

    for (const cents of v.detunes ?? [0]) {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(waves[name]);
      osc.frequency.setValueAtTime(freq, time);
      osc.detune.setValueAtTime(cents, time);
      osc.connect(gain);
      start(osc);

      if (v.vibrato) {
        // 音の出始めは揺らさず、少し遅れてゆっくり揺らし始める
        const lfo = ctx.createOscillator();
        lfo.frequency.value = v.vibrato.rate;
        const depth = ctx.createGain();
        depth.gain.setValueAtTime(0, time);
        depth.gain.setTargetAtTime(v.vibrato.cents, time + v.vibrato.delay, 0.2);
        lfo.connect(depth);
        depth.connect(osc.detune);
        nodes.push(depth);
        start(lfo);
      }
    }
    if (v.breath) playBreath(time, freq, vel, v.breath);
  }

  return {
    ctx,
    play,
    resume: () => ctx.resume(),
    // 切り替えは、これから予約する音から効く
    setMelodyInstrument(instrument) {
      if (instrument in MELODY_INSTRUMENTS) melodyInstrument = instrument;
    },
    // 出力の実効値（RMS）。0 に張り付いていれば無音
    level() {
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += s * s;
      return Math.sqrt(sum / samples.length);
    },
    setVolume(v) {
      master.gain.setTargetAtTime(0.9 * v * v, ctx.currentTime, 0.08);
    },
    // 0〜1。小さいほど高域を丸めて、おだやかな音にする
    setBrightness(b) {
      tone.frequency.setTargetAtTime(1800 + clamp(b, 0, 1) * 4700, ctx.currentTime, 1.5);
    },
    async close() {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      await new Promise((resolve) => setTimeout(resolve, 600));
      await ctx.close();
    },
  };
}
