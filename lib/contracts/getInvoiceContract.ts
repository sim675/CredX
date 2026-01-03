import { ethers } from "ethers";
import InvoiceMarketplace from "@/lib/contracts/InvoiceMarketplace.json";
import { INVOICE_MARKETPLACE_ADDRESS } from "@/lib/contracts/addresses";

export function getInvoiceContract(providerOrSigner: any) {
  return new ethers.Contract(
    INVOICE_MARKETPLACE_ADDRESS,
    InvoiceMarketplace.abi,
    providerOrSigner
  );
}
