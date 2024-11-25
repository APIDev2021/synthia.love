import React, { useEffect, useRef, useState } from "react";
import useMatchMedia from "./hooks/useMatchMedia";

const CustomCursor = () => {
  const isSmallScreen = useMatchMedia("(max-width: 767px)");

  const cursorRef = useRef<HTMLCanvasElement>(null);
  const frameWidth = 32;
  const frameHeight = 32;
  const totalFrames = 4;
  const hoverColor = "#d253d2";
  const [isHovering, setIsHovering] = useState(false);

  let currentFrame = 0;
  const hoverTarget = "[data-cursor]";

  useEffect(() => {
    const cursorCanvas = cursorRef.current;
    if (!cursorCanvas || isSmallScreen) return;
    const ctx = cursorCanvas.getContext("2d");
    const image = new Image();
    image.src = "/cursor.png";

    const updateCursor = (e: any) => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      cursorCanvas.style.left = `${e.clientX + scrollX}px`;
      cursorCanvas.style.top = `${e.clientY + scrollY}px`;
    };

    const updateAnimation = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.drawImage(
        image,
        currentFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight
      );

      if (isHovering) {
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = hoverColor;
        ctx.fillRect(0, 0, frameWidth, frameHeight);
        ctx.globalCompositeOperation = "source-over";
      }
      if (!isHovering) return;
      currentFrame = (currentFrame + 1) % totalFrames;
    };

    const onHover = (e: any) => {
      const { target } = e;
      let current = target;

      while (current) {
        if (current.matches(hoverTarget)) {
          setIsHovering(true);
          return;
        }
        current = current.parentElement;
      }
      setIsHovering(false);
    };

    window.addEventListener("mousemove", updateCursor);
    window.addEventListener("mouseover", onHover);
    const animationInterval = setInterval(updateAnimation, 100);

    return () => {
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("mouseover", onHover);
      clearInterval(animationInterval);
    };
  }, [isHovering]);

  return (
    <canvas
      ref={cursorRef}
      width={frameWidth}
      height={frameHeight}
      style={{
        position: "absolute",
        display: isSmallScreen ? "none" : "block",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        zIndex: 99999999,
      }}
    ></canvas>
  );
};

export default CustomCursor;
