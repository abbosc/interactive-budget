import { useEffect, useRef, useState } from 'react'

interface InteractiveDistrictMapProps {
  onDistrictClick: (districtId: string) => void
  onDistrictHover: (districtId: string | null) => void
}

export function InteractiveDistrictMap({ onDistrictClick, onDistrictHover }: InteractiveDistrictMapProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load the SVG
    fetch('/tashkent_map.svg')
      .then(response => response.text())
      .then(svgText => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = doc.querySelector('svg')

        if (svgElement) {
          // Remove inline styles and unwanted attributes from all paths
          const paths = svgElement.querySelectorAll('path[id]')
          paths.forEach(path => {
            path.removeAttribute('style')
            path.removeAttribute('data-v-319d80f3')
            path.removeAttribute('class')
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
        console.error('Failed to load district map:', error)
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
      const paths = svg.querySelectorAll('path[id]')
      if (paths.length === 0) return

      const handleDistrictClick = (districtId: string) => {
        onDistrictClick(districtId)

        // Remove selected class from all paths
        paths.forEach(p => p.classList.remove('selected'))

        // Add selected class to clicked path
        const clickedPath = Array.from(paths).find(p => p.getAttribute('id') === districtId)
        if (clickedPath) {
          clickedPath.classList.add('selected')
        }
      }

      paths.forEach(path => {
        const districtId = path.getAttribute('id')
        if (!districtId) return

        // Add styling class
        path.classList.add('district-path')

        // Create handlers
        const clickHandler = () => handleDistrictClick(districtId)
        const mouseEnterHandler = () => {
          path.classList.add('hovered')
          onDistrictHover(districtId)
        }
        const mouseLeaveHandler = () => {
          path.classList.remove('hovered')
          onDistrictHover(null)
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
  }, [mapLoaded, svgContent, onDistrictClick, onDistrictHover])

  return (
    <div className="interactive-district-map-container">
      {!mapLoaded && (
        <div className="interactive-map-loading">
          <div className="spinner" />
          <p>Tuman xaritasi yuklanmoqda...</p>
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
