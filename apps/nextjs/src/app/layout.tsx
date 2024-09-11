import type { Metadata, Viewport } from "next"

import { ThemeProvider, ThemeToggle } from "@projeto/web-ui/theme"
import { Toaster } from "@projeto/web-ui/toast"

import { TRPCReactProvider } from "~/trpc/client"

import "~/app/globals.css"

export const metadata: Metadata = {
    title: "Hello, World",
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
}

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans text-foreground antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <TRPCReactProvider>{props.children}</TRPCReactProvider>
                    <div className="absolute bottom-4 right-4">
                        <ThemeToggle />
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
