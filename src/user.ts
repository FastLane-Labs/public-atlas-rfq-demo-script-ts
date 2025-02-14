import { createPublicClient, createWalletClient, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { toSafeSmartAccount } from "permissionless/accounts";
import * as constants from "./constants";


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


