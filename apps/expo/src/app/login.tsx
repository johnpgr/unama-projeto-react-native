import React from "react"
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Checkbox from "expo-checkbox"
import { Link, Stack, useRouter } from "expo-router"
import { Controller, useForm } from "react-hook-form"

import { Api } from "~/utils/api"
import { setToken } from "~/utils/session-store"

interface LoginForm {
    email: string
    password: string
}

export default function LoginScreen() {
    const router = useRouter()
    const [remember, setRemember] = React.useState(false)
    const form = useForm<LoginForm>({
        defaultValues: { email: "", password: "" },
    })
    const utils = Api.useUtils()
    const signIn = Api.auth.signIn.useMutation()

    async function onSubmit(data: LoginForm) {
        const res = await signIn.mutateAsync(data)
        //TODO: Display errors
        if (!res.success) {
            return
        }
        console.log("res:",res)
        //setToken(res.data.token)

        router.navigate("/")
    }

    return (
        <>
            <Stack.Screen options={{ headerShown:false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex flex-1 bg-green-900">
                <View className="h-[30%] bg-green-900" />

                <KeyboardAvoidingView className="flex-1 rounded-t-[3rem] bg-white p-8">
                    <Text className="text-center text-4xl font-bold text-green-900">
                        Welcome back
                    </Text>

                    <Text className="m-1 mt-2 text-lg">Email:</Text>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-green-900 px-4 py-2"
                                placeholder="Enter Email"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    <Text className="m-1 mt-2 text-lg">Password:</Text>
                    <Controller
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <TextInput
                                secureTextEntry
                                className="rounded-xl border border-green-900 px-4 py-2"
                                placeholder="Enter Password"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    <View className="flex flex-row justify-between w-full items-center py-4">
                        <View className="flex flex-row gap-2">
                            <Checkbox
                                value={remember}
                                onValueChange={(value) => setRemember(value)}
                                color="#14542E"
                            />
                            <Text>Remember me?</Text>
                        </View>
                        <Text className="font-medium text-green-900">Forgot password?</Text>
                    </View>

                    <TouchableOpacity
                        className="flex items-center rounded-xl bg-green-900 py-4"
                        onPress={form.handleSubmit(onSubmit)}
                    >
                        <Text className="text-xl font-bold text-white">
                            Sign in
                        </Text>
                    </TouchableOpacity>

                    <View className="mt-4 flex flex-col items-center">
                        <Text>Sign in with:</Text>
                        <View className="flex flex-row gap-2">
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
                                }}
                            />
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_X_%28formerly_Twitter%29.svg",
                                }}
                            />
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                                }}
                            />
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                                }}
                            />
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-center gap-2 pt-4">
                        <Text>Don't have an account?</Text>
                        <Link
                            href="/registro"
                            className="font-medium text-green-900"
                        >
                            Sign in
                        </Link>
                    </View>
                </KeyboardAvoidingView>
            </KeyboardAvoidingView>
        </>
    )
}
