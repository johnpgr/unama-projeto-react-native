import React from "react"
import {
    Image,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { Link, Stack, useRouter } from "expo-router"
import { Controller, useForm } from "react-hook-form"

import { Api } from "~/utils/api"

interface RegisterForm {
    name: string
    email: string
    password: string
}

export default function RegisterScreen() {
    const router = useRouter()
    const [isAgreed, setIsAgreed] = React.useState(false)
    const form = useForm<RegisterForm>({
        defaultValues: { email: "", name: "", password: "" },
    })
    const signup = Api.auth.signUp.useMutation()

    async function onSubmit(data: RegisterForm) {
        if (!isAgreed) {
            return
        }

        const res = await signup.mutateAsync(data)
        //TODO: Display errors
        if (!res.success) {
            return
        }

        router.navigate("/login")
    }

    return (
        <>
            <Stack.Screen options={{ title: "Tela de registro" }} />
            <View className="flex-1 flex bg-green-900">
                <View className="h-[30%] bg-green-900" />

                <View className="flex-1 rounded-t-[3rem] bg-white p-8">
                    <Text className="text-center text-4xl font-bold text-green-900">
                        Get started
                    </Text>

                    <Text className="m-1 mt-2 text-lg">Full Name:</Text>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-green-900 px-4 py-2"
                                placeholder="Enter Full Name"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

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

                    <View className="flex flex-row items-center py-4">
                        <Switch
                            value={isAgreed}
                            onValueChange={(value) => setIsAgreed(value)}
                            thumbColor={isAgreed ? "#fff" : "#fff"}
                            trackColor={{ false: "#767577", true: "#004400" }}
                        />
                        <Text>I agree to the processing of Personal data</Text>
                    </View>

                    <TouchableOpacity
                        className="flex items-center rounded-xl bg-green-900 py-4"
                        onPress={form.handleSubmit(onSubmit)}
                    >
                        <Text className="text-xl font-bold text-white">
                            Sign up
                        </Text>
                    </TouchableOpacity>

                    <View className="mt-4 flex flex-col items-center">
                        <Text>Sign up with:</Text>
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

                    <View className="flex flex-row justify-center items-center gap-2 pt-4">
                        <Text>Already have an account?</Text>
                        <Link href="/login" className="text-green-900 font-medium">
                            Sign in
                        </Link>
                    </View>
                </View>
            </View>
        </>
    )
}
