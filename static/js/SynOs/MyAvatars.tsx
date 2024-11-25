import React, { useContext, useEffect } from "react";
import { useMainStore } from "../store";
import styled from "@emotion/styled";
import { Button } from "../Button";
import { Color } from "../Color";
import { Margin } from "../Margin";
import { WindowData } from "./WindowManager";
import { Detail } from "./Detail";
import { WindowContext } from "../context/windowContext";

const ConnectWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NftListWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.24rem;
`;

const NftWrap = styled.div`
  width: 200px;
`;
const NftImg = styled.img`
  width: 100%;
  height: auto;
`;
const ButtonWrap = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

function getDefaultWindowProps() {
  const maxWidth = 1200; // Set the maximum width of your window here
  const aspectRatio = 16 / 9; // Aspect ratio for the window

  // Ensure the window width does not exceed the available screen width
  const defaultWidth = Math.min(maxWidth, window.innerWidth * 0.9);

  // Calculate height based on the aspect ratio
  const defaultHeight = defaultWidth / aspectRatio;

  // Define factors to adjust the x and y values
  const xOffsetFactor = 0.4; // Increase or decrease this to move the window left or right
  const yOffsetFactor = 0.4; // Increase or decrease this to move the window up or down

  const x = (window.innerWidth - defaultWidth) * xOffsetFactor;
  const y = (window.innerHeight - defaultHeight) * yOffsetFactor;

  return {
    x,
    y,
    width: defaultWidth,
    height: defaultHeight,
  };
}

const detailWindow = (tokenId: string): WindowData => {
  return {
    id: tokenId.toString(),
    isActive: true,
    title: `Synthia Identity #${tokenId}`,
    content: <Detail tokenId={tokenId} />,
    defaultPosition: getDefaultWindowProps(),
  };
};

export function MyAvatars() {
  const connectWallet = useMainStore((s) => s.connectWallet);
  const fetchSynthiaNfts = useMainStore((s) => s.fetchSynthiaNfts);
  const wallet = useMainStore((s) => s.wallet);
  const next = useMainStore((s) => s.next);
  const fetchNfts = useMainStore((s) => s.fetchSynthiaNfts);
  const loadingNfts = useMainStore((s) => s.loadingNfts);
  const updateTerminalOpen = useMainStore((s) => s.updateTerminalOpen);
  const loadingWallet = useMainStore((s) => s.loadingWallet);
  const nfts = useMainStore((s) => s.nfts);
  const { checkAndSetWindow } = useContext(WindowContext);

  useEffect(() => {
    if (wallet) {
      fetchNfts(wallet);
    }
  }, [wallet]);

  if (!wallet) {
    return (
      <ConnectWrap>
        <Button onClick={() => connectWallet?.()}>Connect wallet</Button>
      </ConnectWrap>
    );
  }

  return (
    <div>
      <NftListWrap>
        {nfts?.map((nft) => {
          const onClick = () => {
            checkAndSetWindow?.(nft.tokenId, detailWindow(nft.tokenId));
          };
          return (
            <NftWrap
              key={nft.tokenId}
              onTouchEnd={onClick}
              onClick={onClick}
              data-cursor
            >
              <NftImg src={nft.image}></NftImg>
              <Color color="white">
                <p>#{nft.tokenId}</p>
              </Color>
            </NftWrap>
          );
        })}
        {!loadingNfts && !nfts?.length && (
          <div>
            <Color color="white">
              <p>You don't own any Synthia NFTs</p>
            </Color>
            <Margin margin="2rem 0">
              <Button onClick={() => updateTerminalOpen(true)}>MINT NOW</Button>
            </Margin>
          </div>
        )}
      </NftListWrap>
      {next && !loadingNfts && (
        <ButtonWrap
          onTouchEnd={() => {
            fetchSynthiaNfts(wallet, next);
          }}
        >
          <Button
            onClick={() => {
              fetchSynthiaNfts(wallet, next);
            }}
          >
            Load more
          </Button>
        </ButtonWrap>
      )}

      {loadingNfts && (
        <Color color="white">
          <p>Loading...</p>
        </Color>
      )}
    </div>
  );
}
