import { useEffect, useRef, useState } from 'react'

interface RegionData {
  id: string
  name: string
  approved: number
  proposed: number
}

interface InteractiveMapProps {
  onRegionClick: (regionId: string) => void
  onRegionHover: (regionId: string | null) => void
  regionsData: RegionData[]
}

// Region names mapping
const REGION_NAMES: Record<string, string> = {
  'UZ-AN': 'Андижон',
  'UZ-BU': 'Бухоро',
  'UZ-FA': 'Фарғона',
  'UZ-JI': 'Жиззах',
  'UZ-NG': 'Наманган',
  'UZ-NW': 'Навоий',
  'UZ-QA': 'Қашқадарё',
  'UZ-QR': 'Қорақалпоғистон',
  'UZ-SA': 'Самарқанд',
  'UZ-SI': 'Сирдарё',
  'UZ-SU': 'Сурхондарё',
  'UZ-TK': 'Тошкент шаҳри',
  'UZ-TO': 'Тошкент в.',
  'UZ-XO': 'Хоразм',
}

export function InteractiveMap({ onRegionClick, onRegionHover, regionsData }: InteractiveMapProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const onRegionClickRef = useRef(onRegionClick)
  const onRegionHoverRef = useRef(onRegionHover)
  const listenersAttachedRef = useRef(false)

  // Keep refs up to date with latest callbacks
  useEffect(() => {
    onRegionClickRef.current = onRegionClick
    onRegionHoverRef.current = onRegionHover
  }, [onRegionClick, onRegionHover])

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

          // Temporarily append to DOM to get proper bounding boxes
          const tempContainer = document.createElement('div')
          tempContainer.style.position = 'absolute'
          tempContainer.style.visibility = 'hidden'
          tempContainer.style.width = '800px'
          tempContainer.style.height = '600px'
          document.body.appendChild(tempContainer)
          tempContainer.appendChild(svgElement)

          // Now add labels with proper dimensions
          setTimeout(() => {
            addRegionLabelsToSVG(svgElement)
            // Get the SVG with labels as string
            const cleanSvg = new XMLSerializer().serializeToString(svgElement)
            setSvgContent(cleanSvg)
            setMapLoaded(true)
            // Clean up temp container
            document.body.removeChild(tempContainer)
          }, 50)
        } else {
          console.error('No SVG element found in the file')
          setMapLoaded(true)
        }
      })
      .catch(error => {
        console.error('Failed to load map:', error)
        setMapLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!mapLoaded || !containerRef.current || listenersAttachedRef.current) return

    const container = containerRef.current

    console.log('🎯 Setting up EVENT DELEGATION')

    // Use event delegation - attach ONE listener to container
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.tagName === 'path') {
        const regionId = target.getAttribute('id')
        if (regionId && regionId !== 'UZ-AS' && regionId.startsWith('UZ-')) {
          e.preventDefault()
          e.stopPropagation()
          console.log('✅ CLICKED VIA DELEGATION:', regionId)
          onRegionClickRef.current(regionId)

          // Update selected class
          const svg = container.querySelector('svg')
          if (svg) {
            svg.querySelectorAll('path.selected').forEach(p => p.classList.remove('selected'))
            target.classList.add('selected')
          }
        }
      }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.tagName === 'path') {
        const regionId = target.getAttribute('id')
        if (regionId && regionId !== 'UZ-AS' && regionId.startsWith('UZ-')) {
          console.log('👉 HOVER VIA DELEGATION:', regionId)
          onRegionHoverRef.current(regionId)
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.tagName === 'path') {
        const regionId = target.getAttribute('id')
        if (regionId && regionId !== 'UZ-AS' && regionId.startsWith('UZ-')) {
          console.log('👈 HOVER OUT VIA DELEGATION')
          onRegionHoverRef.current(null)
        }
      }
    }

    // Attach to container, NOT individual paths
    container.addEventListener('click', handleClick, true)
    container.addEventListener('mouseover', handleMouseOver, true)
    container.addEventListener('mouseout', handleMouseOut, true)

    // Add CSS classes to paths
    const svg = container.querySelector('svg')
    if (svg) {
      const paths = svg.querySelectorAll('path[id^="UZ-"]')
      paths.forEach(path => {
        const regionId = path.getAttribute('id')
        if (regionId === 'UZ-AS') {
          path.classList.add('aral-sea')
        } else {
          path.classList.add('region-path')
        }
      })
    }

    listenersAttachedRef.current = true
    console.log('✅ EVENT DELEGATION READY!')

    // Cleanup
    return () => {
      console.log('🧹 Removing delegated listeners')
      container.removeEventListener('click', handleClick, true)
      container.removeEventListener('mouseover', handleMouseOver, true)
      container.removeEventListener('mouseout', handleMouseOut, true)
      listenersAttachedRef.current = false
    }
  }, [mapLoaded])

  // Function to add region labels with leader lines to SVG element
  const addRegionLabelsToSVG = (svg: SVGSVGElement) => {
    const viewBox = svg.viewBox.baseVal
    const mapWidth = viewBox.width
    const mapHeight = viewBox.height

    // Create group for labels
    const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    labelsGroup.setAttribute('class', 'region-labels-group')

    // Process each region
    Object.entries(REGION_NAMES).forEach(([regionId, regionName]) => {
      const path = svg.querySelector(`path[id="${regionId}"]`) as SVGPathElement
      if (!path) return

      // Calculate centroid
      const bbox = path.getBBox()
      const centroidX = bbox.x + bbox.width / 2
      const centroidY = bbox.y + bbox.height / 2

      // Determine label position - vertical with horizontal offset to prevent overlap
      let labelX: number, labelY: number, anchor: string
      let lineLength: number

      // Select regions for top labels
      const topRegions = ['UZ-QR', 'UZ-SI', 'UZ-NW', 'UZ-SA', 'UZ-JI', 'UZ-AN', 'UZ-NG', 'UZ-TO']

      // Calculate relative horizontal position (0 to 1)
      const relX = centroidX / mapWidth

      // Add horizontal offset to spread labels and prevent overlap
      // Offset ranges from -30px (left) to +30px (right)
      let horizontalOffset = (relX - 0.5) * 60

      // Special leftward offset for specific regions
      const leftBentRegions = ['UZ-QR', 'UZ-NW', 'UZ-SA', 'UZ-JI']
      const moreLeftBentRegions = ['UZ-NW', 'UZ-JI', 'UZ-SA', 'UZ-SI']
      const bottomLeftBentRegions = ['UZ-XO', 'UZ-BU', 'UZ-QA']
      const slightLeftBentRegions = ['UZ-TO', 'UZ-NG']
      const slightRightBentRegions = ['UZ-AN', 'UZ-TK', 'UZ-FA']

      if (leftBentRegions.includes(regionId)) {
        horizontalOffset -= 50 // Additional 50px to the left
      }

      if (moreLeftBentRegions.includes(regionId)) {
        horizontalOffset -= 70 // Extra 70px to the left (total 120px for these)
      }

      if (bottomLeftBentRegions.includes(regionId)) {
        horizontalOffset -= 60 // 60px to the left for bottom labels
      }

      if (slightLeftBentRegions.includes(regionId)) {
        horizontalOffset -= 30 // Slight 30px to the left
      }

      if (slightRightBentRegions.includes(regionId)) {
        horizontalOffset += 30 // Slight 30px to the right
      }

      labelX = centroidX + horizontalOffset
      anchor = 'middle'

      // Line height for text - declared early for use in line endpoint calculation
      const lineHeight = 14

      // Regions with shorter lines (much closer to regions)
      const shorterLineRegions = ['UZ-AN', 'UZ-NG', 'UZ-TO', 'UZ-SI', 'UZ-JI', 'UZ-SA', 'UZ-NW', 'UZ-XO', 'UZ-BU', 'UZ-FA', 'UZ-TK']

      if (topRegions.includes(regionId)) {
        // Top labels with varying line lengths
        if (shorterLineRegions.includes(regionId)) {
          lineLength = 25 // Much shorter lines for specified regions
        } else {
          lineLength = 40 + (relX * 60) // Varies from 40px to 100px for others
        }
        labelY = -lineLength - 5

        // Move Namangan and Jizzakh to lower position
        if (regionId === 'UZ-NG' || regionId === 'UZ-JI') {
          labelY += 70 // Move 70px lower (less negative)
        }
      } else {
        // Bottom labels with varying line lengths
        if (shorterLineRegions.includes(regionId)) {
          lineLength = 25 // Much shorter lines for specified regions
        } else {
          lineLength = 40 + ((1 - relX) * 60) // Inverse pattern for variety
        }
        labelY = mapHeight + lineLength + 5
      }

      // Create leader line with gap between line and text
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      const lineGap = 8 // Gap between line endpoint and label text
      const lineEndY = topRegions.includes(regionId)
        ? labelY + lineHeight * 3 + lineGap // For top labels, end line after all text (below difference value)
        : labelY - lineGap // For bottom labels, move line endpoint up (towards map)

      line.setAttribute('x1', centroidX.toString())
      line.setAttribute('y1', centroidY.toString())
      line.setAttribute('x2', labelX.toString())
      line.setAttribute('y2', lineEndY.toString())
      line.setAttribute('class', 'leader-line')
      line.setAttribute('data-region', regionId)

      // Get region data for budget info
      const regionData = regionsData.find(r => r.id === regionId)
      const difference = regionData ? regionData.proposed - regionData.approved : 0

      // Create text group for multi-line label
      const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      textGroup.setAttribute('class', 'region-label-group')
      textGroup.setAttribute('data-region', regionId)

      // Region name
      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      nameText.setAttribute('x', labelX.toString())
      nameText.setAttribute('y', labelY.toString())
      nameText.setAttribute('class', 'region-label region-label-name')
      nameText.setAttribute('text-anchor', anchor)
      nameText.textContent = regionName

      // Tasdiqlangan (Approved)
      const approvedText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      approvedText.setAttribute('x', labelX.toString())
      approvedText.setAttribute('y', (labelY + lineHeight).toString())
      approvedText.setAttribute('class', 'region-label region-label-approved')
      approvedText.setAttribute('text-anchor', anchor)
      approvedText.textContent = regionData ? `${regionData.approved}` : ''

      // Taklif etilyotgan (Proposed)
      const proposedText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      proposedText.setAttribute('x', labelX.toString())
      proposedText.setAttribute('y', (labelY + lineHeight * 2).toString())
      proposedText.setAttribute('class', 'region-label region-label-proposed')
      proposedText.setAttribute('text-anchor', anchor)
      proposedText.textContent = regionData ? `${regionData.proposed}` : ''

      // Farq (Difference)
      const diffText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      diffText.setAttribute('x', labelX.toString())
      diffText.setAttribute('y', (labelY + lineHeight * 3).toString())
      diffText.setAttribute('class', 'region-label region-label-diff')
      diffText.setAttribute('text-anchor', anchor)
      diffText.textContent = regionData ? `${difference > 0 ? '+' : ''}${difference}` : ''

      // Add all text elements to group
      textGroup.appendChild(nameText)
      textGroup.appendChild(approvedText)
      textGroup.appendChild(proposedText)
      textGroup.appendChild(diffText)

      // Add line and text group
      labelsGroup.appendChild(line)
      labelsGroup.appendChild(textGroup)
    })

    // Append labels group to SVG
    svg.appendChild(labelsGroup)
  }

  return (
    <div className="interactive-map-container">
      {!mapLoaded && (
        <div className="interactive-map-loading">
          <div className="spinner" />
          <p>Xarita yuklanmoqda...</p>
        </div>
      )}
      {mapLoaded && (
        <>
          <div
            ref={containerRef}
            style={{ pointerEvents: 'auto' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          <div className="map-legend">
            <div className="map-legend__item">
              <span className="map-legend__color map-legend__color--approved"></span>
              <span className="map-legend__label">Тасдиқланган</span>
            </div>
            <div className="map-legend__item">
              <span className="map-legend__color map-legend__color--proposed"></span>
              <span className="map-legend__label">Таклиф етилйотган</span>
            </div>
            <div className="map-legend__item">
              <span className="map-legend__color map-legend__color--diff"></span>
              <span className="map-legend__label">Фарқ</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
