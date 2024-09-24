import { Image, Pressable, Text, View } from "react-native"

export function SigninOAuthButtons() {
    return (
        <View className="mt-4 flex flex-col items-center">
            <Text>Entre com:</Text>
            <View className="flex flex-row gap-2 py-4">
                <Pressable>
                    <Image
                        source={require("../../assets/logo_google.png")}
                        className="h-8 w-8"
                    />
                </Pressable>
                <Pressable>
                    <Image
                        source={require("../../assets/logo_facebook.png")}
                        className="h-8 w-8"
                    />
                </Pressable>
                <Pressable>
                    <Image
                        source={require("../../assets/logo_apple.png")}
                        className="h-8 w-8"
                    />
                </Pressable>
            </View>
        </View>
    )
}
