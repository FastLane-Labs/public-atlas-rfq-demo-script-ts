import { publicClient, smartAccount } from "./user";
import { Hex, getContract } from "viem";
import { addressHubAbi, wethAbi, demoErc20Abi, pairAbi, swapRouterAbi } from "./abi/abi";
import * as constants from "./constants";

const addressHub = getContract({
    address: constants.ADDRESS_HUB,
    abi: addressHubAbi,
    client: {
      public: publicClient,
      account: smartAccount,
    },
  });


const weth = getContract({
    address: constants.WETH_ADDRESS,
    abi: wethAbi,
    client: {
      public: publicClient,
      account: smartAccount,
    },
  });
  
const demoErc20UserIsSelling = getContract({
    address: process.env.USER_SELL_TOKEN_ADDRESS as Hex,
    abi: demoErc20Abi,
    client: {
        public: publicClient,
        account: smartAccount,
    },
});

const demoErc20UserIsBuying = getContract({
    address: process.env.USER_BUY_TOKEN_ADDRESS as Hex,
    abi: demoErc20Abi,
    client: {
        public: publicClient,
        account: smartAccount,
    },
});

const pairContract = getContract({
  address: constants.PAIR_ADDRESS as Hex,
  abi: pairAbi,
  client: publicClient,
});

const swapRouterContract = getContract({
  address: constants.ROUTER_ADDRESS as Hex,
  abi: swapRouterAbi,
  client: publicClient,
});


export { addressHub, weth, demoErc20UserIsSelling, demoErc20UserIsBuying, pairContract, swapRouterContract };
