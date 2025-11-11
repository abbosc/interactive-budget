import { useEffect, useRef, useState } from 'react'

interface InteractiveMapProps {
  onRegionClick: (regionId: string) => void
  onRegionHover: (regionId: string | null) => void
}

export function InteractiveMap({ onRegionClick, onRegionHover }: InteractiveMapProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load the SVG
    fetch('/uzbekistan-map.svg')
      .then(response => response.text())
      .then(svgText => {
        // Parse the SVG and extract only the SVG element, not other HTML
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = doc.querySelector('svg')

        if (svgElement) {
          // Remove inline styles and unwanted attributes from all paths
          const paths = svgElement.querySelectorAll('path[id^="UZ-"]')
          paths.forEach(path => {
            path.removeAttribute('style')
            path.removeAttribute('data-v-17075ea1')
            path.removeAttribute('title')
          })

          // Get only the SVG element as string
          const cleanSvg = new XMLSerializer().serializeToString(svgElement)
          setSvgContent(cleanSvg)
        } else {
          console.error('No SVG element found in the file')
        }

        setMapLoaded(true)
      })
      .catch(error => {
        console.error('Failed to load map:', error)
      })
  }, [])

  useEffect(() => {
    if (!mapLoaded || !containerRef.current) return

    // Add a small delay to ensure the SVG is fully rendered in the DOM
    const timeoutId = setTimeout(() => {
      const container = containerRef.current
      if (!container) return

      const svg = container.querySelector('svg')
      if (!svg) return

      // Add classes and event listeners to all path elements
      const paths = svg.querySelectorAll('path[id^="UZ-"]')
      if (paths.length === 0) return

      const handleRegionClick = (regionId: string) => {
        onRegionClick(regionId)

        // Remove selected class from all paths
        paths.forEach(p => p.classList.remove('selected'))

        // Add selected class to clicked path
        const clickedPath = Array.from(paths).find(p => p.getAttribute('id') === regionId)
        if (clickedPath) {
          clickedPath.classList.add('selected')
        }
      }

      paths.forEach(path => {
        const regionId = path.getAttribute('id')
        if (!regionId) return

        // Skip Aral Sea - it should not be interactive
        if (regionId === 'UZ-AS') {
          path.classList.add('aral-sea')
          return
        }

        // Add styling class
        path.classList.add('region-path')

        // Create handlers
        const clickHandler = () => handleRegionClick(regionId)
        const mouseEnterHandler = () => {
          path.classList.add('hovered')
          onRegionHover(regionId)
        }
        const mouseLeaveHandler = () => {
          path.classList.remove('hovered')
          onRegionHover(null)
        }

        // Add event listeners
        path.addEventListener('click', clickHandler, true)
        path.addEventListener('mouseenter', mouseEnterHandler, true)
        path.addEventListener('mouseleave', mouseLeaveHandler, true)
      })
    }, 100)

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(timeoutId)
    }
  }, [mapLoaded, svgContent, onRegionClick, onRegionHover])

  return (
    <div className="interactive-map-container">
      {!mapLoaded && (
        <div className="interactive-map-loading">
          <div className="spinner" />
          <p>Xarita yuklanmoqda...</p>
        </div>
      )}
      {mapLoaded && (
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  )
}
