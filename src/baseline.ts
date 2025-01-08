import uniswapV3QuoterAbi from "./abi/uniswapV3/quoterv2.json";
import uniswapV3SwapRouterAbi from "./abi/uniswapV3/swapRouter02.json";
import { encodeFunctionData, Client, Hex, zeroAddress } from "viem";

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
  console.log("Generating baseline");

  let userSellTokenAddress = process.env.USER_SELL_TOKEN_ADDRESS as string;
  let userBuyTokenAddress = process.env.USER_BUY_TOKEN_ADDRESS as string;
  const userSellTokenAmount = BigInt(
    process.env.USER_SELL_TOKEN_AMOUNT as string
  );
  const quoterAddress = process.env.UNISWAP_V3_QUOTER_ADDRESS as string;
  const routerAddress = process.env.UNISWAP_V3_ROUTER_ADDRESS as string;

  if (userSellTokenAddress === userBuyTokenAddress) {
    throw new Error(
      "User sell token address cannot be the same as user buy token address"
    );
  }

  if (userSellTokenAddress === zeroAddress) {
    const { result } = await publicClient.simulateContract({
      address: routerAddress,
      abi: uniswapV3SwapRouterAbi,
      functionName: "WETH9",
    });

    userSellTokenAddress = result as string;
  }

  if (userBuyTokenAddress === zeroAddress) {
    const { result } = await publicClient.simulateContract({
      address: routerAddress,
      abi: uniswapV3SwapRouterAbi,
      functionName: "WETH9",
    });

    userBuyTokenAddress = result as string;
  }

  const { result } = await publicClient.simulateContract({
    address: quoterAddress,
    abi: uniswapV3QuoterAbi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: userSellTokenAddress,
        tokenOut: userBuyTokenAddress,
        amountIn: userSellTokenAmount,
        fee: poolFee,
        sqrtPriceLimitX96: 0,
      },
    ],
  });

  const minAmountOut = result[0];

  // Encode the router function data
  let data = encodeFunctionData({
    abi: uniswapV3SwapRouterAbi,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: userSellTokenAddress,
        tokenOut: userBuyTokenAddress,
        fee: poolFee,
        recipient: recipient,
        amountIn: userSellTokenAmount,
        amountOutMinimum: minAmountOut,
        sqrtPriceLimitX96: 0n,
      },
    ],
  });

  if (process.env.USER_BUY_TOKEN_ADDRESS === zeroAddress) {
    // Swap to ETH, we need to multicall the swap and unwrapping
    const swapData = encodeFunctionData({
      abi: uniswapV3SwapRouterAbi,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: userSellTokenAddress,
          tokenOut: userBuyTokenAddress,
          fee: poolFee,
          recipient: process.env.UNISWAP_V3_ROUTER_ADDRESS as Hex,
          amountIn: userSellTokenAmount,
          amountOutMinimum: minAmountOut,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    const unwrapData = encodeFunctionData({
      abi: uniswapV3SwapRouterAbi,
      functionName: "unwrapWETH9",
      args: [minAmountOut],
    });

    data = encodeFunctionData({
      abi: uniswapV3SwapRouterAbi,
      functionName: "multicall",
      args: [[swapData, unwrapData]],
    });
  }

  const baselineCall: BaselineCall = {
    to: routerAddress,
    data,
    value:
      process.env.USER_SELL_TOKEN_ADDRESS === zeroAddress
        ? userSellTokenAmount
        : 0n,
  };

  console.log("Generated baseline");
  return [baselineCall, minAmountOut];
}
