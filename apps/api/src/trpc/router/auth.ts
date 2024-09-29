import type { TRPCRouterRecord } from "@trpc/server"
import { hash, verify } from "@node-rs/argon2"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

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
        return { session: ctx.session, user: ctx.user }
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

            const validPassword = await verify(
                existingUser.hashedPassword,
                input.password,
                ARGON2_OPTS,
            )

            if (!validPassword) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid email or password",
                })
            }

            const session = await lucia.createSession(existingUser.id, {})
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
                        hashedPassword: await hash(input.password, ARGON2_OPTS),
                    })
                    .returning()

                if (!user) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to create user (DB error)",
                    })
                }

                const session = await lucia.createSession(user.id, {})

                //@ts-expect-error ok
                delete user.hashedPassword

                return { user, session }
            } catch (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to create user (${(error as Error).message})`,
                })
            }
        }),
} satisfies TRPCRouterRecord
