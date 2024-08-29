import { defineEventHandler, getRequestHeaders } from "h3"

export default defineEventHandler(async (event) => {
    console.log("Forwarding request", event.node.req)
    const forwardedUrl = "/r/" + event.node.req.url
    const forwardedReq = new Request(forwardedUrl, {
        //@ts-expect-error ok
        headers: getRequestHeaders(event),
    })
    console.log("forwardedReq", forwardedReq)
    //@ts-expect-error ok
    const res = await $fetch(forwardedReq)
    console.log("res:", res)
    return res
})
