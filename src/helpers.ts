import { Hex, encodeFunctionData, Client, zeroAddress } from "viem";
import { atlasSdk } from "./common";
import { publicClient } from "./user";
import { demoErc20UserIsSelling } from "./contracts";

export async function approveErc20IfNeeded(client: Client) {
  if (process.env.USER_SELL_TOKEN_ADDRESS === zeroAddress) {
    console.log("User selling ETH, skipping approval");
    return;
  }

  const atlasAddress = (await atlasSdk.getAtlasAddress()) as Hex;

  const allowance = await demoErc20UserIsSelling.read.allowance([
    client.account?.address,
    atlasAddress,
  ]) as bigint;

  if (allowance >= BigInt(process.env.USER_SELL_TOKEN_AMOUNT!)) {
    console.log("User already has enough allowance, skipping approval");
    return;
  }

  console.log("Approving tokens");

  const data = encodeFunctionData({
    abi: demoErc20UserIsSelling.abi,
    functionName: "approve",
    args: [atlasAddress, BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string)],
  });

  const hash = await client.sendTransaction({
    to: process.env.USER_SELL_TOKEN_ADDRESS as Hex,
    data,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  console.log("Aprroved:", hash);
}