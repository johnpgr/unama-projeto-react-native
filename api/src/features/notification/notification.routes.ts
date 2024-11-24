import { observable } from "@trpc/server/observable"
import { eq } from "drizzle-orm"

import type { PubSubEvents } from "../../redis/index.ts"
import { db } from "../../drizzle/index.ts"
import { redis } from "../../redis/index.ts"
import { protectedProcedure } from "../../trpc/index.ts"

export const notificationRouter = {
  getUserNotifications: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    const userId = user.id

    const query = db.query.User.findFirst({
      where: (user) => eq(user.id, userId),
      columns: {},
      with: { notifications: true },
    })

    const res = await redis.cache(["notification", userId], () => query)

    return res?.notifications ?? []
  }),

  // onNotificationCreated: protectedProcedure.subscription(({ ctx }) => {
  //   return observable<Parameters<PubSubEvents["userNotificationCreated"]>[0]>((emit) => {
  //     void redis.subscribe("userNotificationCreated", (notification) => {
  //       if (ctx.user.id === notification.userId) {
  //         emit.next(notification)
  //       }
  //     })

  //     return () => {
  //       void redis.unsubscribe("userNotificationCreated")
  //     }
  //   })
  // }),
}
