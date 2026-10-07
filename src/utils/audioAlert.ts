import { AlertSoundType } from '../types/parking.ts';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays an audible notification alert using the Web Audio API.
 * No external media files required.
 */
export function playCapacityAlertSound(soundType: AlertSoundType = 'alarm', volume: number = 0.7): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  // Safe volume scaling to prevent clipping
  const gainVal = Math.max(0.05, Math.min(1.0, volume)) * 0.25;
  masterGain.gain.setValueAtTime(gainVal, now);
  masterGain.connect(ctx.destination);

  if (soundType === 'beep') {
    // Modern double beep
    [0, 0.15].forEach((offset) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now + offset); // A5

      noteGain.gain.setValueAtTime(0, now + offset);
      noteGain.gain.linearRampToValueAtTime(1, now + offset + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
  } else if (soundType === 'chime') {
    // Melodic airport / facility chime (E5 -> G#5 -> B5)
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, idx) => {
      const offset = idx * 0.14;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + offset);

      noteGain.gain.setValueAtTime(0, now + offset);
      noteGain.gain.linearRampToValueAtTime(0.8, now + offset + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.45);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.5);
    });
  } else {
    // 'alarm' - Industrial alert pulses (two urgent ascending warning bursts)
    [0, 0.22, 0.44].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = idx === 1 ? 980 : 820;
      osc.frequency.setValueAtTime(baseFreq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 150, now + offset + 0.14);

      noteGain.gain.setValueAtTime(0, now + offset);
      noteGain.gain.linearRampToValueAtTime(0.9, now + offset + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.16);

      // Low pass filter to soften sawtooth harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now + offset);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.18);
    });
  }
}
