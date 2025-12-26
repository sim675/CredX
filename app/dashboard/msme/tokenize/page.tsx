"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TokenizeInvoice() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Invoice Submitted",
        description: "Your invoice has been sent for verification and tokenization.",
      })
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tokenize New Invoice</h1>
        <p className="text-muted-foreground">Convert your unpaid receivables into instant liquidity.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
              <CardDescription>Enter information exactly as it appears on the invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-id">Invoice ID / Number</Label>
                  <Input id="invoice-id" placeholder="INV-2025-001" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Invoice Amount (USD)</Label>
                  <Input id="amount" type="number" placeholder="5000" required className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer">Buyer Name / Entity</Label>
                <Input id="buyer" placeholder="Acme Corporation" required className="bg-background/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="date" required className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst-id">Buyer Business ID (GST/VAT)</Label>
                  <Input id="gst-id" placeholder="ID-987654321" required className="bg-background/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Document Upload</CardTitle>
              <CardDescription>Upload a digital copy of the invoice for verification.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-accent/5">
                <Upload className="size-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Click or drag to upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG or PNG (max. 10MB)</p>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex gap-4">
            <Info className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              By submitting this invoice, you agree to tokenization and that the invoice will be listed on the public
              marketplace upon verification. A small protocol fee of 1.5% applies upon funding.
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? "Processing..." : "Tokenize Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
