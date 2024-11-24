import { env } from "process"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatMistralAI } from "@langchain/mistralai"
import { TRPCError } from "@trpc/server"

import { protectedProcedure } from "../../trpc/index.ts"
import { getUserExtract } from "../user/user.queries.ts"

const transactionsRegressionLookupPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Você é um engenheiro de machine learning especializado em modelos de previsão financeira. Usando técnicas avançadas de regressão e análise de sequências temporais, faça uma previsão curta e objetiva sobre a quantidade de pontos que o usuário pode ganhar ou perder no próximo mês com base nas transações {transactions} do usuário com id {userId}",
  ],
  [
    "system",
    "Tipos de transações: p2pFrom, p2pTo, recycling, reward, cada transação p2p possui propriedades 'to' e 'from' sendo cada uma o id de usuário; transações do tipo reward são transações onde o usuário resgata recompensas com seus pontos; transações tipo recycling o usuário recebe pontos em troca de reciclagem de materiais * peso",
  ],
  [
    "system",
    `Responda apenas no seguinte formato: "Usando modelos sofisticados de regressão (machine learning), no próximo mês, seguindo a sua sequência, você {ganharia/perderia} {X} pontos."`,
  ],
  ["human", "{userId} {transactions}"],
])

const model = new ChatMistralAI({
  apiKey: env.MISTRAL_API_KEY,
})

export const chatRouter = {
  lookupTransactionsRegression: protectedProcedure.mutation(async ({ ctx }) => {
    const extract = await getUserExtract(ctx.user.id)

    if (extract.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuário não possui transações",
      })
    }

    const chain = transactionsRegressionLookupPrompt.pipe(model)

    return await chain.invoke({
      transactions: extract,
      userId: ctx.user.id,
    })
  }),
}
