import { TRPCClientError } from "@trpc/client"

import { api } from "./api"

export function useGetUserInformations() {
  return api.transaction.getUserInformations.useQuery()
}
export function getUserTransactions() {
  return api.transaction.getUserTransactions.useQuery()
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
      console.log("Resposta recebida:", res)
      return res
    } catch (error) {
      console.error("Erro ao enviar pontos:", error)
      if (error instanceof TRPCClientError) {
        console.error("Erro específico de TRPC:", error.message)
      }
      throw error
    }
  }
  return { sendPoints, error, data, isPending }
}
//async function getPoints(params: getUserPointsparams) {
//    const {data, status } = api.user.getUserPoints.useQuery()
//    return { data: data ?? null, status }
//}

interface MessageContentComplex {
  type: string
  text: string
}

export function useGetResponseLLM() {
  const { mutateAsync, error, data, isPending } =
    api.transaction.getLLMResponse.useMutation()

  async function getResponse(prompt: string) {
    try {
      const res = await mutateAsync({ prompt })
      console.log("Resposta recebida:", res)

      // Acessando o conteúdo da resposta corretamente
      if (res && typeof res.response === "string") {
        return res.response // Retorna a resposta diretamente
      } else {
        return null // Retorna null se a resposta não for uma string
      }
    } catch (err) {
      console.error("Erro ao receber mensagem da LLM:", err)
      if (err instanceof TRPCClientError) {
        console.error("Erro específico de TRPC:", err.message)
      }
      throw err // Lança o erro para que o chamador possa lidar com isso
    }
  }

  return { getResponse, error, data, isPending }
}
