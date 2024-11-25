import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

type Nft = {
  tokenId: string;
  image: string;
  traits: Trait[];
  stats: Trait[];
};

type Trait = {
  trait_type: string;
  value: number | string;
};

type MainStore = {
  terminalOpen: boolean;
  updateTerminalOpen: (open: boolean) => void;
  auth?: string;
  wallet?: string;
  updateAuth: (auth: string) => void;
  updateWalletError?: (err: string) => void;
  connectWallet?: (
    connectedCb?: (wallet: string) => void,
    errorCb?: () => void
  ) => void;
  fetchSynthiaNfts: (wallet: string, cursor?: string) => Promise<any>;
  updateWallet: (wallet: string) => void;
  nfts?: Nft[];
  next?: string;
  walletError?: string;
  loadingWallet?: boolean;
  loadingNfts?: boolean;
};

export const useMainStore = create<MainStore>()(
  devtools(
    persist(
      (set, get) => ({
        terminalOpen: false,

        updateAuth(auth) {
          set({ auth });
        },
        updateTerminalOpen(open) {
          set({ terminalOpen: open });
        },

        updateWallet(wallet) {
          set({ nfts: [], wallet });
        },
        connectWallet: (
          connectedCb?: (wallet: string) => void,
          errorCb?: () => void
        ) => {
          set({ loadingWallet: true, walletError: "" });
          if (typeof window.ethereum !== "undefined") {
            window.ethereum
              .request({
                method: "eth_requestAccounts",
              })
              .then((accounts: string[]) => {
                connectedCb?.(accounts[0]);
                set({ wallet: accounts[0] });
              })
              .catch((err: any) => {
                errorCb?.();
                if (err?.code === 4001) {
                  // EIP-1193 userRejectedRequest error
                  // If this happens, the user rejected the connection request.
                  console.log("Please connect to MetaMask.");
                } else {
                  console.error(err);
                }
              });
          } else {
            errorCb?.();
            set({ loadingWallet: false, walletError: "needs wallet" });
          }
        },

        fetchSynthiaNfts: async (wallet: string, cursor?: string) => {
          set({ loadingNfts: true });
          const res = await fetch(
            `https://api.opensea.io/api/v1/assets?order_direction=desc&limit=20${
              cursor ? `&cursor=${cursor}` : ""
            }&owner=${wallet}&asset_contract_address=0xabf0b84f870ff3b45988e49fd62b881d7c46c6e6`,
            {
              headers: {
                accept: "application/json",
                "X-API-KEY": "da371fbfd4c847a394042898ee080192",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            console.log(data);

            const nfts: Nft[] = data.assets.map((item: any) => {
              const stats: Trait[] = [];
              const traits: Trait[] = [];

              item.traits.forEach((t: Trait) => {
                if (typeof t.value === "number") {
                  stats.push(t);
                } else {
                  traits.push(t);
                }
              });
              return {
                tokenId: item.token_id,
                image: item.image_url,
                traits,
                stats,
              };
            });

            const currentNfts = get().nfts || [];

            set({ nfts: [...currentNfts, ...nfts], next: data.next });
          } else if (res.status === 429) {
            await wait(500);
            await get().fetchSynthiaNfts(wallet, cursor);
            console.log("Something went wrong");
          }
          set({ loadingNfts: false });
        },
      }),
      {
        name: "__SYN-STORE__",
        partialize: (state) => ({ auth: state.auth, wallet: state.wallet }),
      }
    )
  )
);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
