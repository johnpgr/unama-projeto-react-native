import { defineEventHandler, getRequestHeaders, readBody } from "h3"

export default defineEventHandler(async (event) => {
    const url = "/r" + event.node.req.url
    const headers = getRequestHeaders(event)
    const body = await readBody(event)
    console.log({ url, headers, body })
    //@ts-expect-error ok
    return await $fetch(url, {
        headers,
        body,
    })
})
