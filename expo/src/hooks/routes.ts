import React from "react"
import { usePathname } from "expo-router"

/**
 * Hook that observes route changes and calls a callback with current and previous routes
 * @param callback - Function to be called when route changes
 * @param callback.current - Current route path
 * @param callback.previous - Previous route path (undefined on first render)
 * @example
 * ```tsx
 * useRouteObserver((current, previous) => {
 *   console.log(`Route changed from ${previous} to ${current}`)
 * })
 * ```
 */
export function useRouteObserver(
  callback: (currentPath: string, previousPath: string | null) => void,
) {
  const pathname = usePathname()
  const previousPathname = React.useRef<string | null>(null)

  React.useEffect(() => {
    callback(pathname, previousPathname.current)
    previousPathname.current = pathname
  }, [pathname, callback])
}
