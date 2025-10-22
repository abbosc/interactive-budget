import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  formatter?: (value: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  formatter = (v) => v.toLocaleString(),
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const duration = 500
    const steps = 30
    const stepValue = (value - displayValue) / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue((prev) => prev + stepValue)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span className={className}>{formatter(Math.round(displayValue))}</span>
}
