import { css } from "@emotion/react";
import React, { CSSProperties } from "react";

const styles = {
  wrap: css`
    background-color: #5dd4ae;
    color: #000;

    font-family: "Courier New", monospace;
    font-weight: bold;
    font-size: 1.25rem;
    padding: 12px 24px;
    border: none;
    outline: none;
    border-radius: 5px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3),
      inset 0 0 0 2px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.4),
      0 4px 6px rgba(0, 0, 0, 0.2);
    cursor: none;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
    transition: 0.3s;
    &:active {
      background-color: #009900;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3),
        inset 0 0 0 2px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.2);
      transform: translateY(1px);
    }
  `,
};

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
};

export function Button({ children, style, onClick }: ButtonProps) {
  return (
    <button style={style} onClick={onClick} data-cursor css={styles.wrap}>
      {children}
    </button>
  );
}
