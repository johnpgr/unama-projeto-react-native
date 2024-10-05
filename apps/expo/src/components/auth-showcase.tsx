import { Pressable, Text } from "react-native"

import { useSession, useSignOut } from "~/utils/auth"

export function AuthShowcase() {
  const { data } = useSession()
  const { signOut } = useSignOut()

  return (
    <>
      <Text className="pb-2 text-center text-xl font-semibold text-white">
        {data?.user?.fullName ?? "Not logged in"}
      </Text>
      {data?.user ? (
        <Pressable onPress={() => signOut()}>
          <Text className="font-medium text-white">Sign out</Text>
        </Pressable>
      ) : null}
    </>
  )
}
