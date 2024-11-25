import React from "react";
import { useMainStore } from "../store";
import styled from "@emotion/styled";
import { Margin } from "../Margin";

type DetailProps = {
  tokenId: string;
};

const Img = styled.img`
  transform: translate3D(0, 0, 0);
`;

const TopWrap = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 750px) {
    flex-direction: column;
  }
`;

const Stat = styled.div`
  color: white;
  margin: 2rem 0;
`;

const StatBar = styled.div`
  height: 15px;
  border: 2px solid #262626;
  background: black;
  width: 100%;
`;

const StatBarInner = styled.div`
  height: 100%;
  background: #5dd4ae;
  // position: absolute;
`;

const InfoWrap = styled.div`
  min-width: 300px;
  flex: 1;
  @media (max-width: 750px) {
    min-width: none;
  }
`;

export function Detail({ tokenId }: DetailProps) {
  const nfts = useMainStore((s) => s.nfts);
  const nft = nfts?.find((t) => t.tokenId.toString() === tokenId.toString());
  console.log(nft);
  return (
    <div>
      <TopWrap>
        <Img src={nft?.image} />
        <InfoWrap>
          <Margin margin="0 0 30px 0">
            <p style={{ color: "white" }}>Nethria Identity #{nft?.tokenId}</p>
          </Margin>
          {nft?.stats.map((stat) => {
            return (
              <Stat>
                <p>
                  {stat.trait_type} {stat.value} / 100
                </p>
                <StatBar>
                  <StatBarInner
                    style={{ width: `${stat.value}%` }}
                  ></StatBarInner>
                </StatBar>
              </Stat>
            );
          })}
        </InfoWrap>
      </TopWrap>
    </div>
  );
}
