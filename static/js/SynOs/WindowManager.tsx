import React, { useState } from "react";
import { Window } from "./Window";
import { css } from "@emotion/react";
import { Body } from "../svg/Body";
import { Frames } from "../svg/Frames";
import { Grid } from "../svg/Grid";
import { Icon } from "./Icon";
import { MyAvatars } from "./MyAvatars";
import { Sparkle } from "../svg/Sparkle";
import { useMainStore } from "../store";
import { type Props } from "react-rnd";
import { WindowContext } from "../context/windowContext";

export interface WindowData {
  id: string;
  defaultPosition?: Props["default"];
  isActive: boolean;
  content: React.ReactNode;
  title: string;
}

const styles = {
  icons: css`
    display: flex;
    justify-content: center;
    margin: 1rem;
    gap: 3rem;

    @media (max-width: 750px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-gap: 3rem;
    }
  `,
};

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const icons = [
  { title: "My Avatars", id: "my-avatars", icon: <Body /> },
  { title: "Inventory", id: "inventory", icon: <Frames /> },
  { title: "Traits market", id: "traitsmarket", icon: <Grid /> },
  { title: "Terminal (mint)", id: "terminal", icon: <Sparkle /> },
];

const innerWidth = window.innerWidth;
const delta = innerWidth - 1440;
let x = () => 0;
let y = () => 0;
if (delta > 0) {
  x = () =>
    delta / 2 + randomIntFromInterval(1, window.innerWidth / 2 - 870 / 2);
}
y = () => randomIntFromInterval(1, window.innerHeight * 0.25);

const windowList: WindowData[] = [
  {
    id: "my-avatars",
    defaultPosition: { x: x(), y: y(), width: 870, height: 520 },
    title: "Your Nethria Identities",
    isActive: false,
    content: <MyAvatars />,
  },
  {
    id: "inventory",
    defaultPosition: { x: x(), y: y(), width: 870, height: 520 },
    title: "Inventory",
    isActive: false,
    content: <p style={{ color: "white" }}>Coming soon</p>,
  },
  {
    id: "traitsmarket",
    defaultPosition: { x: x(), y: y(), width: 870, height: 520 },
    title: "Traits market - Collect new traits",
    isActive: false,
    content: <p style={{ color: "white" }}>Coming soon</p>,
  },
];

const WindowManager: React.FC = () => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const updateTerminalOpen = useMainStore((s) => s.updateTerminalOpen);

  const handleClick = (id: string) => {
    setWindows(
      windows.map((window) => ({
        ...window,
        isActive: window.id === id,
      }))
    );
  };

  const checkAndSetWindow = (id: string, newWindow: WindowData) => {
    // if window is open set to active
    if (windows.find((w) => w.id === id)) {
      handleClick(id as string);
    } else {
      // add window to the list of open windows and set active
      setWindows((w) => [
        ...w,
        {
          ...newWindow,
          isActive: true,
        },
      ]);
    }
  };

  const checkIsActive = (id: string) => {
    return !!windows.find((w) => w.id === id)?.isActive;
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <div css={styles.icons}>
          {icons.map((icon, i) => {
            let onClick;

            if (icon.id === "terminal") {
              onClick = () => {
                updateTerminalOpen(true);
              };
            } else {
              onClick = () => {
                const newWindow = windowList.find((w) => w.id === icon.id);
                if (newWindow) {
                  checkAndSetWindow(icon.id as string, newWindow);
                }
              };
            }
            return (
              <Icon
                key={i}
                onClick={onClick}
                title={icon.title}
                img={icon.icon}
              />
            );
          })}
        </div>
        <WindowContext.Provider value={{ checkAndSetWindow, checkIsActive }}>
          {windows.map((window) => (
            <Window
              onClose={() => {
                setWindows((w) => w.filter((i) => i.id !== window.id));
              }}
              key={window.id}
              defaultPosition={window.defaultPosition}
              isActive={window.isActive}
              title={window.title}
              onMouseDown={() => handleClick(window.id)}
            >
              {window.content}
            </Window>
          ))}
        </WindowContext.Provider>
      </div>
    </>
  );
};

export default WindowManager;
