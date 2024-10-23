import { atom } from "jotai"

export const enum TransactionType {
  P2REWARD = "p2reward",
  P2P = "p2p",
}
export interface Notification {
  id: string
  points: number
  transactionDate: string | null
  from?: string
  to?: string
  type?: TransactionType
}

export const notificationsAtom = atom<Notification[]>([])
