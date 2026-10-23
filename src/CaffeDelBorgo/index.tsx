import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from "remotion";
import { Clip, ClipProps } from "../shared/Clip";
import { FilmLook } from "../shared/FilmLook";
import { Title, TitleWord, WORD_DELAY, WORD_STAGGER } from "../shared/Title";

// Stacked title shown over the opening shot.
export const TITLE_WORDS: TitleWord[] = [
  { text: "caffè", size: 360 },
  { text: "del", size: 220 },
  { text: "borgo", size: 360 },
];

type Shot = ClipProps & { frames: number };

const TITLE_FRAMES = 72;

// Shots in order. Put the clips in public/clips/ and list them here.
// The first shot carries the title.
const SHOTS: Shot[] = [];

export const CAFFE_DEL_BORGO_DURATION = Math.max(
  TITLE_FRAMES,
  SHOTS.reduce((sum, s) => sum + s.frames, 0),
);

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

export const CaffeDelBorgo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c130d" }}>
      <Series>
        {SHOTS.map(({ frames, ...shot }, i) => (
          <Series.Sequence key={i} durationInFrames={frames}>
            <Clip {...shot} />
          </Series.Sequence>
        ))}
      </Series>
      <Sequence durationInFrames={TITLE_FRAMES} name="Titolo">
        {/* Darken behind the title so it stays readable. */}
        <AbsoluteFill style={{ backgroundColor: "rgba(30, 15, 6, 0.38)" }} />
        <Title words={TITLE_WORDS} />
        <TitleSfx />
      </Sequence>
      <FilmLook />
    </AbsoluteFill>
  );
};
