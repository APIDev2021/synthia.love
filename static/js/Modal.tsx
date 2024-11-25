import { css, keyframes } from "@emotion/react";
import React from "react";
import { TextButton } from "./TextBtn";

export const hologram = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

const modalOverlay = css`
  position: fixed;
  user-select: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: flex-start;
  overflow-y: scroll;
  justify-content: center;
  z-index: 9999;
  animation: ${hologram} 0.19s linear;
  padding: 50px 0;
`;

const modalContent = css`
  padding: 2rem;
  border-radius: 20px;
  position: relative;
  margin: 0 10px;
  min-width: 300px;
  display: flex;
  justify-content: center;
  max-width: 960px;
  width: 100%;
  background: url(/tile.png) repeat;
  border: 5px solid #1ae5d4;
  box-shadow: 0 0 100px #1ae5d4;
`;

const modalContentInner = css`
  position: relative;
  max-width: 600px;
  width: 100%;
  z-index: 5;
  p {
    color: white;
  }
`;

export const Modal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div css={modalOverlay} onClick={onClose}>
      <div css={modalContent} onClick={(e) => e.stopPropagation()}>
        <div css={modalContentInner}>
          <TextButton
            style={{ padding: "1rem", position: "absolute", right: 0 }}
            onClick={onClose}
          >
            close
          </TextButton>

          {children}
        </div>
      </div>
    </div>
  );
};
