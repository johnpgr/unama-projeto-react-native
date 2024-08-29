import { defineEventHandler, getRequestHeaders, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const url = "/r" + event.node.req.url
    const method = event.method
    const headers = getRequestHeaders(event)
    const body = await readBody(event)
    console.log({ url, method, headers, body })
    //@ts-expect-error ok
    return await $fetch(url, {
        method,
        headers,
        body,
    })
})
