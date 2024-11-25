import { useState, useEffect } from "react";

type Breakpoint = string;

const useMatchMedia = (breakpoint: Breakpoint): boolean => {
  const [isMatch, setIsMatch] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(breakpoint).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(breakpoint);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsMatch(event.matches);
    };

    mediaQueryList.addEventListener("change", handleMediaChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleMediaChange);
    };
  }, [breakpoint]);

  return isMatch;
};

export default useMatchMedia;
