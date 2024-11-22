import type { TRPCRouterRecord } from "@trpc/server"
import { hash, verify } from "@node-rs/argon2"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import { db } from "../../drizzle/index.ts"
import { protectedProcedure, publicProcedure } from "../../trpc/index.ts"
import { User } from "../user/user.schema.ts"
import { sessionService } from "./auth.session.ts"
import { LoginSchema, RegisterSchema } from "./auth.validation.ts"

const ARGON2_OPTS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

export const authRouter = {
  /**
   * Procedimento para obter a sessão atual do usuário.
   *
   * Este procedimento retorna a sessão atual e as informações do usuário associado.
   *
   * Retorna:
   * - Um objeto contendo:
   *   - session: A sessão atual.
   *   - user: As informações do usuário associado à sessão.
   */
  getSession: publicProcedure.query(({ ctx }) => {
    return {
      session: ctx.session,
      user: ctx.user,
    }
  }),

  /**
   * Procedimento para encerrar a sessão do usuário.
   *
   * Este procedimento invalida a sessão atual do usuário.
   *
   * Retorna:
   * - Uma string "ok" se a sessão for invalidada com sucesso.
   *
   * Lança:
   * - TRPCError: Se ocorrer um erro ao invalidar a sessão.
   */
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await sessionService.invalidateSession(ctx.session.id)
      return "ok" as const
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: (error as Error).cause,
        message: (error as Error).message,
      })
    }
  }),

  /**
   * Procedimento para autenticar um usuário.
   *
   * Este procedimento verifica as credenciais do usuário e cria uma nova sessão se as credenciais forem válidas.
   *
   * Parâmetros de entrada:
   * - input: Um objeto contendo o email e a senha do usuário.
   *
   * Retorna:
   * - Um objeto contendo a nova sessão criada.
   *
   * Lança:
   * - TRPCError: Se o email ou a senha forem inválidos.
   */
  signIn: publicProcedure.input(LoginSchema).mutation(async ({ input }) => {
    const existingUser = await db.query.User.findFirst({
      where: (user) => eq(user.email, input.email),
    })

    if (!existingUser?.hashedPassword) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email ou senha inválido.",
      })
    }

    const validPassword = await verify(existingUser.hashedPassword, input.password, ARGON2_OPTS)

    if (!validPassword) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email ou senha inválido.",
      })
    }

    const session = await sessionService.createSession(existingUser.id)
    return { session }
  }),

  /**
   * Procedimento para registrar um novo usuário.
   *
   * Este procedimento cria uma nova conta de usuário e uma nova sessão.
   *
   * Parâmetros de entrada:
   * - input: Um objeto contendo o email, nome completo e senha do usuário.
   *
   * Retorna:
   * - Um objeto contendo o novo usuário e a nova sessão criada.
   *
   * Lança:
   * - TRPCError: Se o email já estiver em uso ou se ocorrer um erro ao criar a conta.
   */
  signUp: publicProcedure.input(RegisterSchema).mutation(async ({ input }) => {
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

    const session = await sessionService.createSession(user.id)

    //@ts-expect-error remove hashedPassword from user
    delete user.hashedPassword

    return { user, session }
  }),
} satisfies TRPCRouterRecord
