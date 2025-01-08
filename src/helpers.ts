import { Hex, encodeFunctionData, Client, zeroAddress } from "viem";
import { atlasSdk } from "./common";
import {
  demoErc20UserIsSelling,
  demoErc20UserIsBuying,
  eoaClient,
  publicClient,
} from "./user";

import demoErc20Abi from "./abi/demoErc20.json";

export async function mintErc20IfNeeded(client: Client) {
  if (process.env.USER_SELL_TOKEN_ADDRESS === zeroAddress) {
    console.log("User selling ETH, skipping mint");
    return;
  }

  const userAddress = client.account?.address as Hex;
  const balance: bigint = await demoErc20UserIsSelling.read.balanceOf([
    userAddress,
  ]);

  if (balance >= BigInt(process.env.USER_SELL_TOKEN_AMOUNT!)) {
    console.log("User already has enough tokens, skipping mint");
    return;
  }

  console.log("Minting tokens");

  const data = encodeFunctionData({
    abi: demoErc20Abi,
    functionName: "mint",
    args: [userAddress, BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string)],
  });

  const hash = await eoaClient.sendTransaction({
    to: process.env.USER_SELL_TOKEN_ADDRESS as Hex,
    data,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  console.log("Minted tokens:", hash);
}

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

export async function sendTokensToSolverIfNeeded(
  client: Client,
  minAmountUserBuys: bigint,
  solverAddress: string
) {
  if (process.env.SOLVER_SHOULD_FULFILL === "false") {
    console.log("Solver should not fulfill, skipping sending tokens");
    return;
  }

  // Demo solver is set to bid 10% above the minimum amount the user buys
  const delta = (minAmountUserBuys * 10n) / 100n;
  const expectedBidAmount = minAmountUserBuys + delta;

  let currentBalance: bigint;

  if (process.env.USER_BUY_TOKEN_ADDRESS === zeroAddress) {
    currentBalance = await publicClient.getBalance({
      address: solverAddress as Hex,
    });
  } else {
    currentBalance = (await demoErc20UserIsBuying.read.balanceOf([
      solverAddress as Hex,
    ])) as bigint;
  }

  if (currentBalance >= expectedBidAmount) {
    console.log(
      "Solver already has enough eth/tokens, skipping sending tokens"
    );
    return;
  }

  let txHash: Hex;
  console.log("Sending eth/tokens to solver");

  if (process.env.USER_BUY_TOKEN_ADDRESS === zeroAddress) {
    txHash = await eoaClient.sendTransaction({
      to: solverAddress as Hex,
      value: expectedBidAmount - currentBalance,
    });
  } else {
    const data = encodeFunctionData({
      abi: demoErc20Abi,
      functionName: "mint",
      args: [solverAddress, expectedBidAmount - currentBalance],
    });

    txHash = await client.sendTransaction({
      to: process.env.USER_BUY_TOKEN_ADDRESS as Hex,
      data,
    });
  }

  console.log("Sent eth/tokens to solver:", txHash);
}
