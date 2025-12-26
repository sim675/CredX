export type InvoiceStatus = "Created" | "Funded" | "Active" | "Late" | "Settled"

export interface Invoice {
  id: string
  msme: string
  buyer: string
  value: number
  fundedAmount?: number
  dueDate: string
  status: InvoiceStatus
}

export interface User {
  id: string
  name: string
  email: string
  role: "msme" | "investor" | "bigbuyer"
}
