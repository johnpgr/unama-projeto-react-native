/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-namespace */
import type { DrawerNavigationProp } from "@react-navigation/drawer"
import type { ParamListBase } from "@react-navigation/native"
import { Image, Platform, StyleSheet } from "react-native"
import { PlatformPressable } from "@react-navigation/elements"
import { DrawerActions, useNavigation } from "@react-navigation/native"

import { useAuth } from "~/hooks/auth"
import DefaultAvatar from "../../../assets/avatar_default.png"

export function DrawerToggleButton({
  tintColor,
  accessibilityLabel = "Mostrar menu de navegação",
  ...rest
}: DrawerToggleButton.Props) {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>()
  const { user } = useAuth()

  return (
    <PlatformPressable
      {...rest}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ borderless: true }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.touchable}
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
    >
      <Image
        style={[styles.icon, tintColor ? { tintColor } : null]}
        resizeMode="contain"
        source={user?.imageUrl ? { uri: user.imageUrl } : DefaultAvatar}
        fadeDuration={0}
      />
    </PlatformPressable>
  )
}

export namespace DrawerToggleButton {
  export interface Props {
    accessibilityLabel?: string
    pressColor?: string
    pressOpacity?: number
    tintColor?: string
  }
}

const styles = StyleSheet.create({
  icon: {
    height: 32,
    width: 32,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  touchable: {
    // Roundness for iPad hover effect
    borderRadius: 10,
  },
})
