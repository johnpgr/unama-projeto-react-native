import React from "react"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Loading, Onboarding } from "~/components/onboarding"
import { useSession } from "~/utils/auth"

export function Home() {
    return (
        <SafeAreaView>
            <View>
                <Text>Hello, World</Text>
            </View>
        </SafeAreaView>
    )
}

export function HomeLayout(props: { children: React.ReactNode }) {
    return <View>{props.children}</View>
}

export default function Index() {
    const { data: session, status } = useSession()
    if (status === "pending") return <Loading />
    if (!session) return <Onboarding />

    return (
        <HomeLayout>
            <Home />
        </HomeLayout>
    )
}
