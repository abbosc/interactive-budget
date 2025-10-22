import { useState, useEffect } from 'react'

/**
 * Hook to detect if a media query matches
 * @param query - The media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener (using deprecated method for wider browser support)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler)
      }
    }
  }, [query])

  return matches
}

/**
 * Hook to get the current number of columns based on responsive breakpoints
 * Matches the CSS breakpoints in RussianStyles.css
 * @returns number of columns (1, 2, or 3)
 */
export function useGridColumns(): number {
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')

  if (isDesktop) return 3
  if (isTablet) return 2
  return 1
}
