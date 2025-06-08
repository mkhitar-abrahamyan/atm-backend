export interface Transaction {
  id: number
  type: "deposit" | "withdraw" | "transfer_in" | "transfer_out"
  amount: number
  target_user_id: number | null
  created_at: Date
}
