export type SwapIntent = {
  tokenUserBuys: string;
  minAmountUserBuys: bigint;
  tokenUserSells: string;
  amountUserSells: bigint;
};

export function generateSwapIntent(minAmountUserBuys: bigint): SwapIntent {
  console.log("Generating swap intent");

  const swapIntent: SwapIntent = {
    tokenUserBuys: process.env.USER_BUY_TOKEN_ADDRESS as string,
    minAmountUserBuys: minAmountUserBuys,
    tokenUserSells: process.env.USER_SELL_TOKEN_ADDRESS as string,
    amountUserSells: BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string),
  };

  console.log("Generated swap intent");
  return swapIntent;
}
