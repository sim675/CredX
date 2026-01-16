import { useCallback } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import InvoiceNFTABI from "./InvoiceNFT.json";
import { INVOICE_NFT_ADDRESS } from "./addresses";

export function useInvoiceNFT() {
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
        INVOICE_NFT_ADDRESS,
        InvoiceNFTABI.abi,
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
    contractAddress: INVOICE_NFT_ADDRESS,
  };
}
