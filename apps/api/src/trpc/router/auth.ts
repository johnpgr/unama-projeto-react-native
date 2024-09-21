import type { TRPCRouterRecord } from "@trpc/server"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { Argon2id } from "oslo/password"
import { z } from "zod"

import { db } from "../../database/client.ts"
import { User } from "../../database/schema.ts"
import { auth } from "../../auth/index.ts"
import { protectedProcedure, publicProcedure } from "../index.ts"

const passwordHasher = new Argon2id({
    memorySize: 19456,
    iterations: 2,
    tagLength: 32,
    parallelism: 1,
})

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const authRouter = {
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.session
    }),

    signOut: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            await auth.invalidateSession(ctx.session.token)
            return "ok"
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                cause: (error as Error).cause,
                message: (error as Error).message,
            })
        }
    }),

    signIn: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(1),
            }),
        )
        .mutation(async ({ input }) => {
            const existingUser = await db.query.User.findFirst({
                where: (user) => eq(user.email, input.email),
            })

            if (!existingUser || !existingUser.hashedPassword) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid email or password",
                })
            }

            const validPassword = await passwordHasher.verify(
                existingUser.hashedPassword,
                input.password,
            )

            if (!validPassword) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid email or password",
                })
            }

            const session = await auth.createSession(existingUser.id, {})
            return { session }
        }),

    signUp: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                fullName: z.string().min(3),
                password: z.string().min(8),
            }),
        )
        .mutation(async ({ input }) => {
            try {
                const userExists = await db.query.User.findFirst({
                    where: (user) => eq(user.email, input.email),
                })

                if (userExists) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "User with this email already exists",
                    })
                }

                const [user] = await db
                    .insert(User)
                    .values({
                        email: input.email,
                        fullName: input.fullName,
                        hashedPassword: await passwordHasher.hash(
                            input.password,
                        ),
                    })
                    .returning()

                if (!user) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create user",
                    })
                }

                const session = await auth.createSession(user.id, {})

                //@ts-expect-error ok
                delete user.hashedPassword

                return { user, session }
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create user",
                })
            }
        }),
} satisfies TRPCRouterRecord
