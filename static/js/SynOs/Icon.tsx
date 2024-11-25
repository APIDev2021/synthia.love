import React, { ReactNode } from "react";
import styled from "@emotion/styled";

const IconWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  & svg,
  & img {
    width: 34px;
    fill: #5dd4ae;
  }

  color: #fff;
  font-size: 2.4rem;
  @media (max-width: 750px) {
    flex: 1 0 50%;
  }
`;

type IconProps = { title: string; img: ReactNode; onClick: any };

export function Icon({ title, img, onClick }: IconProps) {
  return (
    <IconWrap data-cursor onClick={onClick}>
      {img}
      {title}
    </IconWrap>
  );
}
