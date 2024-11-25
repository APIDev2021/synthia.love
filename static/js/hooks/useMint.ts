import { Contract, BrowserProvider, parseEther, getAddress } from "ethers";
import synthiaAbi from "../abi/synthia.json";
import heroesAbi from "../abi/heroes.json";
import { env } from "../constants";
import { useContext } from "react";
import BigNumber from "bignumber.js";
import { AppContext } from "../context/appContext";
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
const heroesAddress = "0x34bb16fcd733f8ee46d48206f7154f7cd585f97a";

const wlCollections = [
  heroesAddress,
  "0x527a4206ac04c2017295cf32f1fc2f9e034a7c40",
  "0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7",
  "0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63",
  "0x448f3219cf2a23b0527a7a0158e7264b87f635db",
  "0xef2b840add7736a71ec13e0477ec1844bbc82550",
  "0x0427743df720801825a5c82e0582b1e915e0f750",
  "0xa8386f29cd53533c4670abdf64dcf66d7d5b2925",
  "0xe5a5520b798c5f67ca1b0657b932656df02595ad",
  "0x36f4d96fe0d4eb33cdc2dc6c0bca15b9cdd0d648",
  "0xf38d6bf300d52ba7880b43cddb3f94ee3c6c4ea6",
  "0xfb3765e0e7ac73e736566af913fa58c3cfd686b7",
  "0x38930aae699c4cd99d1d794df9db41111b13092b",
  "0x9251dec8df720c2adf3b6f46d968107cbbadf4d4",
  "0xCe9CA012fA55A8b1E540dF35f6c77203812df523",
  "0x441698f426365bbb1c16a46c1b722461567925aa",
].map(getAddress);

console.log(wlCollections);

const merklePath =
  "https://lpmetadata.s3.us-west-1.amazonaws.com/merkle.1.0.0.json";

let mintDates = {
  gm: 1683135000,
  wl: 1683221400,
  public: 1683307800,
};

export function useMint() {
  const { wallet } = useContext(AppContext);

  const mint = async (
    amount: string,
    wallet: string | undefined,
    success: (message: string) => void,
    error: (message: string) => void
  ) => {
    const amountInt = parseInt(amount);
    if (amountInt > 20) {
      return error("Error: Max mint amount per transaction is 20");
    }

    const provider = new BrowserProvider(window.ethereum);
    const block = await provider.getBlock("latest");
    console.log(block);
    const isGm = (block?.timestamp ?? 0) >= mintDates.gm;
    const isWl = (block?.timestamp ?? 0) >= mintDates.wl;
    const isPub = (block?.timestamp ?? 0) >= mintDates.public;

    if (!isGm) {
      error("Error: Mint has not started yet.");
      return;
    }

    const signer = await provider.getSigner();
    const contract = new Contract(env.synthia as string, synthiaAbi, signer);
    const heroes = new Contract(heroesAddress, heroesAbi, signer);
    //@ts-ignore
    window.heroes = heroes;

    let heroHolder = false;
    let heroBalance = 0;

    const gmOnlyActive = isGm && !isWl && !isPub;

    try {
      heroBalance = await heroes.balanceOf(wallet);
      heroHolder = heroBalance > 0;
    } catch (e: any) {
      console.log(`Error decoding hero balance`, e?.message);
    }
    let pricePerUnit = heroHolder ? 0.025 : 0.029;
    if (gmOnlyActive && heroBalance == 1) {
      console.log("EH");
      pricePerUnit = 0.029;
    }

    const price = new BigNumber(pricePerUnit)
      .times(amount)
      .times(10 ** 18)
      .toFixed();
    console.log(price);

    // @ts-ignore
    window.c = contract;

    if (gmOnlyActive) {
      const merkle = await fetch(merklePath).then((res) => res.json());
      const walletProof = merkle[wallet as string];
      if (!walletProof) {
        return error(
          `Error: Wallet ${wallet} not on the guaranteed mint list. Wait until public mint.`
        );
      }
      try {
        const tx = await contract.guaranteedMint(amount, walletProof, {
          value: price,
        });
        success(tx.hash);
      } catch (e: any) {
        error(`Error: ${e.message}`);
        console.log(e);
      }
    } else if (isWl && !isPub) {
      console.log("WL");
      const checkWl = async (address: string) => {
        const contract = new Contract(address, synthiaAbi, provider);
        try {
          const balance = await contract.balanceOf(wallet);
          return balance > 0;
        } catch (e) {
          console.log(e);
          return false;
        }
      };

      let wlAddress = "";
      if (!heroHolder) {
        error("Please wait while I verify you are on the list.");
        for (let i = 0; i < wlCollections.length; i++) {
          const address = wlCollections[i];
          console.log("address ", address);
          const has = await checkWl(wlCollections[i]);
          console.log(has);
          if (has) {
            wlAddress = address;
            break;
          }
        }
      } else {
        wlAddress = heroesAddress;
      }
      let walletProof;
      try {
        const merkle = await fetch(merklePath).then((res) => res.json());
        walletProof = merkle[wallet as string];
      } catch (e) {
        console.log(e);
      }

      // Can use merkle if you have wallet proof and you're not on the WL and you dont have exactly 1 hero
      if (walletProof && !wlAddress) {
        try {
          const tx = await contract.guaranteedMint(amount, walletProof, {
            value: price,
          });
          success(tx.hash);
        } catch (e: any) {
          error(`Error: ${e.message}`);

          console.log(e);
        }
      } else {
        if (!wlAddress) {
          return error(
            "Error: You are not on the list. Mint during public mint."
          );
        }

        // If they are on the WL then lets mint
        try {
          const tx = await contract.mintWithAddress(amount, wlAddress, {
            value: price,
          });
          success(tx.hash);
        } catch (e) {
          console.log(e);
        }
      }
    } else if (isPub) {
      console.log("PUB");
      try {
        const tx = await contract.mint(amount, {
          value: price,
        });
        success(tx.hash);
      } catch (e: any) {
        error(`Error: ${e.message}`);
        console.log(e);
      }
    }
  };
  return { mint };
}
