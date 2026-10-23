# Original lounge / bossa bed for the Caffè del Borgo reel (no samples, fully synthesized).
import sys
import wave

import numpy as np

SR = 48000
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 10
DUR = BARS * BAR
N = int(DUR * SR) + SR

rng = np.random.default_rng(3)
L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def keys(freq, dur):
    t = np.arange(int((dur + 1.2) * SR)) / SR
    # Rhodes-like: sine with soft bell partials, quick attack, exponential decay
    s = (
        np.sin(2 * np.pi * freq * t)
        + 0.25 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-6 * t)
        + 0.08 * np.sin(2 * np.pi * 7 * freq * t) * np.exp(-14 * t)
    )
    env = np.minimum(t / 0.008, 1) * np.exp(-2.2 * t)
    rel = np.clip((dur + 1.2 - t) / 1.2, 0, 1)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return s * env * rel * trem


def bass(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2 * freq * t)
    env = np.minimum(t / 0.01, 1) * np.exp(-1.8 * t) * np.clip((dur - t) / 0.05, 0, 1)
    return s * env


def shaker(dur=0.09):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    # crude high-pass: difference of noise
    hp = np.diff(noise, prepend=0)
    t = np.arange(n) / SR
    return hp * np.exp(-40 * t) * np.minimum(t / 0.004, 1)


def rim():
    t = np.arange(int(0.08 * SR)) / SR
    s = np.sin(2 * np.pi * 1700 * t) + 0.5 * rng.standard_normal(len(t)) * np.exp(-90 * t)
    return s * np.exp(-60 * t)


def kick():
    t = np.arange(int(0.3 * SR)) / SR
    f = 50 + 60 * np.exp(-25 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-9 * t)


# Dm9 | G13 | Cmaj9 | A7(b13), voiced around middle C
CHORDS = [
    (38, [53, 57, 60, 64]),  # Dm9: F A C E over D
    (43, [53, 57, 59, 64]),  # G13: F A B E over G
    (36, [52, 55, 59, 62]),  # Cmaj9: E G B D over C
    (45, [55, 59, 61, 65]),  # A7b13: G B C# F over A
]
# Bossa comping: hits (beat offset, length in beats)
COMP = [(0, 1.2), (1.5, 0.8), (3.0, 0.8)]
COMP_ALT = [(0.5, 1.0), (2.0, 0.8), (3.5, 0.5)]
CLAVE = [0, 1.5, 3.0, 4.5 - 4, 6.0 - 4]  # simplified 3-2 feel within a bar

for b in range(BARS):
    root, voicing = CHORDS[b % 4]
    t0 = b * BAR
    pattern = COMP if b % 2 == 0 else COMP_ALT
    for off, ln in pattern:
        for k, n in enumerate(voicing):
            sig = keys(midi(n), ln * BEAT)
            pan = 0.35 + 0.1 * k
            add(L, t0 + off * BEAT + k * 0.006, sig, 0.22 * (1 - pan + 0.5))
            add(R, t0 + off * BEAT + k * 0.006, sig, 0.22 * (pan + 0.5))
    # bass: root, fifth anticipation
    for off, n, ln in [(0, root, 1.4), (1.5, root + 7, 0.5), (2, root + 7, 1.4), (3.5, root, 0.5)]:
        sig = bass(midi(n), ln * BEAT)
        add(L, t0 + off * BEAT, sig, 0.2)
        add(R, t0 + off * BEAT, sig, 0.2)
    # light drums from bar 2
    if b >= 1:
        for e in range(8):
            g = 0.06 if e % 2 else 0.035
            add(L, t0 + e * BEAT / 2, shaker(), g * 0.8)
            add(R, t0 + e * BEAT / 2 + 0.004, shaker(), g)
        for off in [0, 2]:
            add(L, t0 + off * BEAT, kick(), 0.2)
            add(R, t0 + off * BEAT, kick(), 0.2)
        for off in ([0, 1.5, 3] if b % 2 == 0 else [1, 2.5]):
            add(L, t0 + off * BEAT, rim(), 0.05)
            add(R, t0 + off * BEAT, rim(), 0.07)

# Simple room: a few decaying stereo taps
for buf, taps in ((L, [0.031, 0.067, 0.113]), (R, [0.043, 0.079, 0.127])):
    dry = buf.copy()
    for k, d in enumerate(taps):
        i = int(d * SR)
        buf[i:] += dry[:-i] * (0.22 / (k + 1))

LEN = float(sys.argv[2])  # video length in seconds
out = np.stack([L, R], axis=1)[: int(LEN * SR)]
t = np.arange(len(out)) / SR
fade = np.minimum(t / 0.3, 1) * np.clip((LEN - t) / 2.0, 0, 1)
out *= fade[:, None]
out /= np.max(np.abs(out)) * 1.12
pcm = (out * 32767).astype(np.int16)

with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{LEN:.2f}s")
