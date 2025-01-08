import { atlasSdk } from "./common";
import atlasExecutorAbi from "./abi/atlasExecutor.json";
import {
  bundlerClient,
  atlasExecutorAddress,
  publicClient,
  paymasterClient,
} from "./user";
import { Hex, encodeFunctionData, zeroAddress } from "viem";
import { setupAtlas } from "./atlas";

const bundle = await setupAtlas(bundlerClient);

if (bundle.solverOperations.length > 0) {
  const topBidAmount = bundle.solverOperations[0].getField("bidAmount")
    .value as bigint;
  const topBidAmountNormalized = topBidAmount;
  console.log("Best Solver bid amount:", topBidAmountNormalized);
}
const atlasAddress = await atlasSdk.getAtlasAddress();

const data = encodeFunctionData({
  abi: atlasExecutorAbi,
  functionName: "execAtlas",
  args: [
    bundle.userOperation.toStruct(),
    bundle.solverOperations.map((op) => op.toStruct()),
    bundle.dAppOperation.toStruct(),
    atlasAddress as Hex,
    process.env.USER_SELL_TOKEN_ADDRESS as Hex,
    BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string),
    process.env.AUCTIONEER_ADDRESS as Hex,
  ],
});

let gasLimit = bundle.userOperation.getField("gas").value as bigint;
for (const solverOp of bundle.solverOperations) {
  gasLimit += solverOp.getField("gas").value as bigint;
}
gasLimit += BigInt(1_000_000); // Buffer for metacall validation

console.log("Smart wallet sending transaction");

const hash = await bundlerClient.sendTransaction({
  callGasLimit: gasLimit,
  maxFeePerGas: bundle.userOperation.getField("maxFeePerGas").value as bigint,
  maxPriorityFeePerGas: (
    await paymasterClient.getUserOperationGasPrice()
  ).fast.maxPriorityFeePerGas,
  calls: [
    {
      to: atlasExecutorAddress,
      data,
    },
  ],
});

await publicClient.waitForTransactionReceipt({ hash });

console.log("Swapped:", hash);
