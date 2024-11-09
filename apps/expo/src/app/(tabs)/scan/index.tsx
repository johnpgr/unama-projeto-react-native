import type { BarcodeScanningResult } from "expo-camera"
import React from "react"
import { Pressable, Text, View } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Link, Tabs, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

import { QRCodeOverlay } from "./_components/QRCodeOverlay"

export default function ScanScreen() {
  const router = useRouter()
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
      <Link
        href="/scan/my-code"
        className="absolute bottom-8 right-1/2 translate-x-1/2 rounded-full bg-black/30 p-6 px-10"
      >
        <Text className="font-bold text-white">Mostrar código</Text>
      </Link>
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
