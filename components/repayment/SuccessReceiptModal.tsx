"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink, ArrowRight, Coins, Users, Vault } from "lucide-react"

export interface RepaymentReceiptData {
  invoiceId: number
  txHash: string
  totalAmountPaid: string // in MATIC
  principalAmount: string // in MATIC  
  interestAmount: string // in MATIC
  amountToInvestors: string // 95% in MATIC (held in Marketplace for investor claims)
  protocolFee: string // 5% in MATIC
  msmeAddress: string
  explorerBaseUrl: string
}

interface SuccessReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receiptData: RepaymentReceiptData | null
}

export function SuccessReceiptModal({ isOpen, onClose, receiptData }: SuccessReceiptModalProps) {
  if (!receiptData) return null

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-[#0a0a0a] border border-white/10 text-white">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-4 rounded-full bg-green-500/10 w-fit">
            <CheckCircle2 className="size-10 text-green-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">Payment Successful!</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Invoice #{receiptData.invoiceId} has been repaid
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total Amount */}
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Total Amount Paid</p>
            <p className="text-3xl font-bold text-white">{parseFloat(receiptData.totalAmountPaid).toFixed(4)} <span className="text-orange-400">MATIC</span></p>
          </div>

          {/* Principal & Interest */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="size-4 text-blue-400" />
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Principal</p>
              </div>
              <p className="text-lg font-semibold text-white">{parseFloat(receiptData.principalAmount).toFixed(4)} MATIC</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight className="size-4 text-green-400" />
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">Interest</p>
              </div>
              <p className="text-lg font-semibold text-green-400">+{parseFloat(receiptData.interestAmount).toFixed(4)} MATIC</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Payment Breakdown</p>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="size-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">To Investor Pool (95%)</p>
                  <p className="text-xs text-neutral-500">Claimable via Marketplace</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">{parseFloat(receiptData.amountToInvestors).toFixed(4)} MATIC</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Vault className="size-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Protocol Fee (5%)</p>
                  <p className="text-xs text-neutral-500">To CGOV Staking Vault</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-orange-400">{parseFloat(receiptData.protocolFee).toFixed(4)} MATIC</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full border-white/10 text-white hover:bg-white/5"
            asChild
          >
            <a 
              href={`${receiptData.explorerBaseUrl}/tx/${receiptData.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              View Transaction
              <ExternalLink className="size-4" />
            </a>
          </Button>
          
          <Button
            onClick={onClose}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
