import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

import { invalidateSessionToken, signIn } from "@projeto/auth"
import { eq } from "@projeto/db"
import { User } from "@projeto/db/schema"

import { protectedProcedure, publicProcedure } from "../trpc"
import { PasswordHasher } from "@projeto/passwords"

const passwordHasher = PasswordHasher.getInstance()

export const authRouter = {
    getSession: publicProcedure.query(({ ctx }) => {
        return ctx.session
    }),
    getSecretMessage: protectedProcedure.query(() => {
        return "you can see this secret message!"
    }),
    signOut: protectedProcedure.mutation(async ({ ctx }) => {
        if (!ctx.token) {
            return { success: false }
        }
        await invalidateSessionToken(ctx.token)
        return { success: true }
    }),
    signIn: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(1),
            }),
        )
        .mutation(async ({ input }) => {
            try {
                const res = await signIn("credentials", {
                    redirect: false,
                    email: input.email,
                    password: input.password,
                })
                console.log("res in mutation:", res)
                return { success: true, data: res, error: null } as const
            } catch (error) {
                return {
                    success: false,
                    data: null,
                    message: (error as Error).message,
                } as const
            }
        }),
    signUp: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                name: z.string().min(8),
                password: z.string().min(10),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const userExists = await ctx.db.query.User.findFirst({
                    where: (user) => eq(user.email, input.email),
                })

                if (userExists !== undefined) {
                    return {
                        success: false,
                        data: null,
                        message: "[Signup]: Email was already taken.",
                    } as const
                }

                const [user] = await ctx.db
                    .insert(User)
                    .values({
                        email: input.email,
                        name: input.name,
                        hashedPassword: await passwordHasher.hash(input.password),
                    })
                    .returning()

                return { success: true, data: user!, message: null } as const
            } catch (error) {
                console.error(error)
                return {
                    data: null,
                    success: false,
                    message: (error as Error).message,
                } as const
            }
        }),
} satisfies TRPCRouterRecord
