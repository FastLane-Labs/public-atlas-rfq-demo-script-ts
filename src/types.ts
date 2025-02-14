import { Client, Hex } from "viem";

type GasPricesEncoded = {
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
};

type GasPriceResultEncoded = {
  fast: GasPricesEncoded;
  standard: GasPricesEncoded;
  slow: GasPricesEncoded;
};

type GasPrices = {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
};

type GasPriceResult = {
  fast: GasPrices;
  standard: GasPrices;
  slow: GasPrices;
};

type GasPriceRequest = {
  Method: "gas_getUserOperationGasPrice";
  Parameters: [];
  ReturnType: GasPriceResultEncoded;
};

interface PolicyBond {
  bonded: bigint;
  unbonding: bigint;
  lastAccessedBlock: bigint;
}

type SwapIntent = {
  tokenUserBuys: string;
  minAmountUserBuys: bigint;
  tokenUserSells: string;
  amountUserSells: bigint;
};

function generateSwapIntent(minAmountUserBuys: bigint): SwapIntent {
  const swapIntent: SwapIntent = {
    tokenUserBuys: process.env.USER_BUY_TOKEN_ADDRESS as string,
    minAmountUserBuys: minAmountUserBuys,
    tokenUserSells: process.env.USER_SELL_TOKEN_ADDRESS as string,
    amountUserSells: BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string),
  };

  return swapIntent;
}

type BaselineCall = {
  to: string;
  data: string;
  value: bigint;
};

type Call = {
  to: Hex;
  data: Hex;
  value: bigint;
};

type PaymasterMode = "user" | "sponsor";
type PaymasterData = {
  mode: PaymasterMode;
  validUntil?: bigint;
  validAfter?: bigint;
  sponsorSignature?: Hex;
  userClient?: Client;
};

export {
  GasPriceRequest,
  GasPriceResult,
  GasPriceResultEncoded,
  PolicyBond,
  SwapIntent,
  generateSwapIntent,
  BaselineCall,
  Call,
  PaymasterMode,
  PaymasterData,
};
