import { defineEventHandler, getRequestHeaders } from "h3"

export default defineEventHandler(async (event) => {
    const url = "/r" + event.node.req.url
    const headers = getRequestHeaders(event)
    console.log({ url, headers })
    //@ts-expect-error ok
    return await $fetch(url, {
        headers,
    })
})
