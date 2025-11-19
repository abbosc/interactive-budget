import { useEffect, useRef, memo } from 'react'
import noUiSlider from 'nouislider'
import { formatNumber } from '../../lib/formatters'
import './NoUiSlider.css'

type NoUiSliderTarget = noUiSlider.noUiSlider

interface NoUiSliderProps {
  min: number
  max: number
  value: number
  defaultValue: number
  onChange: (value: number) => void
  onUpdate?: (value: number) => void
  color?: string
  step?: number
}

export const NoUiSlider = memo(function NoUiSlider({
  min,
  max,
  value,
  defaultValue,
  onChange,
  onUpdate,
  step = 1,
}: NoUiSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const sliderInstanceRef = useRef<NoUiSliderTarget | null>(null)
  const onChangeRef = useRef(onChange)
  const onUpdateRef = useRef(onUpdate)
  const tooltipRef = useRef<Element | null>(null)
  const connectDivRef = useRef<HTMLElement | null>(null)

  // Keep the refs updated with the latest callbacks
  useEffect(() => {
    onChangeRef.current = onChange
    onUpdateRef.current = onUpdate
  }, [onChange, onUpdate])

  // Format change amount (difference from default)
  const formatChange = (val: number) => {
    const change = val - defaultValue
    const changeMln = change / 1_000_000
    const formatted = formatNumber(Math.abs(changeMln), 1)

    if (Math.abs(changeMln) < 0.01) {
      return '0 mlrd so\'m'
    }

    return change >= 0 ? `+${formatted} mlrd so'm` : `−${formatted} mlrd so'm`
  }

  // Function to update custom connect bar (optimized with CSS custom properties)
  const updateConnectBar = (currentValue: number) => {
    if (!sliderRef.current) return

    const range = max - min
    const defaultPercent = ((defaultValue - min) / range) * 100
    const currentPercent = ((currentValue - min) / range) * 100

    const isNegative = currentValue < defaultValue
    const isAtDefault = Math.abs(currentValue - defaultValue) <= step / 2

    // Update tooltip color
    const tooltip = sliderRef.current.querySelector('.noUi-tooltip') as HTMLElement
    if (tooltip) {
      tooltipRef.current = tooltip
      if (isAtDefault) {
        tooltip.dataset.state = 'default'
      } else {
        tooltip.dataset.state = isNegative ? 'negative' : 'positive'
      }
    }

    // Always try to find the connect bar first
    let connectDiv = sliderRef.current.querySelector('.custom-connect') as HTMLElement

    if (!connectDiv && !isAtDefault) {
      // Create element if it doesn't exist and we need it
      connectDiv = document.createElement('div')
      connectDiv.className = 'custom-connect'
      connectDiv.style.cssText = `
        position: absolute;
        top: 0;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        will-change: left, width, background-color;
      `
      const base = sliderRef.current.querySelector('.noUi-base')
      if (base) {
        base.appendChild(connectDiv)
        connectDivRef.current = connectDiv
      }
    }

    if (connectDiv) {
      if (!isAtDefault) {
        // Update position and size using style properties (batched by browser)
        const left = isNegative ? currentPercent : defaultPercent
        const width = Math.abs(currentPercent - defaultPercent)

        connectDiv.style.left = `${left}%`
        connectDiv.style.width = `${width}%`
        connectDiv.style.backgroundColor = isNegative ? '#ff4444' : '#4CAF50'
        connectDiv.style.display = 'block'
      } else {
        // Hide instead of removing
        connectDiv.style.display = 'none'
      }
    }
  }

  useEffect(() => {
    if (!sliderRef.current) return

    // Create slider without pips
    const slider = noUiSlider.create(sliderRef.current, {
      start: [value],
      connect: [false, false], // No default connection
      range: {
        min: min,
        max: max,
      },
      step: step,
      tooltips: {
        to: (val: number) => formatChange(val),
        from: (val: string) => Number(val),
      },
    })

    sliderInstanceRef.current = slider as unknown as NoUiSliderTarget

    // Cache tooltip element reference after slider creation
    tooltipRef.current = sliderRef.current.querySelector('.noUi-tooltip')

    // Handle value changes - only visual updates, no state changes
    slider.on('update', (values, handle) => {
      const numValue = Number(values[handle])
      updateConnectBar(numValue)
      // Optional callback for visual feedback (does not update global state)
      onUpdateRef.current?.(numValue)
    })

    // Handle change event - only fires when user releases slider
    // This is where we update the global state
    slider.on('change', (values, handle) => {
      const numValue = Number(values[handle])
      onChangeRef.current?.(numValue)
    })

    // Initial connect bar setup - use setTimeout to ensure DOM is ready
    setTimeout(() => {
      updateConnectBar(value)
    }, 0)

    // Cleanup
    return () => {
      slider.destroy()
      connectDivRef.current = null
      tooltipRef.current = null
    }
  }, []) // Only run on mount

  // Update slider value when prop changes
  useEffect(() => {
    if (sliderInstanceRef.current && sliderRef.current) {
      const slider = sliderRef.current as any
      if (slider.noUiSlider) {
        slider.noUiSlider.set(value)
        // Update connect bar when value changes externally
        updateConnectBar(value)
      }
    }
  }, [value, defaultValue, min, max, step])

  return (
    <div className="spending-slider-wrapper">
      <style>{`
        .spending-slider-wrapper .noUi-handle:hover {
          box-shadow: inset 0 0 1px #fff, inset 0 1px 7px #ddd, 0 4px 8px -2px #999;
        }

        .spending-slider-wrapper .noUi-tooltip {
          background: #666;
          color: #fff;
          border: none;
          font-weight: 600;
          padding: 8px 12px;
          font-size: 13px;
        }

        .spending-slider-wrapper .noUi-tooltip[data-state="positive"] {
          background: #4CAF50;
        }

        .spending-slider-wrapper .noUi-tooltip[data-state="negative"] {
          background: #ff4444;
        }
      `}</style>
      <div ref={sliderRef} className="spending-slider spending__slider" />
    </div>
  )
})
