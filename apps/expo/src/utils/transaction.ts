import { api } from "./api"

export function useGetUserPoints() {
    return api.transaction.getUserPoints.useQuery()
}

export interface sendPointParams {
    receiverId: string
    amountPoints: number
}

export function useSendPointsP2P() {
    const { mutateAsync, error, data, isPending } =
        api.transaction.sendPointsP2P.useMutation()
    async function sendPoints(params: sendPointParams) {
        try {
            const res = await mutateAsync(params)
            console.log("Payload a ser enviado:" + { params })
            return res
        } catch (error) {
            console.error("Erro ao enviar pontos:", error)
            console.log(error)
            throw error
        }
    }
    return { sendPoints, error, data, isPending }
}
//async function getPoints(params: getUserPointsparams) {
//    const {data, status } = api.user.getUserPoints.useQuery()
//    return { data: data ?? null, status }
//}
