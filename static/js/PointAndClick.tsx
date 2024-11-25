import React, { useEffect, useState } from "react";
import useAudioHook from "./hooks/useAudioHook";
import { Modal } from "./Modal";

type PointAndClickProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
  visibleContent?: React.ReactNode;
  soundPath?: string;
  style?: React.CSSProperties;
  customContent?: () => React.ReactNode;
  onClose?: () => void;
  onClick?: () => void;
};

export const PointAndClick = ({
  x,
  y,
  w,
  h,
  children,
  visibleContent,
  style,
  soundPath,
  customContent,
  onClose,
  onClick,
}: PointAndClickProps) => {
  const [boxStyle, setBoxStyle] = useState<React.CSSProperties>({});

  const { play: playOpen, stop: stopOpen } = useAudioHook(
    "/ui-open-stereo.wav",
    false
  );
  const { play, stop } = useAudioHook(soundPath, false);

  const updateBoxStyle = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const yScalar = windowHeight / 1024;
    const xDelta = (windowWidth - 1024 * yScalar) / 2;

    const top = y * yScalar;
    const left = x * yScalar + xDelta;
    const width = w * yScalar;
    const height = h * yScalar;

    setBoxStyle({
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      // border: "1px solid red",
    });
  };

  useEffect(() => {
    updateBoxStyle();

    const handleResize = () => {
      updateBoxStyle();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
      playOpen?.().then(() => {
        setTimeout(() => {
          stopOpen?.();
        }, 1000);
      });
    } else {
      setIsOpen(true);
      setTimeout(() => {
        play?.();
      }, 500);
      playOpen?.().then(() => {
        setTimeout(() => {
          stopOpen?.();
        }, 1000);
      });
    }
  };

  const [content, updateCustomContent] = useState<React.ReactNode>(null);
  useEffect(() => {
    if (customContent && isOpen) {
      updateCustomContent(customContent());
    }
  }, [isOpen]);

  return (
    <>
      <div data-cursor style={{ ...style, ...boxStyle }} onClick={handleClick}>
        {visibleContent}
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          stop();
          onClose?.();
        }}
      >
        {children}
        {content}
      </Modal>
    </>
  );
};
