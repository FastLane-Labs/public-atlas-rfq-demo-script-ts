import { Hex, encodeFunctionData, Client, zeroAddress } from "viem";
import { atlasSdk } from "./common";
import {
  demoErc20UserIsSelling,
  publicClient,
} from "./user";

import demoErc20Abi from "./abi/demoErc20.json";

export async function approveErc20IfNeeded(client: Client) {
  if (process.env.USER_SELL_TOKEN_ADDRESS === zeroAddress) {
    console.log("User selling ETH, skipping approval");
    return;
  }

  const atlasAddress = (await atlasSdk.getAtlasAddress()) as Hex;

  const allowance = await demoErc20UserIsSelling.read.allowance([
    client.account?.address,
    atlasAddress,
  ]);

  if (allowance >= BigInt(process.env.USER_SELL_TOKEN_AMOUNT!)) {
    console.log("User already has enough allowance, skipping approval");
    return;
  }

  console.log("Approving tokens");

  const data = encodeFunctionData({
    abi: demoErc20Abi,
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
