import { atlasSdk } from "./common";
import { publicClient, smartAccount } from "./user";
import { encodeFunctionData, Hex, zeroAddress } from "viem";
import { setupAtlas } from "./atlas";
import { addressHub, weth } from "./contracts";
import { shBundler } from "./bundler";
import { demoErc20Abi, wethAbi } from "./abi/abi";
import { Call } from "./types";
import { paymasterMode } from "./bundler";
import * as constants from "./constants";

const smartAccountBalance = await publicClient.getBalance({
  address: smartAccount.address,
});
console.log("smart account address", smartAccount.address);
console.log("Smart Account MON Balance:", smartAccountBalance);

const wethBalance = await weth.read.balanceOf([smartAccount.address]);
console.log("WETH Balance:", wethBalance); 


const bundle = await setupAtlas(shBundler);
const atlasAddress = (await atlasSdk.getAtlasAddress()) as Hex;

const wrapData = encodeFunctionData({
  abi: wethAbi,
  functionName: "deposit",
  args: [],
});
const wrapCall: Call = {to: constants.WETH_ADDRESS, data: wrapData, value: constants.USER_SELL_TOKEN_AMOUNT};

const approveData = encodeFunctionData({
  abi: demoErc20Abi,
  functionName: "approve",
  args: [atlasAddress, constants.USER_SELL_TOKEN_AMOUNT],
});
const approveCall: Call = {to: constants.USER_SELL_TOKEN_ADDRESS, data: approveData, value: BigInt(0)};

const atlasData = atlasSdk.getMetacallCalldata(
  bundle.userOperation,
  bundle.solverOperations,
  bundle.dAppOperation,
) as Hex;

const atlasCall: Call = {
  to: atlasAddress,
  value:
  constants.USER_SELL_TOKEN_ADDRESS == zeroAddress
      ? constants.USER_SELL_TOKEN_AMOUNT
      : BigInt(0),
  data: atlasData,
};

if (bundle.solverOperations.length > 0) {
  console.log("solver bid amount:", bundle.solverOperations[0].getField("bidAmount").value);
}

const calls = [wrapCall];

const PAYMASTER = (await addressHub.read.paymaster4337([])) as Hex;
const hash = await shBundler.sendUserOperation({
    account: smartAccount,
    paymaster: PAYMASTER,
    paymasterData: paymasterMode({mode: "user"}) as Hex,
    paymasterPostOpGasLimit: 500_000n,
    paymasterVerificationGasLimit: 500_000n,
    calls: calls,
    ...(await shBundler.getUserOperationGasPrice()).fast,
    // maxFeePerGas: 55000000000n,
    // maxPriorityFeePerGas: 3000000000n,
});

console.log("User Operation Hash:", hash);

const userOpReceipt = await shBundler.waitForUserOperationReceipt({ hash });
console.log("User Operation Receipt:", userOpReceipt);

