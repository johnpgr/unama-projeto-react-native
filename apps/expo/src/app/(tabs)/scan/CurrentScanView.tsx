import { atom } from "jotai"

import { MyCode } from "./MyCode"
import { Scan } from "./Scan"

export type ScanScreenView = keyof typeof ScanScreenView
export const ScanScreenView = {
  SCAN: <Scan />,
  MY_CODE: <MyCode />,
} as const
export const CurrentScanView = atom<ScanScreenView>("SCAN")
