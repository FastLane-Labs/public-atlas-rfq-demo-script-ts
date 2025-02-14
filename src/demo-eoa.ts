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
  bundle.dAppOperation,
);

if (bundle.solverOperations.length > 0) {
  console.log("solver bid amount:", bundle.solverOperations[0].getField("bidAmount").value);
}

const hash = await walletClient.sendTransaction({
  to: atlasAddress as Hex,
  value:
    process.env.USER_SELL_TOKEN_ADDRESS == zeroAddress
      ? BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string)
      : BigInt(0),
  gas: bundle.userOperation.getField("gas").value as bigint,
  maxFeePerGas: bundle.userOperation.getField("maxFeePerGas").value as bigint,
  data: metacallCalldata as Hex,
});

await publicClient.waitForTransactionReceipt({ hash });

console.log("Swapped:", hash);
