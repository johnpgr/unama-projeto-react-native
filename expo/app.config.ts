import type { ConfigContext, ExpoConfig } from "@expo/config"

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "expo",
  slug: "expo",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#02391E",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.anonymous.ecopoints",
    supportsTablet: true,
  },
  android: {
    package: "com.anonymous.ecopoints",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#02391E",
    },
  },
  // extra: {
  //   eas: {
  //     projectId: "your-eas-project-id",
  //   },
  // },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-secure-store",
    "expo-router",
    [
      "expo-camera",
      {
        cameraPermission: "Permitir que ECOPoints acesse a sua camera",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Permitir que $(PRODUCT_NAME) use sua localização.",
      },
    ],
  ],
})
