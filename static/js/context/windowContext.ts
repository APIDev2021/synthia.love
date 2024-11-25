import { createContext } from "react";
import { WindowData } from "../SynOs/WindowManager";

export type WindowContextType = {
  checkAndSetWindow?: (id: string, newWindow: WindowData) => void;
  checkIsActive?: (id: string) => boolean;
};

export const WindowContext = createContext<WindowContextType>({});
