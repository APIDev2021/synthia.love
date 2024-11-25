import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const Bar = styled.div`
  width: 100%;
  background: #0d0b10;
  padding: 1rem;
  margin: 4rem 0;
`;

export const BarInner = styled.div`
  max-width: 1440px;
  display: flex;
  margin: auto;
  justify-content: space-between;
  & h1 {
    font-size: 3.2rem;

    @media (max-width: 1012px) {
      font-size: 2.4rem;
    }

    @media (max-width: 702px) {
      font-size: 1.8rem;
    }

    @media (max-width: 500px) {
      font-size: 1rem;
    }
  }
`;

const contentRow = css`
  display: flex;
  gap: 1rem;

  & > * {
    flex: 1;
  }

  @media (max-width: 750px) {
    flex-direction: column;
    & h2 {
      font-size: 3.4rem;
    }
    & h3 {
      font-size: 2.4rem;
    }
  }
`;

export const ContentRow = styled.div`
  ${contentRow}
`;
export const ContentRowReverse = styled.div`
  ${contentRow}
  @media (max-width: 750px) {
    flex-direction: column-reverse;
  }
`;

export const BodyImg = styled.img`
  width: 100%;
  image-rendering: pixelated;
`;

export const Headline = styled.div`
  @media (max-width: 750px) {
    & h1 {
      font-size: 6.4rem;
    }
  }
`;

export const MenuMobile = styled.div`
  background: black;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  height: 100%;
`;

export const MenuMobileInner = styled.div`
  display: grid;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 2rem;
  align-items: start; /* New Property */
  padding: 1rem;

  & *:first-child {
    grid-column: span 4;
  }
  & * {
    display: flex;
    justify-content: center;
  }
`;
