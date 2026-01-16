import { useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import StakingRewardsABI from "./StakingRewards.json";
import { STAKING_REWARDS_ADDRESS } from "./addresses";

export function useStakingRewards() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const getProvider = useCallback(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology";
    return new ethers.JsonRpcProvider(rpcUrl);
  }, []);

  const getContract = useCallback(
    (provider?: ethers.Provider | ethers.Signer) => {
      const contractProvider = provider || getProvider();
      return new ethers.Contract(
        STAKING_REWARDS_ADDRESS,
        StakingRewardsABI.abi,
        contractProvider
      );
    },
    [getProvider]
  );

  const getReadContract = useCallback(() => {
    return getContract(getProvider());
  }, [getContract, getProvider]);

  const getWriteContract = useCallback(async () => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return getContract(signer);
  }, [walletClient, getContract]);

  return {
    getReadContract,
    getWriteContract,
    getProvider,
    contractAddress: STAKING_REWARDS_ADDRESS,
  };
}

