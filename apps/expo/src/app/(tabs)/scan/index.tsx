import { useAtom } from "jotai"

import { CurrentScanView, ScanScreenView } from "./CurrentScanView"

export default function ScanScreen() {
  const [currentView] = useAtom(CurrentScanView)

  return ScanScreenView[currentView]
}
