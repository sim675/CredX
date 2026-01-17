import { useCallback } from "react";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { STAKING_REWARDS_ADDRESS } from "./addresses";

const STAKING_REWARDS_ABI = [
  "function stakingToken() view returns (address)",
  "function totalStaked() view returns (uint256)",
  "function stakedBalance(address account) view returns (uint256)",
  "function rewardPerTokenStored() view returns (uint256)",
  "function userRewardPerTokenPaid(address account) view returns (uint256)",
  "function pendingRewards(address account) view returns (uint256)",
  "function rewardPerToken() view returns (uint256)",
  "function earned(address account) view returns (uint256)",
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function getReward()",
  "function exit()",
  "function notifyRewardAmount() payable",
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)",
  "event RewardsAdded(uint256 amount)"
];

export function useStakingRewards() {
  const { data: walletClient } = useWalletClient();

  const getProvider = useCallback(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org";
    return new ethers.JsonRpcProvider(rpcUrl);
  }, []);

  const getContract = useCallback(
    (provider?: ethers.Provider | ethers.Signer) => {
      const contractProvider = provider || getProvider();
      return new ethers.Contract(
        STAKING_REWARDS_ADDRESS,
        STAKING_REWARDS_ABI,
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

