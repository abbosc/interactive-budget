import { useEffect, useRef, useState } from 'react'

interface DistrictData {
  id: string
  name: string
  nameUz: string
  approved: number
  proposed: number
}

interface InteractiveDistrictMapProps {
  onDistrictClick: (districtId: string) => void
  onDistrictHover: (districtId: string | null) => void
  districtsData: DistrictData[]
}

// District names mapping for labels
const DISTRICT_NAMES: Record<string, string> = {
  'almazarskiy-rayon': 'Олмазор',
  'chilonzarskiy-rayon': 'Чилонзор',
  'yashnabadskiy-rayon': 'Яшнобод',
  'mirabadskiy-rayon': 'Миробод',
  'bektemirskiy-rayon': 'Бектемир',
  'yakasarayskiy-rayon': 'Яккасарой',
  'uchtepinskiy-rayon': 'Учтепа',
  'shayhantaurskiy-rayon': 'Шайхонтоҳур',
  'yunusabadskiy-rayon': 'Юнусобод',
  'mirzo-ulugbekskiy-rayon': 'Мирзо Улуғбек',
  'sergely-rayon': 'Сергели',
  'yangihayot-rayon': 'Янгиҳаёт',
}

export function InteractiveDistrictMap({ onDistrictClick, onDistrictHover, districtsData }: InteractiveDistrictMapProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [, setHoveredDistrict] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onDistrictClickRef = useRef(onDistrictClick)
  const onDistrictHoverRef = useRef(onDistrictHover)
  const listenersAttachedRef = useRef(false)

  // Keep refs up to date
  useEffect(() => {
    onDistrictClickRef.current = onDistrictClick
    onDistrictHoverRef.current = onDistrictHover
  }, [onDistrictClick, onDistrictHover])

  useEffect(() => {
    // Load the SVG
    fetch('/tashkent_map.svg')
      .then(response => response.text())
      .then(svgText => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = doc.querySelector('svg')

        if (svgElement) {
          // Remove inline styles and unwanted attributes from all paths, then add CSS class
          const paths = svgElement.querySelectorAll('path[id]')
          paths.forEach(path => {
            path.removeAttribute('style')
            path.removeAttribute('data-v-319d80f3')
            path.removeAttribute('title')
            path.removeAttribute('fill')
            path.removeAttribute('stroke')
            path.removeAttribute('stroke-width')
            // Add the CSS class immediately so paths are styled from the start
            path.setAttribute('class', 'district-path')
          })

          // Temporarily append to DOM to get proper bounding boxes
          const tempContainer = document.createElement('div')
          tempContainer.style.position = 'absolute'
          tempContainer.style.visibility = 'hidden'
          tempContainer.style.width = '800px'
          tempContainer.style.height = '600px'
          document.body.appendChild(tempContainer)
          tempContainer.appendChild(svgElement)

          // Add labels after a short delay to ensure SVG is rendered
          setTimeout(() => {
            addDistrictLabelsToSVG(svgElement)
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
        console.error('Failed to load district map:', error)
        setMapLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!mapLoaded || !containerRef.current || listenersAttachedRef.current) return

    const container = containerRef.current

    // Use event delegation
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.tagName === 'path') {
        const districtId = target.getAttribute('id')
        if (districtId) {
          e.preventDefault()
          e.stopPropagation()
          onDistrictClickRef.current(districtId)

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
        const districtId = target.getAttribute('id')
        if (districtId) {
          setHoveredDistrict(districtId)
          onDistrictHoverRef.current(districtId)

          // Highlight the corresponding leader line
          const svg = container.querySelector('svg')
          if (svg) {
            const leaderLine = svg.querySelector(`line[data-district="${districtId}"]`)
            const labelGroup = svg.querySelector(`.district-label-group[data-district="${districtId}"]`)
            if (leaderLine) {
              leaderLine.classList.add('hovered')
            }
            if (labelGroup) {
              labelGroup.classList.add('hovered')
            }
          }
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.tagName === 'path') {
        const districtId = target.getAttribute('id')
        if (districtId) {
          setHoveredDistrict(null)
          onDistrictHoverRef.current(null)

          // Remove highlight from leader line
          const svg = container.querySelector('svg')
          if (svg) {
            const leaderLine = svg.querySelector(`line[data-district="${districtId}"]`)
            const labelGroup = svg.querySelector(`.district-label-group[data-district="${districtId}"]`)
            if (leaderLine) {
              leaderLine.classList.remove('hovered')
            }
            if (labelGroup) {
              labelGroup.classList.remove('hovered')
            }
          }
        }
      }
    }

    // Attach to container
    container.addEventListener('click', handleClick, true)
    container.addEventListener('mouseover', handleMouseOver, true)
    container.addEventListener('mouseout', handleMouseOut, true)

    listenersAttachedRef.current = true

    // Cleanup
    return () => {
      container.removeEventListener('click', handleClick, true)
      container.removeEventListener('mouseover', handleMouseOver, true)
      container.removeEventListener('mouseout', handleMouseOut, true)
      listenersAttachedRef.current = false
    }
  }, [mapLoaded])

  // Function to add district labels with leader lines to SVG element
  const addDistrictLabelsToSVG = (svg: SVGSVGElement) => {
    const viewBox = svg.viewBox.baseVal
    const mapWidth = viewBox.width
    const mapHeight = viewBox.height

    // Calculate map center
    const mapCenterX = mapWidth / 2
    const mapCenterY = mapHeight / 2

    // First pass: calculate angles for all districts
    const districtAngles: Array<{ districtId: string, districtName: string, angle: number, centroidX: number, centroidY: number }> = []

    Object.entries(DISTRICT_NAMES).forEach(([districtId, districtName]) => {
      const path = svg.querySelector(`path[id="${districtId}"]`) as SVGPathElement
      if (!path) return

      const bbox = path.getBBox()
      const centroidX = bbox.x + bbox.width / 2
      const centroidY = bbox.y + bbox.height / 2

      const deltaX = centroidX - mapCenterX
      const deltaY = centroidY - mapCenterY
      const angle = Math.atan2(deltaY, deltaX)
      const angleInDegrees = (angle * 180 / Math.PI + 360) % 360

      districtAngles.push({ districtId, districtName, angle: angleInDegrees, centroidX, centroidY })
    })

    // Sort districts by angle
    districtAngles.sort((a, b) => a.angle - b.angle)

    // Calculate slice size based on number of districts
    const sliceAngle = 360 / districtAngles.length

    // Create group for labels
    const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    labelsGroup.setAttribute('class', 'district-labels-group')

    // Process each district with assigned slice
    districtAngles.forEach(({ districtId, districtName, centroidX, centroidY }, index) => {
      // Calculate the target angle for this slice (evenly distributed)
      const targetAngle = index * sliceAngle
      const targetAngleRad = (targetAngle * Math.PI) / 180

      // Radial distance from map edge for labels
      const labelRadius = 0

      // Line height for text (increased to match larger font size)
      const lineHeight = 22

      // Calculate label position on a perfect circle using trigonometry
      // Convert angle to position (0° is right, 90° is bottom, 180° is left, 270° is top)
      const circleRadius = Math.max(mapWidth, mapHeight) / 2 + labelRadius

      // Calculate position relative to map center
      const labelOffsetX = Math.cos(targetAngleRad) * circleRadius
      const labelOffsetY = Math.sin(targetAngleRad) * circleRadius

      const labelX = mapCenterX + labelOffsetX
      const labelY = mapCenterY + labelOffsetY

      // Determine anchor and side based on angle
      let anchor: string
      let labelSide: 'top' | 'right' | 'bottom' | 'left'

      // Determine text anchor based on position around circle
      if (targetAngle >= 315 || targetAngle < 45) {
        // Right side
        anchor = 'start'
        labelSide = 'right'
      } else if (targetAngle >= 45 && targetAngle < 135) {
        // Bottom side
        if (targetAngle < 80) {
          anchor = 'start'
        } else if (targetAngle > 100) {
          anchor = 'end'
        } else {
          anchor = 'middle'
        }
        labelSide = 'bottom'
      } else if (targetAngle >= 135 && targetAngle < 225) {
        // Left side
        anchor = 'end'
        labelSide = 'left'
      } else {
        // Top side
        if (targetAngle < 260) {
          anchor = 'end'
        } else if (targetAngle > 280) {
          anchor = 'start'
        } else {
          anchor = 'middle'
        }
        labelSide = 'top'
      }

      // Create leader line with gap between line and text
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      const lineGap = 8
      let lineEndX: number, lineEndY: number

      if (labelSide === 'top') {
        lineEndX = labelX
        lineEndY = labelY + lineHeight * 3 + lineGap
      } else if (labelSide === 'bottom') {
        lineEndX = labelX
        lineEndY = labelY - lineGap
      } else if (labelSide === 'left') {
        lineEndX = labelX + 55 // End line near the text
        lineEndY = labelY + lineHeight * 1.5
      } else { // right
        lineEndX = labelX - lineGap
        lineEndY = labelY + lineHeight * 1.5
      }

      line.setAttribute('x1', centroidX.toString())
      line.setAttribute('y1', centroidY.toString())
      line.setAttribute('x2', lineEndX.toString())
      line.setAttribute('y2', lineEndY.toString())
      line.setAttribute('class', 'leader-line')
      line.setAttribute('data-district', districtId)

      // Get district data for budget info
      const districtData = districtsData.find(d => d.id === districtId)
      const difference = districtData ? districtData.proposed - districtData.approved : 0

      // Create text group for multi-line label
      const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      textGroup.setAttribute('class', 'district-label-group')
      textGroup.setAttribute('data-district', districtId)

      // Adjust label Y positions for left/right sides (center the 4 lines vertically)
      let baseY = labelY
      if (labelSide === 'left' || labelSide === 'right') {
        baseY = labelY - (lineHeight * 1.5) // Center the 4 lines around the centroid
      }

      // District name
      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      nameText.setAttribute('x', labelX.toString())
      nameText.setAttribute('y', baseY.toString())
      nameText.setAttribute('class', 'region-label region-label-name')
      nameText.setAttribute('text-anchor', anchor)
      nameText.textContent = districtName

      // Tasdiqlangan (Approved)
      const approvedText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      approvedText.setAttribute('x', labelX.toString())
      approvedText.setAttribute('y', (baseY + lineHeight).toString())
      approvedText.setAttribute('class', 'region-label region-label-approved')
      approvedText.setAttribute('text-anchor', anchor)
      approvedText.textContent = districtData ? `${districtData.approved}` : ''

      // Taklif etilyotgan (Proposed)
      const proposedText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      proposedText.setAttribute('x', labelX.toString())
      proposedText.setAttribute('y', (baseY + lineHeight * 2).toString())
      proposedText.setAttribute('class', 'region-label region-label-proposed')
      proposedText.setAttribute('text-anchor', anchor)
      proposedText.textContent = districtData ? `${districtData.proposed}` : ''

      // Farq (Difference)
      const diffText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      diffText.setAttribute('x', labelX.toString())
      diffText.setAttribute('y', (baseY + lineHeight * 3).toString())
      diffText.setAttribute('class', 'region-label region-label-diff')
      diffText.setAttribute('text-anchor', anchor)
      diffText.textContent = districtData ? `${difference > 0 ? '+' : ''}${difference}` : ''

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
    <div className="interactive-map-container district-map">
      {!mapLoaded && (
        <div className="interactive-map-loading">
          <div className="spinner" />
          <p>Tuman xaritasi yuklanmoqda...</p>
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
