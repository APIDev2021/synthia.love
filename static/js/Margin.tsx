import { css } from "@emotion/react";
import React, { ReactNode } from "react";

interface MarginProps {
  children: ReactNode;
  margin: string;
  style?: React.CSSProperties;
}

export const Margin: React.FC<MarginProps> = ({ style, children, margin }) => {
  return (
    <div
      style={style}
      css={css`
        & > * {
          margin: ${margin};
        }
      `}
    >
      {children}
    </div>
  );
};
