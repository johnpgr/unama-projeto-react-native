import React from "react"
import { Animated, Dimensions, StyleSheet, View } from "react-native"

const { width, height } = Dimensions.get("window")
const OVERLAY_RATIO = 0.7
const VERTICAL_OFFSET = height * 0.1

export function QRCodeOverlay() {
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
    top: height / 2 - (width * OVERLAY_RATIO) / 2 - VERTICAL_OFFSET,
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
    top: height / 2 - (width * OVERLAY_RATIO) / 2 - VERTICAL_OFFSET,
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
    bottom: height / 2 - (width * OVERLAY_RATIO) / 2 + VERTICAL_OFFSET,
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
    bottom: height / 2 - (width * OVERLAY_RATIO) / 2 + VERTICAL_OFFSET,
    right: width / 2 - (width * OVERLAY_RATIO) / 2,
    width: 40,
    height: 40,
    borderBottomRightRadius: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "white",
  },
})
