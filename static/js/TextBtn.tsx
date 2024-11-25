import { css } from "@emotion/react";
import React, { CSSProperties, ReactNode } from "react";

const textBtn = css`
  color: white;
  text-decoration: underline;
  display: inline-block;
`;

type TextButtonProps = {
  children: ReactNode;
  onClick: () => any;
  style?: CSSProperties;
};

export const TextButton = ({ style, children, onClick }: TextButtonProps) => (
  <p data-cursor="" style={style} onClick={onClick} css={textBtn}>
    {children}
  </p>
);
