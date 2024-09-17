import React from "react"
import { Text, View } from "react-native"
import { Stack } from "expo-router"

export default function LoginScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Tela de login" }} />
            <View>
                <Text>Login screen</Text>
            </View>
        </>
    )
}
