import { useCallback } from "react";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { UTILITY_STAKER_ADDRESS } from "./addresses";

const UTILITY_STAKER_ABI = [
  "function utilityToken() view returns (address)",
  "function cgov() view returns (address)",
  "function admin() view returns (address)",
  "function rewardRate() view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function rewardPerTokenStored() view returns (uint256)",
  "function lastUpdateTime() view returns (uint256)",
  "function stakedBalance(address account) view returns (uint256)",
  "function userRewardPerTokenPaid(address account) view returns (uint256)",
  "function pendingRewards(address account) view returns (uint256)",
  "function rewardPerToken() view returns (uint256)",
  "function earned(address account) view returns (uint256)",
  "function stake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function claimRewards()",
  "function exit()",
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
];

export function useUtilityStaker() {
  const { data: walletClient } = useWalletClient();

  const getProvider = useCallback(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org";
    return new ethers.JsonRpcProvider(rpcUrl);
  }, []);

  const getContract = useCallback(
    (provider?: ethers.Provider | ethers.Signer) => {
      const contractProvider = provider || getProvider();
      return new ethers.Contract(
        UTILITY_STAKER_ADDRESS,
        UTILITY_STAKER_ABI,
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
    contractAddress: UTILITY_STAKER_ADDRESS,
  };
}
