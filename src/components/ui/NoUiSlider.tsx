import { useEffect, useRef, useCallback, memo } from 'react'
import noUiSlider from 'nouislider'
import type { API as NoUiSliderTarget } from 'nouislider'
import { formatNumber } from '../../lib/formatters'
import './NoUiSlider.css'

// Custom throttle function with leading edge (fires immediately, then throttles)
function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  let lastRan: number | null = null

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now()

    if (lastRan === null) {
      // First call - execute immediately
      func(...args)
      lastRan = now
    } else {
      // Clear existing timeout
      if (timeout) {
        window.clearTimeout(timeout)
      }

      // Calculate time since last execution
      const timeSinceLastRun = now - lastRan

      if (timeSinceLastRun >= wait) {
        // Enough time has passed - execute immediately
        func(...args)
        lastRan = now
      } else {
        // Schedule execution for later
        timeout = window.setTimeout(() => {
          func(...args)
          lastRan = Date.now()
          timeout = null
        }, wait - timeSinceLastRun)
      }
    }
  }
}

interface NoUiSliderProps {
  min: number
  max: number
  value: number
  defaultValue: number
  onChange: (value: number) => void
  color?: string
  step?: number
}

export const NoUiSlider = memo(function NoUiSlider({
  min,
  max,
  value,
  defaultValue,
  onChange,
  step = 1,
}: NoUiSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const sliderInstanceRef = useRef<NoUiSliderTarget | null>(null)
  const rafRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)

  // Keep the ref updated with the latest onChange callback
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Create throttled version of onChange for slide events (150ms throttle for smoother performance)
  const throttledOnChange = useCallback(
    throttle((value: number) => {
      onChangeRef.current?.(value)
    }, 150),
    []
  )

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

    // Handle value changes with smooth updates
    slider.on('update', (values, handle) => {
      const numValue = Number(values[handle])

      // Use requestAnimationFrame for smooth visual updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        updateConnectBar(numValue)
      })
    })

    // Handle slide event with throttled onChange (reduces state updates during drag)
    slider.on('slide', (values, handle) => {
      const numValue = Number(values[handle])
      throttledOnChange(numValue)
    })

    // Handle change event with immediate onChange (accurate final value on release)
    slider.on('change', (values, handle) => {
      const numValue = Number(values[handle])
      onChangeRef.current?.(numValue)
    })

    // Initial connect bar setup
    updateConnectBar(value)

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      slider.destroy()
    }
  }, []) // Only run on mount

  // Function to update custom connect bar (optimized to reuse DOM elements)
  const updateConnectBar = (currentValue: number) => {
    if (!sliderRef.current) return

    const range = max - min
    const defaultPercent = ((defaultValue - min) / range) * 100
    const currentPercent = ((currentValue - min) / range) * 100

    const isNegative = currentValue < defaultValue
    const isAtDefault = Math.abs(currentValue - defaultValue) <= step / 2

    // Update tooltip color
    const tooltip = sliderRef.current.querySelector('.noUi-tooltip')
    if (tooltip) {
      tooltip.classList.remove('positive', 'negative')
      if (!isAtDefault) {
        tooltip.classList.add(isNegative ? 'negative' : 'positive')
      }
    }

    // Get or create connect bar element
    let connectDiv = sliderRef.current.querySelector('.custom-connect') as HTMLElement

    if (!isAtDefault) {
      // Create element if it doesn't exist
      if (!connectDiv) {
        connectDiv = document.createElement('div')
        connectDiv.className = 'custom-connect'
        connectDiv.style.cssText = `
          position: absolute;
          top: 0;
          height: 100%;
          border-radius: 3px;
          z-index: 0;
          pointer-events: none;
        `
        const base = sliderRef.current.querySelector('.noUi-base')
        if (base) {
          base.appendChild(connectDiv)
        }
      }

      // Update position and size using CSS properties
      const left = isNegative ? currentPercent : defaultPercent
      const width = Math.abs(currentPercent - defaultPercent)

      connectDiv.style.left = `${left}%`
      connectDiv.style.width = `${width}%`
      connectDiv.style.background = isNegative ? '#ff4444' : '#4CAF50'
      connectDiv.style.display = 'block'
    } else if (connectDiv) {
      // Hide instead of removing
      connectDiv.style.display = 'none'
    }
  }

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
  }, [value])

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
          transition: background-color 0.2s ease;
        }

        .spending-slider-wrapper .noUi-tooltip.positive {
          background: #4CAF50;
        }

        .spending-slider-wrapper .noUi-tooltip.negative {
          background: #ff4444;
        }
      `}</style>
      <div ref={sliderRef} className="spending-slider spending__slider" />
    </div>
  )
})
