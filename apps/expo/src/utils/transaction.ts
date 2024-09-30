import { api } from "./api"

export function useGetUserPoints() {
    return api.transaction.getUserPoints.useQuery()
}

export interface sendPointParams {
    receiverId: string
    amountPoints: number
}
//async function getPoints(params: getUserPointsparams) {
//    const {data, status } = api.user.getUserPoints.useQuery()
//    return { data: data ?? null, status }
//}

export function useSendPointsP2P() {
    const { mutateAsync, error, data, status } =
        api.transaction.sendPointsP2P.useMutation()
    async function sendPoints(params: sendPointParams) {
        try {
            console.log("Payload a ser enviado:", JSON.stringify(params));
            const res = await mutateAsync(params)
            return res
        } catch (error) {
            console.error("Erro ao enviar pontos:", error) 
            console.log(error)
            throw error
        }
    }
    return { sendPoints, error, data, status }
}
