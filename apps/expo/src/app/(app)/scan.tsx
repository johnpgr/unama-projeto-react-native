import React from "react"
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native"
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera"
import { Link, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")
const OVERLAY_RATIO = 0.7

const QRCodeOverlay = () => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        const breatheAnimation = Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ])

        Animated.loop(breatheAnimation).start()

        return () => {
            scaleAnim.stopAnimation()
        }
    }, [scaleAnim])

    const animatedStyle = {
        transform: [{ scale: scaleAnim }],
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.cornerTopLeft, animatedStyle]} />
            <Animated.View style={[styles.cornerTopRight, animatedStyle]} />
            <Animated.View style={[styles.cornerBottomLeft, animatedStyle]} />
            <Animated.View style={[styles.cornerBottomRight, animatedStyle]} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height,
        alignItems: "center",
        justifyContent: "center",
    },
    cornerTopLeft: {
        position: "absolute",
        top: height / 2 - (width * OVERLAY_RATIO) / 2,
        left: width / 2 - (width * OVERLAY_RATIO) / 2,
        width: 40,
        height: 40,
        borderTopLeftRadius: 16,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: "white",
    },
    cornerTopRight: {
        position: "absolute",
        top: height / 2 - (width * OVERLAY_RATIO) / 2,
        right: width / 2 - (width * OVERLAY_RATIO) / 2,
        width: 40,
        height: 40,
        borderTopRightRadius: 16,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: "white",
    },
    cornerBottomLeft: {
        position: "absolute",
        bottom: height / 2 - (width * OVERLAY_RATIO) / 2,
        left: width / 2 - (width * OVERLAY_RATIO) / 2,
        width: 40,
        height: 40,
        borderBottomLeftRadius: 16,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: "white",
    },
    cornerBottomRight: {
        position: "absolute",
        bottom: height / 2 - (width * OVERLAY_RATIO) / 2,
        right: width / 2 - (width * OVERLAY_RATIO) / 2,
        width: 40,
        height: 40,
        borderBottomRightRadius: 16,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: "white",
    },
})
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
            <Link asChild href={"/my-code"}>
                <Pressable
                    className="absolute bottom-8 right-1/2 translate-x-1/2 rounded-full bg-black/30 p-6 px-10"
                >
                    <Text className="text-white font-bold">
                        Mostrar código
                    </Text>
                </Pressable>
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
