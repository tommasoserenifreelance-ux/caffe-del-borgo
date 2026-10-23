import React from "react";
import { AbsoluteFill, Audio, Sequence, Series, staticFile } from "remotion";
import { Clip, ClipProps } from "../shared/Clip";
import { FilmLook } from "../shared/FilmLook";
import { Subtitle, Subtitles } from "../shared/Subtitles";
import { Title, TitleWord, WORD_DELAY, WORD_STAGGER } from "../shared/Title";

const RECIPE = "clips/IMG_4386.mp4";
const INTRO = "clips/IMG_4385.mp4";
const PEEL = "clips/IMG_4387.mp4";
const STIR = "clips/IMG_4388.mp4";

// Stacked title shown over the opening shot.
export const TITLE_WORDS: TitleWord[] = [
  { text: "il", size: 200 },
  { text: "negroni", size: 330 },
  { text: "sbagliato", size: 270 },
  { text: "del borgo", size: 200 },
];

type Shot = ClipProps & { frames: number };

// What the bartender says in the intro, timed in seconds of the intro clip.
const INTRO_FROM = 0.3;
const INTRO_SUBTITLES: Subtitle[] = [
  { text: "Bianca, qual è il tuo drink preferito?", start: 0.4, end: 2.3 },
  { text: "Il Negroni Sbagliato!", start: 2.8, end: 4.7 },
];

const TITLE_FRAMES = 72;

// Each action is kept whole; the video ends when the drink is finished.
const SHOTS: Shot[] = [
  // Finished drink under the title
  {
    src: RECIPE,
    from: 30.9,
    playbackRate: 0.6,
    frames: TITLE_FRAMES,
    origin: "48% 62%",
    zoomFrom: 1.35,
    zoomTo: 1.45,
    volume: 0.3,
  },
  // Bartender intro, full sentence
  {
    src: INTRO,
    from: 0.3,
    frames: 132,
    origin: "50% 40%",
    zoomFrom: 1,
    zoomTo: 1.05,
    volume: 1,
  },
  // Ice
  {
    src: RECIPE,
    from: 2.6,
    playbackRate: 1.3,
    frames: 51,
    origin: "48% 62%",
    zoomFrom: 1.3,
    zoomTo: 1.38,
    volume: 0.4,
  },
  // Campari
  {
    src: RECIPE,
    from: 11.7,
    playbackRate: 1.2,
    frames: 58,
    origin: "48% 62%",
    zoomFrom: 1.3,
    zoomTo: 1.38,
    volume: 0.4,
  },
  // Vermouth
  {
    src: RECIPE,
    from: 22.8,
    playbackRate: 1.2,
    frames: 55,
    origin: "48% 62%",
    zoomFrom: 1.3,
    zoomTo: 1.38,
    volume: 0.4,
  },
  // Sparkling wine, the "sbagliato" part
  {
    src: RECIPE,
    from: 26.8,
    playbackRate: 1.2,
    frames: 92,
    origin: "48% 62%",
    zoomFrom: 1.3,
    zoomTo: 1.4,
    volume: 0.4,
  },
  // Orange peel
  {
    src: PEEL,
    from: 0.3,
    playbackRate: 1.3,
    frames: 115,
    origin: "35% 55%",
    zoomFrom: 1.2,
    zoomTo: 1.3,
    volume: 0.4,
  },
  // Stir and the finished glass
  {
    src: STIR,
    from: 0.2,
    playbackRate: 1.3,
    frames: 122,
    origin: "50% 52%",
    zoomFrom: 1.2,
    zoomTo: 1.3,
    volume: 0.4,
  },
];

export const CAFFE_DEL_BORGO_DURATION = SHOTS.reduce(
  (sum, s) => sum + s.frames,
  0,
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
      {/* Subtitles sit above the film look so they stay crisp. */}
      <Sequence from={TITLE_FRAMES} durationInFrames={SHOTS[1].frames}>
        <Subtitles items={INTRO_SUBTITLES} offset={INTRO_FROM} />
      </Sequence>
    </AbsoluteFill>
  );
};
