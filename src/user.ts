// Import the required functions
import {
  getModule,
  getAccount,
  installModule,
  isModuleInstalled,
} from "@rhinestone/module-sdk";
import { baseSepolia } from "viem/chains";
import {
  createClient,
  createPublicClient,
  createWalletClient,
  formatTransactionRequest,
  getContract,
  Hex,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { entryPoint07Address } from "viem/account-abstraction";
import { createSmartAccountClient } from "permissionless";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import demoErc20Abi from "./abi/demoErc20.json";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const RPC_URL = process.env.RPC_URL;
const PIMLICO_URL = process.env.PIMLICO_URL;
const PRIVATE_KEY = process.env.SMART_WALLET_PK as Hex;
const EOA_PK = process.env.USER_PK as Hex;
const ATLAS_EXECUTOR = process.env.ATLAS_EXECUTOR as Hex;
export const atlasExecutorAddress = process.env.ATLAS_EXECUTOR as Hex;

const owner = privateKeyToAccount(PRIVATE_KEY);
const eoa = privateKeyToAccount(EOA_PK);

export const eoaClient = createWalletClient({
  transport: http(process.env.RPC_URL),
  account: eoa,
});

export const publicClient = createPublicClient({
  transport: http(RPC_URL),
});

function getErc20Contract(address: Hex) {
  return getContract({
    address: address,
    abi: demoErc20Abi,
    client: {
      public: publicClient,
      account: eoaClient.account,
    },
  });
}

export const demoErc20UserIsSelling = getErc20Contract(
  process.env.USER_SELL_TOKEN_ADDRESS as Hex
);

export const demoErc20UserIsBuying = getErc20Contract(
  process.env.USER_BUY_TOKEN_ADDRESS as Hex
);

const client = createPublicClient({
  transport: http(RPC_URL),
});

// // paymaster
// export const paymasterClient = createPimlicoClient({
//   transport: http(PIMLICO_URL),
//   entryPoint: {
//     address: entryPoint07Address,
//     version: "0.7",
//   },
// });

// // smart wallet
// const kernelAccount = await toKernelSmartAccount({
//   client: publicClient,
//   entryPoint: {
//     address: entryPoint07Address,
//     version: "0.7",
//   },
//   owners: [owner],
// });

// // Create the required clients.
// export const bundlerClient = createSmartAccountClient({
//   account: kernelAccount,
//   chain: baseSepolia,
//   paymaster: paymasterClient,
//   bundlerTransport: http(PIMLICO_URL), // Use any bundler url
//   userOperation: {
//     estimateFeesPerGas: async () =>
//       (await paymasterClient.getUserOperationGasPrice()).fast,
//   },
// });

// // Get the module object if you are using a custom module
// const module = getModule({
//   module: ATLAS_EXECUTOR,
//   type: "executor",
// });

// // Get the account object
// const account = getAccount({
//   address: kernelAccount.address,
//   type: "kernel",
// });

// // Get the executions required to install the module
// const executions = await installModule({
//   client,
//   account,
//   module,
// });

// const _isModuleInstalled = await isModuleInstalled({
//   client,
//   account,
//   module,
// });

// // init the wallet and install the module
// if (!_isModuleInstalled) {
//   const txHash = await bundlerClient.sendTransaction(executions[0]);
//   console.log("Installing module: ", txHash);
// }
