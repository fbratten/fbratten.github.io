import wave
import numpy as np

# 1. Basic settings
sr = 44100
bpm = 76.0
beat_sec = 60.0 / bpm
bar_sec = beat_sec * 4
bars = 4
total_sec = bar_sec * bars
audio = np.zeros(int(total_sec * sr), dtype=np.float32)

def add_sound(buf, sound, start_sec):
    idx = int(start_sec * sr)
    if idx < 0 or idx >= len(buf):
        return
    end = min(idx + len(sound), len(buf))
    buf[idx:end] += sound[:end - idx]

# 2. Sound generators (dry sounds, no reverb; arrangement aims to leave midrange space)
def make_kick(dur=0.18):
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    freq = 42.0 + 68.0 * np.exp(-35.0 * t)
    phase = 2 * np.pi * np.cumsum(freq) / sr
    env = np.exp(-16.0 * t)
    return (np.sin(phase) * env * 0.75).astype(np.float32)

def make_woodblock_rim(dur=0.045):
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    click = np.sin(2 * np.pi * 1850 * t) * 0.6 + np.sin(2 * np.pi * 2920 * t) * 0.4
    env = np.exp(-85.0 * t)
    return (click * env * 0.55).astype(np.float32)

def make_palm_mute_hat(dur=0.025, amp=0.18):
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    hp_noise = np.diff(noise, prepend=0)
    env = np.exp(-120.0 * t)
    return (hp_noise * env * amp).astype(np.float32)

def make_fretless_sub(f_start, f_end, dur):
    t = np.linspace(0, dur, int(sr * dur), endpoint=False)
    freq = np.linspace(f_start, f_end, len(t))
    phase = 2 * np.pi * np.cumsum(freq) / sr
    wave_sig = np.sin(phase) * 0.85 + np.sin(2 * phase) * 0.15
    env = np.ones_like(t)
    attack = int(0.025 * sr)
    release = int(0.08 * sr)
    env[:attack] = np.linspace(0, 1, attack)
    env[-release:] = np.linspace(1, 0, release)
    return (wave_sig * env * 0.65).astype(np.float32)

# 3. Build a four-bar pocket groove with microtiming
np.random.seed(42)
swing_offset = (beat_sec / 2.0) * 0.26  # ~63% MPC-swing
rim_layback = 0.038                     # 38 ms behind the beat on beats two and four
bass_layback = 0.055                    # 55 ms behind the beat on the bass

for bar in range(bars):
    b_start = bar * bar_sec

    # Kick: beat one and a delayed syncopation
    add_sound(audio, make_kick(), b_start + 0.0)
    add_sound(audio, make_kick(), b_start + beat_sec * 2.5 + swing_offset)

    # Woodblock / rimshot: beats two and four, laid back
    for beat in [1, 3]:
        jitter = np.random.uniform(-0.004, 0.004)
        add_sound(audio, make_woodblock_rim(), b_start + beat * beat_sec + rim_layback + jitter)

    # Hi-hat / muted click: eighth notes with heavy swing
    for eighth in range(8):
        pos = b_start + eighth * (beat_sec / 2.0)
        if eighth % 2 == 1:
            pos += swing_offset
        jitter = np.random.uniform(-0.003, 0.005)
        amp = 0.22 if eighth % 2 == 1 else 0.12
        add_sound(audio, make_palm_mute_hat(amp=amp), pos + jitter)

    # Fretless-style sub-bass (D minor with glissando)
    add_sound(audio, make_fretless_sub(73.42, 73.42, beat_sec * 1.4), b_start + 0.0 + bass_layback)
    add_sound(audio, make_fretless_sub(87.31, 98.00, beat_sec * 1.1), b_start + beat_sec * 1.5 + swing_offset + bass_layback)
    if bar % 2 == 0:
        add_sound(audio, make_fretless_sub(110.00, 73.42, beat_sec * 1.2), b_start + beat_sec * 2.75 + bass_layback)
    else:
        add_sound(audio, make_fretless_sub(87.31, 55.00, beat_sec * 1.2), b_start + beat_sec * 2.75 + bass_layback)

# Normalise and save with the built-in wave module
audio = audio / np.max(np.abs(audio)) * 0.84
pcm_data = (audio * 32767).astype(np.int16)

with wave.open("hud_mot_hud_seed_76bpm.wav", "w") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes(pcm_data.tobytes())

print("Done! Created 'hud_mot_hud_seed_76bpm.wav'.")
