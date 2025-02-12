import wethAbi from "./abi/weth.json";
import { encodeFunctionData, Hex } from "viem";
import { eoaClient, publicClient } from "./user"

console.log(eoaClient.account.address)

// Encode the router function data
let data = encodeFunctionData({
    abi: wethAbi,
    functionName: "deposit",
    args: [],
  });

  const hash = await eoaClient.sendTransaction({
    to: process.env.WETH_ADDRESS as Hex,
    data,
    value: BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string),
  });

  await publicClient.waitForTransactionReceipt({ hash });