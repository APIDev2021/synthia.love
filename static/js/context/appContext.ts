import { createContext } from "react";

export type AppContextType = {
  auth?: string;
  wallet?: string;
  updateWalletError?: React.Dispatch<React.SetStateAction<string>>;
  connectWallet?: (
    connectedCb: (wallet: string) => void,
    errorCb: () => void
  ) => void;
  walletError?: string;
  loadingWallet?: boolean;
};

export const AppContext = createContext<AppContextType>({});
