import { atlasSdk } from "./common";
import {
  shBundler,
  publicClient,
  smartAccount,
  eoaClient,
  ADDRESS_HUB,
} from "./user";
import { Hex, encodeFunctionData, getContract, zeroAddress } from "viem";
import { setupAtlas } from "./atlas";
import demoErc20Abi from "./abi/demoErc20.json";
import addressHubAbi from "./abi/addressHub.json";
import wethAbi from "./abi/weth.json";
import { paymasterMode } from "./helpers";

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

async function wrapMon(smartAccount: SmartAccount, paymaster: Paymaster) {
  let data = encodeFunctionData({
    abi: wethAbi,
    functionName: "deposit",
    args: [],
  });

  const userOpHash = await shBundler.sendUserOperation({
    account: smartAccount,
    paymaster: paymaster,
    paymasterData: paymasterMode("user") as Hex,
    paymasterPostOpGasLimit: 500000n,
    paymasterVerificationGasLimit: 500000n,
    calls: [
      {
        to: process.env.WETH_ADDRESS as Hex,
        data,
        value: BigInt(process.env.USER_SELL_TOKEN_AMOUNT as string),
      },
    ],
    ...(await shBundler.getUserOperationGasPrice()).slow,
  });

  console.log("User Operation Hash:", userOpHash);

  const userOpReceipt = await shBundler.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  console.log("User Operation Receipt:", userOpReceipt);
}

await publicClient.waitForTransactionReceipt({ hash });