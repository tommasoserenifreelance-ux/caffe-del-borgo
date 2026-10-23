import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TITLE_COLOR, TITLE_FONT } from "./Title";

// start/end are seconds in the source clip; offset is where the shot starts in it.
export type Subtitle = { text: string; start: number; end: number };

export const Subtitles: React.FC<{ items: Subtitle[]; offset: number }> = ({
  items,
  offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + offset;
  const current = items.find((s) => t >= s.start && t < s.end);
  if (!current) {
    return null;
  }

  const startFrame = (current.start - offset) * fps;
  const appear = interpolate(frame, [startFrame, startFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 330,
        paddingLeft: 90,
        paddingRight: 90,
      }}
    >
      <div
        style={{
          fontFamily: TITLE_FONT,
          fontSize: 84,
          lineHeight: 1.05,
          textAlign: "center",
          color: TITLE_COLOR,
          textShadow: "0 2px 6px rgba(20, 10, 4, 0.6)",
          backgroundColor: "rgba(28, 16, 8, 0.55)",
          padding: "10px 28px 16px",
          borderRadius: 18,
          opacity: appear,
          transform: `translateY(${interpolate(appear, [0, 1], [12, 0])}px)`,
        }}
      >
        {current.text}
      </div>
    </AbsoluteFill>
  );
};
