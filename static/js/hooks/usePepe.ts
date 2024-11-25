import {
  BrowserProvider,
  Contract,
  ethers,
  formatUnits,
  parseUnits,
} from "ethers";
import { FeeAmount, computePoolAddress } from "@uniswap/v3-sdk";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { SupportedChainId, Token } from "@uniswap/sdk-core";
import IERC20 from "../abi/ierc20.json";
import MintWithPepeAbi from "../abi/mintWithPepe.json";

const TokenSwapAndNFTMint =
  process.env.REACT_APP_PEPESWAP ||
  "0x0c03ecb91cb50835e560a7d52190eb1a5ffba797";

const PEPE_ADDRESS = "0x6982508145454ce325ddbe47a25d4ec3d2311933";

export const WETH_TOKEN = new Token(
  SupportedChainId.MAINNET,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  18,
  "WETH",
  "Wrapped Ether"
);

export const PEPE_TOKEN = new Token(
  SupportedChainId.MAINNET,
  PEPE_ADDRESS,
  18,
  "PEPE",
  "Pepe"
);

export const CurrentConfig = {
  tokens: {
    in: PEPE_TOKEN,
    out: WETH_TOKEN,
    amountOut: 0.029,
    poolFee: FeeAmount.MEDIUM,
  },
};

export const POOL_FACTORY_CONTRACT_ADDRESS =
  "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const QUOTER_CONTRACT_ADDRESS =
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

export function fromReadableAmount(
  amount: number | string,
  decimals: number
): bigint {
  return parseUnits(amount.toString(), decimals);
}

export function toReadableAmount(
  rawAmount: number | string,
  decimals: number
): string {
  return formatUnits(rawAmount, decimals);
}

const getProvider = () => new BrowserProvider(window.ethereum);

export async function quote(
  amount: number
): Promise<{ priceInPepe: string; priceInWeth: string }> {
  const quoterContract = new ethers.Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    getProvider()
  );
  const poolConstants = await getPoolConstants();
  const priceInWeth = fromReadableAmount(
    CurrentConfig.tokens.amountOut * amount,
    CurrentConfig.tokens.out.decimals
  ).toString();

  const quotedAmountOut =
    await quoterContract.quoteExactOutputSingle.staticCall(
      poolConstants.token0,
      poolConstants.token1,
      poolConstants.fee,
      priceInWeth,
      0
    );

  return {
    priceInPepe: toReadableAmount(
      quotedAmountOut,
      CurrentConfig.tokens.out.decimals
    ),
    priceInWeth,
  };
}

// @ts-ignore
window.q = quote;

async function getPoolConstants(): Promise<{
  token0: string;
  token1: string;
  fee: number;
}> {
  const currentPoolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  });

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    getProvider()
  );
  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  return {
    token0,
    token1,
    fee,
  };
}

export function usePepe(setOutput?: any) {
  const mintWithPepe = async (
    amount: string,
    wallet: string,
    success: (message: string) => void
  ) => {
    console.log("HI");
    // get quote
    const { priceInPepe, priceInWeth } = await quote(parseInt(amount));
    setOutput((out: any) => [
      ...out,
      `Total cost: ${priceInPepe} PEPE (${toReadableAmount(
        priceInWeth,
        18
      )} ETH)`,
    ]);
    // check if they have enough pepe
    const provider = getProvider();
    const signer = await provider.getSigner();
    const pepeContract = new Contract(PEPE_ADDRESS, IERC20, signer);
    // check that we can transfer pepe on their behalf
    const allowance = await pepeContract.allowance(wallet, TokenSwapAndNFTMint);
    const priceRaw = fromReadableAmount(priceInPepe, 18);
    if (allowance < priceRaw) {
      try {
        const tx = await pepeContract.approve(TokenSwapAndNFTMint, priceRaw);
        setOutput((out: any) => [...out, `Please wait...`]);
        await tx.wait();
      } catch (e: any) {
        setOutput((out: any) => [...out, `Error: ${e.message}`]);
        return;
      }
    }
    const swapContract = new Contract(
      TokenSwapAndNFTMint,
      MintWithPepeAbi,
      signer
    );
    try {
      const tx = await swapContract.swapAndMint(
        PEPE_ADDRESS,
        priceRaw,
        priceInWeth,
        0,
        amount
      );
      success(tx.hash);
    } catch (e: any) {
      setOutput((out: any) => [...out, `Error: ${e.message}`]);
      return;
    }
  };
  return { mintWithPepe };
}
