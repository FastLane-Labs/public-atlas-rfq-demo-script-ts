import { Hex, zeroAddress } from "viem";
import { atlasSdk } from "./common";
import { setupAtlas } from "./atlas";
import { eoaClient, publicClient } from "./user";

// Build baseline call, swap intent, user operation, and send it to the FastLane auctioneer.
// We get in return a full Atlas bundle. No user interaction needed at all during this phase.
const walletClient = eoaClient;
const bundle = await setupAtlas(walletClient);
const atlasAddress = await atlasSdk.getAtlasAddress();

const metacallCalldata = atlasSdk.getMetacallCalldata(
  bundle.userOperation,
  bundle.solverOperations,
  bundle.dAppOperation
);

let gasLimit = bundle.userOperation.getField("gas").value as bigint;
for (const solverOp of bundle.solverOperations) {
  gasLimit += solverOp.getField("gas").value as bigint;
}
gasLimit += BigInt(500_000); // Buffer for metacall validation

console.log("User sending transaction (self bundling)");

const hash = await walletClient.sendTransaction({
  to: atlasAddress as Hex,
  value:
    process.env.USER_SELL_TOKEN_ADDRESS == zeroAddress
      ? BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string)
      : BigInt(0),
  gas: gasLimit,
  maxFeePerGas: bundle.userOperation.getField("maxFeePerGas").value as bigint,
  data: metacallCalldata as Hex,
});

await publicClient.waitForTransactionReceipt({ hash });

console.log("Swapped:", hash);
