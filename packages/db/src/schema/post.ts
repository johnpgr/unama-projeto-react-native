import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"
import { uuidv7 } from "uuidv7"
import { z } from "zod"
import { now } from "../utils"

// Tabela temporaria, apenas demonstrativa.
export const Post = sqliteTable("post", {
    id: text("id")
        .notNull()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    title: text("name", { length: 256 }).notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(now)
        .notNull(),
    updatedAt: integer("updated_at", {
        mode: "timestamp_ms",
    }).$onUpdateFn(() => now),
})

export const CreatePost = createInsertSchema(Post, {
    title: z.string().max(256),
    content: z.string().max(256),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})
