import { createPublicClient, createWalletClient, custom, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { toSafeSmartAccount, toSimpleSmartAccount } from "permissionless/accounts";
import * as constants from "./constants";
import { ConnectedWallet, useWallets } from "@privy-io/react-auth";

 
// const { wallets } = useWallets();
// const embeddedWallet = wallets.find(
//   (wallet) => wallet.walletClientType === "privy"
// ) as ConnectedWallet;
// console.log(embeddedWallet);


export const eoaClient = createWalletClient({
  transport: http(constants.RPC_URL),
  account: constants.EOA,
  chain: constants.CHAIN,
});

export const publicClient = createPublicClient({
  transport: http(constants.RPC_URL),
  chain: constants.CHAIN,
});

// smart wallet
export const smartAccount = await toSafeSmartAccount({
  client: publicClient,
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
  owners: [constants.EOA],
  version: "1.4.1",
  safe4337ModuleAddress: constants.SAFE4337_MODULE_ADDRESS,
  safeProxyFactoryAddress: constants.SAFE_PROXY_FACTORY_ADDRESS,
  safeSingletonAddress: constants.SAFE_SINGLETON_ADDRESS,
  safeModuleSetupAddress: constants.SAFE_MODULE_SETUP_ADDRESS,
  multiSendAddress: constants.MULTI_SEND_ADDRESS,
  multiSendCallOnlyAddress: constants.MULTI_SEND_CALL_ONLY_ADDRESS,
});

// const owner = await embeddedWallet.getEthereumProvider();

// console.log(owner);

// if (!owner) {
//   throw new Error("No owner found")
// }

// const simpleSmartAccount = await toSimpleSmartAccount({
//   owner,
//   client: publicClient,
//   entryPoint: {
//     address: entryPoint07Address,
//     version: "0.7"
//   }

// })

// const simpleSmartAccountClient = createSmartAccountClient({
//   account: simpleSmartAccount,
//   chain: constants.CHAIN,
//   bundlerTransport: http(constants.SHBUNDLER_URL),
// })



