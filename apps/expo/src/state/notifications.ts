import { atom } from "jotai"

export interface Notification {
  id: number
  points: number
  transactionDate: string | null
  from: string
  to: string
}

export const notificationsAtom = atom<Notification[]>([])
