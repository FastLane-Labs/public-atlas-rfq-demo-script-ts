import { ethers } from "ethers";
import { AtlasSdk, FastlaneBackend } from "@fastlane-labs/atlas-sdk";
import { CHAIN } from "./constants";

export const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL,
  CHAIN.id
);

export const atlasSdk = await AtlasSdk.create(
  provider,
  CHAIN.id,
  new FastlaneBackend({
    endpoint: process.env.AUCTIONEER_ENDPOINT as string,
  })
);
