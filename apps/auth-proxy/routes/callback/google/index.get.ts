import { defineEventHandler, getRequestHeaders } from "h3"

export default defineEventHandler(async (event) => {
    //@ts-expect-error ok
    return await $fetch("/r" + event.node.req.url, {
        headers: getRequestHeaders(event),
    })
})
