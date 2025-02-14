import { http, hexToBigInt, Client, Hex } from "viem";
import { createBundlerClient, BundlerClient, SmartAccount } from "viem/account-abstraction";
import { GasPriceRequest, GasPriceResult, PaymasterData } from "./types";
import { CHAIN, SHBUNDLER_URL } from "./constants";
import { smartAccount, publicClient } from "./user"; 

type ShBundler = BundlerClient & {
    getUserOperationGasPrice: () => Promise<GasPriceResult>;
};

function createShBundler(client: BundlerClient): ShBundler {
  return {
    ...client,
    getUserOperationGasPrice: () => fetchUserOperationGasPrice(client),
  };
}

function initShBundler(
    smartAccount: SmartAccount,
    publicClient: Client
): ShBundler {
    return createShBundler(
        createBundlerClient({
            transport: http(SHBUNDLER_URL),
            name: "shBundler",
            account: smartAccount,
            client: publicClient,
            chain: CHAIN,
        })
    );
}

export function paymasterMode(
    paymasterData: PaymasterData
  ) {
    if (paymasterData.mode === "user") {
      return "0x00" as Hex;
    } else {
      if (paymasterData.userClient === undefined) {
        throw new Error("userClient is undefined");
      }
      if (paymasterData.validUntil === undefined) {
        throw new Error("validUntil is undefined");
      }
      if (paymasterData.validAfter === undefined) {
        throw new Error("validAfter is undefined");
      }
      if (paymasterData.sponsorSignature === undefined) {
        throw new Error("sponsorSignature is undefined");
      }
  
      const accountAddress = paymasterData.userClient.account?.address;
      if (!accountAddress) {
        throw new Error("userClient.account is undefined");
      }
      return `0x01${accountAddress.slice(2)}${paymasterData.validUntil
        .toString(16)
        .padStart(12, "0")}${paymasterData.validAfter
        .toString(16)
        .padStart(12, "0")}${paymasterData.sponsorSignature.slice(2)}`;
    }
}

// Extracted helper function
async function fetchUserOperationGasPrice(
    client: BundlerClient
  ): Promise<GasPriceResult> {
    const resultEncoded = await client.request<GasPriceRequest>({
      method: "gas_getUserOperationGasPrice",
      params: [],
    });
  
    return {
      slow: {
        maxFeePerGas: hexToBigInt(resultEncoded.slow.maxFeePerGas),
        maxPriorityFeePerGas: hexToBigInt(resultEncoded.slow.maxPriorityFeePerGas),
      },
      standard: {
        maxFeePerGas: hexToBigInt(resultEncoded.standard.maxFeePerGas),
        maxPriorityFeePerGas: hexToBigInt(resultEncoded.standard.maxPriorityFeePerGas),
      },
      fast: {
        maxFeePerGas: hexToBigInt(resultEncoded.fast.maxFeePerGas),
        maxPriorityFeePerGas: hexToBigInt(resultEncoded.fast.maxPriorityFeePerGas),
      },
    };
  }
  
export const shBundler = initShBundler(smartAccount, publicClient);