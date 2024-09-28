import { Text, View } from "react-native"
import { GithubSignInButton } from "./signin-github"
import { GoogleSignInButton } from "./signin-google"

export function SigninOAuthButtons() {
    return (
        <View className="mt-4 flex flex-col items-center">
            <Text>Entre com:</Text>
            <View className="flex flex-row gap-2 py-4">
                <GoogleSignInButton/>
                <GithubSignInButton/>
            </View>
        </View>
    )
}
