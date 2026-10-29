# Light, playful plucked tune (guitar arpeggios + mandolin melody), fully synthesized.
# Usage: python3 scripts/make_tune.py out.wav <length-seconds>
import sys
import wave

import numpy as np

SR = 48000
BPM = 108
BEAT = 60 / BPM
BAR = 4 * BEAT
LEN = float(sys.argv[2])
N = int((LEN + 3) * SR)

rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(start, sig, gain, pan=0.5):
    i = int(start * SR)
    j = min(N, i + len(sig))
    if j <= i:
        return
    L[i:j] += sig[: j - i] * gain * (1 - pan) * 2 ** 0.5
    R[i:j] += sig[: j - i] * gain * pan * 2 ** 0.5


def pluck(freq, dur, bright=0.5, decay=0.996):
    # Karplus-Strong, computed one period at a time
    p = max(2, int(round(SR / freq)))
    n = int(dur * SR)
    out = np.empty(n + p)
    buf = rng.uniform(-1, 1, p)
    # soften the excitation for a warmer tone
    buf = bright * buf + (1 - bright) * np.convolve(buf, np.ones(4) / 4, "same")
    out[:p] = buf
    i = p
    while i < n + p:
        prev = out[i - p : i]
        nxt = decay * 0.5 * (prev + np.roll(prev, 1))
        k = min(p, n + p - i)
        out[i : i + k] = nxt[:k]
        i += k
    sig = out[:n]
    t = np.arange(n) / SR
    return sig * np.clip((dur - t) / 0.08, 0, 1)


def bass(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    return s * np.minimum(t / 0.01, 1) * np.exp(-2.5 * t) * np.clip((dur - t) / 0.05, 0, 1)


def shaker():
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    return np.diff(rng.standard_normal(n), prepend=0) * np.exp(-50 * t)


# C | Am | F | G  (I vi IV V), guitar voicings
CHORDS = [
    (36, [48, 55, 60, 64, 67]),
    (45, [45, 52, 57, 60, 64]),
    (41, [41, 48, 53, 57, 60]),
    (43, [43, 50, 55, 59, 62]),
]
ARP = [0, 2, 1, 3, 2, 4, 3, 2]  # eighth-note pattern over the voicing

# Mandolin melody, (beat offset, midi, beats) per bar, cycling every 4 bars
MELODY = [
    [(0, 76, 1), (1, 79, 0.5), (1.5, 77, 0.5), (2, 76, 1), (3, 72, 1)],
    [(0, 72, 1), (1, 76, 0.5), (1.5, 74, 0.5), (2, 72, 1.5), (3.5, 69, 0.5)],
    [(0, 69, 1), (1, 72, 0.5), (1.5, 74, 0.5), (2, 77, 1), (3, 76, 0.5), (3.5, 74, 0.5)],
    [(0, 74, 1.5), (1.5, 71, 0.5), (2, 67, 1), (3, 71, 0.5), (3.5, 74, 0.5)],
]

bars = int(np.ceil(LEN / BAR)) + 1
for b in range(bars):
    t0 = b * BAR
    root, voicing = CHORDS[b % 4]
    for e, idx in enumerate(ARP):
        add(t0 + e * BEAT / 2, pluck(midi(voicing[idx]), 1.2, 0.45), 0.16, 0.38)
    for off, n, ln in [(0, root, 1.5), (2, root + 7, 1.5)]:
        add(t0 + off * BEAT, bass(midi(n), ln * BEAT), 0.22, 0.5)
    if b >= 1:
        for e in range(8):
            add(t0 + e * BEAT / 2, shaker(), 0.035 if e % 2 else 0.02, 0.6)
    # melody enters on bar 2, mandolin tremolo on long notes
    if b >= 1:
        for off, n, ln in MELODY[(b - 1) % 4]:
            dur = ln * BEAT
            if ln >= 1:
                reps = int(dur / 0.075)
                for r in range(reps):
                    add(t0 + off * BEAT + r * 0.075, pluck(midi(n), 0.25, 0.8, 0.99), 0.06, 0.62)
            else:
                add(t0 + off * BEAT, pluck(midi(n), dur + 0.3, 0.8, 0.993), 0.11, 0.62)

# Small room
for buf, taps in ((L, [0.029, 0.061, 0.103]), (R, [0.037, 0.073, 0.119])):
    dry = buf.copy()
    for k, d in enumerate(taps):
        i = int(d * SR)
        buf[i:] += dry[:-i] * (0.2 / (k + 1))

out = np.stack([L, R], axis=1)[: int(LEN * SR)]
t = np.arange(len(out)) / SR
out *= (np.minimum(t / 0.3, 1) * np.clip((LEN - t) / 1.8, 0, 1))[:, None]
out /= np.max(np.abs(out)) * 1.12
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"{LEN:.2f}s")
