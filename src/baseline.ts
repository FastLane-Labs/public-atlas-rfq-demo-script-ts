
import { swapRouterAbi } from "./abi/abi";
import { encodeFunctionData, zeroAddress } from "viem";
import * as constants from "./constants";
import { BaselineCall } from "./types";
import { swapRouterContract, pairContract } from "./contracts";

async function generateBaseline(
  recipient: string
): Promise<[BaselineCall, bigint]> {
  const userSellTokenAddress = constants.USER_SELL_TOKEN_ADDRESS;
  const userBuyTokenAddress = constants.USER_BUY_TOKEN_ADDRESS;
  const userSellTokenAmount = constants.USER_SELL_TOKEN_AMOUNT;
  const routerAddress = constants.ROUTER_ADDRESS;

  const [reserve0, reserve1, blockTimestampLast] = await pairContract.read.getReserves() as [bigint, bigint, bigint];
  const token0 = await pairContract.read.token0();

  const reserveIn = token0 === userSellTokenAddress ? reserve0 : reserve1;
  const reserveOut = token0 === userSellTokenAddress ? reserve1 : reserve0;

  const minAmountOut = await swapRouterContract.read.getAmountOut([
    userSellTokenAmount,
    reserveIn,
    reserveOut,
  ]) as bigint;

  const data = encodeFunctionData({
    abi: swapRouterAbi,
    functionName: "swapExactTokensForTokens",
    args: [
      userSellTokenAmount,
      0n,
      [userSellTokenAddress, userBuyTokenAddress],
      recipient,
      BigInt(blockTimestampLast) + 1000n,
    ],
  });
  
  const baselineCall: BaselineCall = {
    to: routerAddress,
    data,
    value:
      userSellTokenAddress === zeroAddress
        ? userSellTokenAmount
        : 0n,
  };

  return [baselineCall, minAmountOut];
}

export { generateBaseline };