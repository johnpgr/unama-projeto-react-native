import { TRPCError } from "@trpc/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import type { NewTradeOffer } from "../../drizzle/schema.ts"
import { db } from "../../drizzle/index.ts"
import { TradeOffer } from "../../drizzle/schema.ts"
import { protectedProcedure } from "../../trpc/index.ts"

export const tradeOfferRouter = {
  createTradeOffer: protectedProcedure
    .input(
      z.object({
        quantity: z.number().positive(),
        itemType: z.enum(["plastic", "glass", "metal", "paper", "electronic"]),
        location: z
          .object({
            latitude: z.string(),
            longitude: z.string(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newOffer: NewTradeOffer = {
        userId: ctx.user.id,
        quantity: input.quantity,
        itemType: input.itemType,
        latitude: input.location?.latitude,
        longitude: input.location?.longitude,
      }

      const offer = await db.insert(TradeOffer).values(newOffer).returning()

      return offer[0]
    }),
  acceptTradeOffer: protectedProcedure
    .input(
      z.object({
        offerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const offer = await db.query.TradeOffer.findFirst({
        where: (offer) => eq(offer.id, input.offerId),
      })

      if (!offer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Oferta de troca não encontrada",
        })
      }

      if (offer.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta oferta de troca não está mais disponível",
        })
      }

      if (offer.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode aceitar sua própria oferta de troca",
        })
      }

      const [updatedOffer] = await db
        .update(TradeOffer)
        .set({
          status: "accepted",
          acceptedBy: ctx.user.id,
        })
        .where(eq(TradeOffer.id, input.offerId))
        .returning()

      return updatedOffer
    }),

  getTradeOffers: protectedProcedure.query(async () => {
    const offers = await db.query.TradeOffer.findMany({
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: (t) => desc(t.createdAt),
    })

    return offers
  }),
}
