import React, { useState, useRef, useMemo } from "react";

export default function useAudioHook(path: string | void, loop: boolean) {
  const [playing, updatePlaying] = useState(false);
  const audio = useMemo(() => (path ? new Audio(path) : void 0), [path]);
  if (audio) {
    audio.loop = loop;
    audio.addEventListener("play", () => {
      updatePlaying(true);
    });

    audio.addEventListener("pause", () => {
      updatePlaying(false);
    });
  }

  return {
    playing,
    play: audio?.play.bind(audio),
    pause: audio?.pause.bind(audio),
    stop: async () => {
      await audio?.pause.bind(audio)();
      if (audio?.currentTime) {
        audio.currentTime = 0;
      }
    },
  };
}
