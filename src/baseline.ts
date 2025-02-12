
import swapRouterAbi from "./abi/swapRouter.json";
import pairAbi from "./abi/pair.json";
import { encodeFunctionData, Client, Hex, zeroAddress, getContract } from "viem";
import { publicClient } from "./user";

const poolFee = 100n; // pool fee as a bigint

export type BaselineCall = {
  to: string;
  data: string;
  value: bigint;
};

export async function generateBaseline(
  publicClient: Client, // Pass in your viem public client
  recipient: string
): Promise<[BaselineCall, bigint]> {
  let userSellTokenAddress = process.env.USER_SELL_TOKEN_ADDRESS as string;
  let userBuyTokenAddress = process.env.USER_BUY_TOKEN_ADDRESS as string;
  let pairAddress = process.env.PAIR_ADDRESS as string;
  const userSellTokenAmount = BigInt(
    process.env.USER_SELL_TOKEN_AMOUNT as string
  );
  const routerAddress = process.env.ROUTER_ADDRESS as string;

  const pairContract = getContract({
    address: pairAddress as Hex,
    abi: pairAbi,
    client: publicClient,
  });

  const [reserve0, reserve1, blockTimestampLast] = await pairContract.read.getReserves();
  const token0 = await pairContract.read.token0();
  // const token1 = await pairContract.read.token1();

  const reserveIn = token0 === userSellTokenAddress ? reserve0 : reserve1;
  const reserveOut = token0 === userSellTokenAddress ? reserve1 : reserve0;

  const contract = getContract({
    address: routerAddress as Hex,
    abi: swapRouterAbi,
    client: publicClient,
  });

  const minAmountOut = await contract.read.getAmountOut([
      userSellTokenAddress,
      reserveIn,
      reserveOut,
  ]) as bigint;

  let data = encodeFunctionData({
    abi: swapRouterAbi,
    functionName: "swapExactTokensForTokens",
    args: [
      userSellTokenAmount,
      0n,
      [userSellTokenAddress, userBuyTokenAddress],
      recipient,
      blockTimestampLast + 10000,
    ],
  });
  

  const baselineCall: BaselineCall = {
    to: routerAddress,
    data,
    value:
      process.env.USER_SELL_TOKEN_ADDRESS === zeroAddress
        ? userSellTokenAmount
        : 0n,
  };

  return [baselineCall, minAmountOut];
}

// generateBaseline(publicClient, "0x0000000000000000000000000000000000000000");
