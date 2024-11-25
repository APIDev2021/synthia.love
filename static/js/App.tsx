import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { css } from "@emotion/react";
import useAudioHook from "./hooks/useAudioHook";
import { PointAndClick } from "./PointAndClick";
import { Color } from "./Color";
import messages from "./messages.json";
import { Margin } from "./Margin";
import Terminal from "./Terminal";
import { Messages } from "./Messages";
import useMatchMedia from "./hooks/useMatchMedia";
import { useLocalStorage } from "./hooks/useLocalStorageHook";
import { AppContext } from "./context/appContext";
import { Button } from "./Button";
import { Heading } from "./Heading";
import {
  Bar,
  BarInner,
  BodyImg,
  ContentRow,
  ContentRowReverse,
  Headline,
  MenuMobile,
  MenuMobileInner,
} from "./styled/App";
import { useLocation, Link, Outlet } from "react-router-dom";

import { useMainStore } from "./store";

const ascii = `
.____                     .___.__                
|    |    _________     __| _/|__| ____    ____  
|    |   /  _ \\__  \\   / __ | |  |/    \\  / ___\\ 
|    |__(  <_> ) __ \\_/ /_/ | |  |   |  \\/ /_/  >
|_______ \\____(____  /\\____ | |__|___|  /\\___  / 
        \\/         \\/      \\/         \\//_____/  
`;

const menu = css`
  width: 100%;
  height: 100px;
  max-width: 1440px;
  background-image: url(/menu-mid.png);
  background-repeat-x: repeat;
  background-repeat-y: no-repeat;
  margin: auto;
  z-index: 10;
  position: relative;
`;

const pixelated = css`
  image-rendering: pixelated;
`;

const menuImg = css(
  pixelated,
  `
  position: absolute;
  top: 0;
`
);

const menuImgLeft = css`
  ${menuImg}
  left:0;
`;

const menuImgRight = css`
  ${menuImg}
  right:0;
`;

const menuInner = css`
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: white;
  gap: 1rem;
  padding: 0 50px;
  height: calc(100% - 20px);
`;

const navRight = css`
  display: flex;
  align-items: center;
  gap: 2rem;
  & img {
    height: 30px;
  }
`;

const hideAtSmall = css`
  @media (max-width: 500px) {
    display: none;
  }
`;

const logo = css(pixelated, hideAtSmall);

function App() {
  const auth = useMainStore((s) => s.auth);
  const updateAuth = useMainStore((s) => s.updateAuth);
  const updateWallet = useMainStore((s) => s.updateWallet);
  const isSmallScreen = useMatchMedia("(max-width: 767px)");
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", function (accounts: any) {
        updateWallet(accounts[0]);
      });
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      const fn = async () => {
        const { id, sig } = await fetch(
          `${process.env.REACT_APP_REQUEST_URL}/auth`,
          {
            method: "post",
          }
        ).then((res) => res.json());
        updateAuth(`${id}:${sig}`);
      };
      fn();
    }
  }, []);

  const [loading, updateLoading] = useState(true);

  useEffect(() => {
    const loadImage = async (path: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.addEventListener("load", () => {
          resolve(void 0);
        });
        img.addEventListener("error", () => {
          resolve(void 0);
        });
        img.src = path;
      });
    };
    if (loading) {
      Promise.all([
        loadImage("/terminal-art.png"),
        loadImage("/nethria-portrait.jpg"),
        loadImage("/synthia-portrait.png"),
        loadImage("/bootloader.gif"),
        loadImage("/hologram-frame.png"),
        loadImage("/menu-left.png"),
        loadImage("/menu-mid.png"),
        loadImage("/menu-right.png"),
        loadImage("/ts.png"),
        loadImage("/reclaimed.png"),
        loadImage("/nl.png"),
        loadImage("/ds.png"),
        loadImage("/grid.png"),
        loadImage("/disconnected.png"),
        loadImage("/tile.png"),
      ]).finally(() => {
        updateLoading(false);
      });
    }

    setTimeout(() => {
      if (loading) {
        updateLoading(false);
      }
    }, 10000);
  }, [loading]);

  const updateTerminalOpen = useMainStore((s) => s.updateTerminalOpen);
  const terminalOpen = useMainStore((s) => s.terminalOpen);

  const menuItems = (
    <>
      <Link to="/syn-os">
        <Button>SYN OS</Button>
      </Link>

      <a
        data-cursor
        target="_blank"
        href="https://opensea.io/collection/synthia-official"
        rel="noreferrer"
      >
        <img data-cursor alt="OpenSea logo" src="/os-logo.svg" />
      </a>
      <a
        data-cursor
        target="_blank"
        rel="noreferrer"
        href="https://etherscan.io/address/0xabf0b84f870ff3b45988e49fd62b881d7c46c6e6"
      >
        <img data-cursor alt="Etherscan logo" src="/etherscan-logo.svg" />
      </a>
      <a
        href="https://discord.gg/TnPM4HAxpp"
        data-cursor
        target="_blank"
        rel="noreferrer"
      >
        <img src="/discord.svg" />
      </a>
      <a
        data-cursor
        target="_blank"
        rel="noreferrer"
        href="https://twitter.com/Synthia_NFT"
      >
        <img src="/twitter.svg" />
      </a>
    </>
  );

  const [menuOpen, updateMenuOpen] = useState(false);

  const location = useLocation();
  useEffect(() => {
    updateMenuOpen(false);
  }, [location]);

  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            background: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#5dd4ae",
            width: "100%",
            height: "100%",
            zIndex: 999999999999,
          }}
        >
          <p style={{ transform: "scale(0.5)", whiteSpace: "pre" }}>{ascii}</p>
        </div>
      )}
      <div css={menu}>
        <img css={menuImgLeft} src="/menu-left.png" />
        <img css={menuImgRight} src="/menu-right.png" />
        <div css={menuInner}>
          <Link data-cursor to="/">
            <img data-cursor css={logo} src="/synthia-logo.png" />
          </Link>
          <div css={navRight}>
            <Button onClick={() => updateTerminalOpen(true)}>Terminal</Button>
            {!isSmallScreen && menuItems}
            {isSmallScreen && (
              <Button
                style={{ display: "flex", padding: "5px 10px" }}
                onClick={() => updateMenuOpen(true)}
              >
                <img style={{ height: "24px" }} src="/ham.svg" />
              </Button>
            )}
            {isSmallScreen && menuOpen && (
              <MenuMobile>
                <Link data-cursor to="/">
                  <img data-cursor src="/synthia-logo.png" />
                </Link>
                <MenuMobileInner>{menuItems}</MenuMobileInner>
              </MenuMobile>
            )}
            {/* <p css={hideAtSmall}>version 0.4.0</p> */}
          </div>
        </div>
      </div>
      <Outlet />
      {terminalOpen && <Terminal onExit={() => updateTerminalOpen(false)} />}
    </>
  );
}

export default App;
