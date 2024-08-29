import { defineEventHandler, getRequestHeaders, readBody } from "h3"

export default defineEventHandler(async (event) => {
    //@ts-expect-error ok
    return await $fetch("/r" + event.node.req.url, {
        method: event.node.req.method,
        headers: getRequestHeaders(event),
        body: await readBody(event),
    })
})
