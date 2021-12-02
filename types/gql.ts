export interface UserDeposit {
  id: string
  tokenContract: string
  sender: string
  destination: string
  amount: string
  timestamp: number
  blockHeight: number
}

export interface UserDepositResponse {
  deposits: UserDeposit[]
}
