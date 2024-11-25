import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const Bar = styled.div`
  background: white;
  height: 35px;
  font-size: 2.4rem;
  display: flex;
  align-items: center;
  margin: -5px -5px 0 -5px;
  cursor: none;
  padding: 0 10px;
  justify-content: space-between;
  text-transform: uppercase;
`;

export const BarLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  overflow: hidden;
`;

export const BarRight = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
`;
