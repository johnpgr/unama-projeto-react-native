import { env } from "process"
import { ChatMistralAI } from "@langchain/mistralai"
import { z } from "zod"

import { protectedProcedure } from "../../trpc/index.ts"

export const chatRouter = {
  getLLMResponse: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async function* ({ input }) {
      const llm = new ChatMistralAI({
        apiKey: env.MISTRAL_API_KEY,
        temperature: 0.5,
      })

      const stream = await llm.stream(input.prompt)

      for await (const response of stream) {
        yield response
      }
    }),
}
