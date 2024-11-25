import React, { useMemo, useRef, useState } from "react";
import Draggable, { type ControlPosition } from "react-draggable";
import { Resizable } from "re-resizable";
import { css } from "@emotion/react";
import { Bar, BarLeft, BarRight } from "../styled/Window";
import { Rnd, type Props } from "react-rnd";
import styled from "@emotion/styled";

type WindowProps = {
  children: React.ReactNode;
  defaultPosition?: Props["default"];
  isActive?: boolean;
  onMouseDown?: any;
  title: string;
  onClose: () => void;
};

const styles = {
  windowWrap: css`
    background: #0c0a0e;
    width: 100%;
    height: 100%;
    border: 5px solid white;
  `,

  title: css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
};

const Content = styled.div`
  width: 100%;
  cursor: none;
  height: calc(100% - 30px);
  padding: 2rem;
  overflow: scroll;
`;

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function Window({
  children,
  defaultPosition,
  isActive,
  onMouseDown,
  title,
  onClose,
  ...rest
}: WindowProps) {
  const isResizing = useRef(false);
  const canDrag = useRef(false);
  const defaultPos = useMemo(() => {
    const innerWidth = window.innerWidth;
    const delta = innerWidth - 1440;
    let x = () => 0;
    let y = () => 0;
    if (delta > 0) {
      x = () =>
        delta / 2 + randomIntFromInterval(1, window.innerWidth / 2 - 870 / 2);
    }
    y = () => randomIntFromInterval(1, window.innerHeight * 0.25);

    return {
      x: x(),
      y: y(),
      width: Math.min(window.innerWidth - 10, 870),
      height: 520,
    };
  }, []);
  return (
    <>
      <Rnd
        default={defaultPos}
        minHeight="100px"
        minWidth="100px"
        onDrag={() => {
          if (!canDrag.current) {
            return false;
          }
        }}
        style={{
          position: "absolute",
          zIndex: isActive ? 1 : 0,
          boxShadow: isActive ? `0 0 50px rgba(0,0,0,1)` : "",
        }}
      >
        <div
          css={styles.windowWrap}
          onTouchStart={onMouseDown}
          onMouseDown={onMouseDown}
          {...rest}
        >
          <Bar
            data-cursor
            onMouseUp={() => {
              canDrag.current = false;
            }}
            onMouseDown={() => {
              canDrag.current = true;
            }}
            onTouchStart={() => {
              canDrag.current = true;
            }}
            onTouchEnd={() => {
              canDrag.current = false;
            }}
          >
            <BarLeft>
              <span css={styles.title}>{title}</span>
            </BarLeft>
            <BarRight>
              <span
                style={{ padding: "10px" }}
                onTouchEnd={onClose}
                onClick={onClose}
              >
                X
              </span>
            </BarRight>
          </Bar>
          <Content>{children}</Content>
        </div>
      </Rnd>
    </>
  );
}
