// lib/contracts/useInvoiceContract.ts
import { useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import InvoiceMarketplaceABI from "./InvoiceMarketplace.json";
import { INVOICE_MARKETPLACE_ADDRESS } from "./addresses";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || INVOICE_MARKETPLACE_ADDRESS;

export function useInvoiceContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const getProvider = useCallback(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.drpc.org";
    return new ethers.JsonRpcProvider(rpcUrl);
  }, []);

  const getContract = useCallback(
    (provider?: ethers.Provider | ethers.Signer) => {
      const contractProvider = provider || getProvider();
      return new ethers.Contract(
        CONTRACT_ADDRESS,
        InvoiceMarketplaceABI.abi,
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
    contractAddress: CONTRACT_ADDRESS,
  };
}
