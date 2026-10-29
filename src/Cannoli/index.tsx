import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { Clip } from "../shared/Clip";
import { FilmLook } from "../shared/FilmLook";
import { Title, TitleWord, WORD_DELAY, WORD_STAGGER } from "../shared/Title";

const FPS = 30;
const CLIP_SECONDS = 18.3;
export const CANNOLI_DURATION = Math.floor(CLIP_SECONDS * FPS);

// Title over Bianca walking in, which is silent; it is gone before she speaks.
const TITLE_FRAMES = 72;
export const TITLE_WORDS: TitleWord[] = [
  { text: "i", size: 200 },
  { text: "cannoli", size: 340 },
  { text: "del borgo", size: 210 },
];

// When Bianca speaks, in seconds. The music drops right down under these.
const SPEECH: [number, number][] = [
  [2.6, 7.2],
  [11.9, 14.3],
];
const MUSIC_VOLUME = 0.5;
const MUSIC_UNDER_SPEECH = 0.1;
const DUCK_RAMP = 0.25;

const musicVolume = (frame: number) => {
  const t = frame / FPS;
  let v = MUSIC_VOLUME;
  for (const [start, end] of SPEECH) {
    const dip = interpolate(
      t,
      [start - DUCK_RAMP, start, end, end + DUCK_RAMP * 2],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    v = Math.min(v, MUSIC_VOLUME - dip * (MUSIC_VOLUME - MUSIC_UNDER_SPEECH));
  }
  return v;
};

const TitleSfx: React.FC = () => {
  const lastWordAt = WORD_DELAY + (TITLE_WORDS.length - 1) * WORD_STAGGER;
  return (
    <>
      <Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      {TITLE_WORDS.map((_, i) => (
        <Sequence key={i} from={WORD_DELAY + i * WORD_STAGGER}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={lastWordAt + 6}>
        <Audio src={staticFile("sfx/chime.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={TITLE_FRAMES - 12}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
      </Sequence>
    </>
  );
};

export const Cannoli: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c130d" }}>
      <Clip
        src="clips/cannoli.mp4"
        from={0}
        origin="50% 45%"
        zoomFrom={1}
        zoomTo={1.04}
        volume={1}
      />
      <Audio src={staticFile("music/cannoli-tune.wav")} volume={musicVolume} />
      <Sequence durationInFrames={TITLE_FRAMES} name="Titolo">
        <AbsoluteFill style={{ backgroundColor: "rgba(30, 15, 6, 0.52)" }} />
        <Title words={TITLE_WORDS} />
        <TitleSfx />
      </Sequence>
      <FilmLook />
    </AbsoluteFill>
  );
};
