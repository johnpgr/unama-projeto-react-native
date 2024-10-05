import type { TRPCRouterRecord } from "@trpc/server"
import { hash, verify } from "@node-rs/argon2"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import { signInSchema, signUpSchema } from "@projeto/validation"

import { lucia } from "../../auth/lucia.ts"
import { db } from "../../database/client.ts"
import { User } from "../../database/schema.ts"
import { protectedProcedure, publicProcedure } from "../trpc.ts"

const ARGON2_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return {
      session: ctx.session,
      user: ctx.user,
    }
  }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await lucia.invalidateSession(ctx.session.id)
      return "ok" as const
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: (error as Error).cause,
        message: (error as Error).message,
      })
    }
  }),

  signIn: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    const existingUser = await db.query.User.findFirst({
      where: (user) => eq(user.email, input.email),
    })

    if (!existingUser?.hashedPassword) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email ou senha inválido.",
      })
    }

    const validPassword = await verify(
      existingUser.hashedPassword,
      input.password,
      ARGON2_OPTS,
    )

    if (!validPassword) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email ou senha inválido.",
      })
    }

    const session = await lucia.createSession(existingUser.id, {})
    return { session }
  }),

  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const userExists = await db.query.User.findFirst({
      where: (user) => eq(user.email, input.email),
    })

    if (userExists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Usuário com este email já existe.",
      })
    }

    const [user] = await db
      .insert(User)
      .values({
        email: input.email,
        fullName: input.fullName,
        hashedPassword: await hash(input.password, ARGON2_OPTS),
      })
      .returning()

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Falha ao criar conta. (Erro de banco de dados)",
      })
    }

    const session = await lucia.createSession(user.id, {})

    //@ts-expect-error ok
    delete user.hashedPassword

    return { user, session }
  }),
} satisfies TRPCRouterRecord
