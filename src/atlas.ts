import { Bundle } from "@fastlane-labs/atlas-sdk";
import { provider, atlasSdk } from "./common";
import { generateBaseline } from "./baseline";
import { generateSwapIntent } from "./intent";
import {
  approveErc20IfNeeded,
} from "./helpers";
import { publicClient } from "./user";
import { Client, encodeFunctionData, Hex, zeroAddress } from "viem";

import rfqControlAbi from "./abi/rfqControl.json";
import dotenv from "dotenv";

dotenv.config();

export async function setupAtlas(walletClient: Client): Promise<Bundle> {
  console.log("===== SETTING UP DEMO =====");

  const userAddress = walletClient.account?.address as Hex;

  // smart wallet doesn't need to approve
  if (walletClient.type == "walletClient") {
    await approveErc20IfNeeded(walletClient);
  }

  const executionEnvironment = await atlasSdk.getExecutionEnvironment(
    userAddress,
    process.env.RFQ_CONTROL_ADDRESS as string
  );

  const [baselineCall, minAmountOut] = await generateBaseline(
    publicClient,
    executionEnvironment
  );

  console.log("baseline swap amount:", minAmountOut);

  const swapIntent = generateSwapIntent(minAmountOut);

  const swapData = encodeFunctionData({
    abi: rfqControlAbi,
    functionName: "swap",
    args: [swapIntent, baselineCall],
  });

  const currentBlockNumber = await provider.getBlockNumber();
  const suggestedFeeData = await provider.getFeeData();

  console.log("Current block number:", currentBlockNumber);

  let atlasUserOperation = await atlasSdk.newUserOperation({
    from: userAddress,
    value:
      process.env.USER_SELL_TOKEN_ADDRESS == zeroAddress
        ? BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string)
        : BigInt(0),
    gas: BigInt(1_000_000), // Hardcoded for demo
    maxFeePerGas: (suggestedFeeData.maxFeePerGas as bigint) * BigInt(2),
    deadline: BigInt(currentBlockNumber + 10),
    dapp: process.env.RFQ_CONTROL_ADDRESS as string,
    control: process.env.RFQ_CONTROL_ADDRESS as string,
    sessionKey: process.env.AUCTIONEER_ADDRESS as string,
    data: swapData,
  });

  const bundle = (await atlasSdk.submitUserOperation(atlasUserOperation, [], {
    auctionDurationInMillis: 1500, // Longer duration for the demo
    disableBundling: true, // Disable Atlas bundler, we bundle ourselves
    disableSimulations: true,
  })) as Bundle;

  console.log("Atlas bundle received");

  console.log("===== SETUP COMPLETE =====");

  return bundle;
}
