import { usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import GovernanceTokenABI from "./GovernanceToken.json";
import { useStakingRewards } from "./useStakingRewards";
import { useCallback, useEffect, useState } from "react";

export function useGovernanceToken() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { getReadContract: getStakingContract } = useStakingRewards();
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);

  // Get token address from StakingRewards contract
  useEffect(() => {
    const fetchTokenAddress = async () => {
      try {
        const stakingContract = getStakingContract();
        const address = await stakingContract.stakingToken();
        setTokenAddress(address);
      } catch (error) {
        console.error("Failed to fetch token address:", error);
      }
    };
    fetchTokenAddress();
  }, [getStakingContract]);

  const getProvider = useCallback(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology";
    return new ethers.JsonRpcProvider(rpcUrl);
  }, []);

  const getContract = useCallback(
    (provider?: ethers.Provider | ethers.Signer) => {
      if (!tokenAddress) {
        throw new Error("Token address not loaded");
      }
      const contractProvider = provider || getProvider();
      return new ethers.Contract(
        tokenAddress,
        GovernanceTokenABI.abi,
        contractProvider
      );
    },
    [getProvider, tokenAddress]
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
    tokenAddress,
  };
}

