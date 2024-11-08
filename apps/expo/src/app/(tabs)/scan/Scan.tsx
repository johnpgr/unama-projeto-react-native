import type { BarcodeScanningResult } from "expo-camera"
import React from "react"
import { Pressable, Text, View } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Tabs, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { useAtom } from "jotai"

import { CurrentScanView } from "./CurrentScanView"
import { QRCodeOverlay } from "./QRCodeOverlay"

export function Scan() {
  const router = useRouter()
  const [_, setCurrentView] = useAtom(CurrentScanView)
  const [permission, requestPermission] = useCameraPermissions()
  const [torchEnabled, setTorchEnabled] = React.useState(false)

  function onBarCodeScannedHandler(res: BarcodeScanningResult) {
    console.log("Scanned:", res.data)
  }

  React.useEffect(() => {
    void requestPermission()
  }, [requestPermission])

  if (!permission) return null

  return (
    <View className="relative flex-1">
      <Tabs.Screen options={{ headerShown: false }} />
      <CameraView
        enableTorch={torchEnabled}
        onBarcodeScanned={onBarCodeScannedHandler}
        style={{ flex: 1 }}
        facing={"back"}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <QRCodeOverlay />
      <Pressable
        onPress={() => setCurrentView("MY_CODE")}
        className="absolute bottom-8 right-1/2 translate-x-1/2 rounded-full bg-black/30 p-6 px-10"
      >
        <Text className="font-bold text-white">Mostrar código</Text>
      </Pressable>
      <Pressable
        onPress={() => router.back()}
        className="absolute bottom-8 right-8 rounded-full bg-black/30 p-4"
      >
        <MaterialIcons name="close" size={32} color={"white"} />
      </Pressable>
      <Pressable
        onPress={() => setTorchEnabled(!torchEnabled)}
        className="absolute bottom-8 left-8 rounded-full bg-black/30 p-4"
      >
        <MaterialIcons
          name={torchEnabled ? "flash-on" : "flash-off"}
          size={32}
          color={"white"}
        />
      </Pressable>
    </View>
  )
}
