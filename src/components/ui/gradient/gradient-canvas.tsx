"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import GradientMesh from "./gradient-mesh"

// Import CSS styles
import "./gradient.css"

interface GradientCanvasProps {
  className?: string
  width?: number
  height?: number
  children?: React.ReactNode
}

const GradientCanvas: React.FC<GradientCanvasProps> = ({
  className = "",
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    // Initial dimensions
    updateDimensions()

    // Handle resize
    const handleResize = () => {
      updateDimensions()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div id="vos-canvas-wrapper" ref={wrapperRef} className={className}>
      <Canvas
        camera={{
          fov: 75,
          near: -1000,
          far: 10000,
          position: [
            1.2568600794819134, -3.4598678247167003, 20.504868138471284,
          ],
          zoom: 1.3,
        }}
        orthographic
        gl={{ antialias: true, alpha: true }}
      >
        <GradientMesh width={dimensions.width} height={dimensions.height} />
      </Canvas>
      {children}
    </div>
  )
}

export default GradientCanvas
