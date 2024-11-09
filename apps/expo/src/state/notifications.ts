import { atom } from "jotai"

export const enum TransactionType {
  P2REWARD = "p2reward",
  P2P = "p2p",
}

export interface UserRewardNotification {
  type: TransactionType.P2REWARD
  id: string
  points: number
  transactionDate: Date
}

export interface P2PNotification {
  type: TransactionType.P2P
  id: string
  points: number
  transactionDate: Date
  from: string
  to: string
}

export type Notification = UserRewardNotification | P2PNotification

export const notificationsAtom = atom<Notification[]>([])
