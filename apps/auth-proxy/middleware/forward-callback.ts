import {eventHandler, getRequestHeaders, readBody } from "h3"

export default eventHandler(async (event) => {
    if(event.node.req.url?.startsWith("/callback/google")){
        console.log("Forwarding request", event.node.req)
        const forwardedUrl = "/r/" + event.node.req.url
        const forwardedReq = new Request(forwardedUrl, {
            method: event.node.req.method,
            //@ts-expect-error ok
            headers: getRequestHeaders(event),
            body: await readBody(event),
        })
        //@ts-expect-error ok
        return await $fetch(forwardedReq)
    }
})
