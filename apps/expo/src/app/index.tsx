import { useSession } from "~/utils/auth"
import { Home } from "./(index)/home"
import { Loading, Onboarding } from "./(index)/onboarding"

export default function Index() {
    const { data: session, status } = useSession()
    if (status === "pending") return <Loading />
    if (!session) return <Onboarding />

    return <Home />
}
