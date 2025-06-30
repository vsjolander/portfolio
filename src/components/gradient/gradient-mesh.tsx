"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import fragmentShader from "./glsl/fragment.glsl"
import vertexShader from "./glsl/vertex.glsl"

/*
 * Converting colors to proper format
 */
function normalizeColor(hexCode: string | number) {
  let num: number
  if (typeof hexCode === "string") {
    num = parseInt(hexCode, 16)
  } else {
    num = hexCode
  }
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (255 & num) / 255,
  ]
}

interface GradientMeshProps {
  width: number
  height: number
}

const GradientMesh: React.FC<GradientMeshProps> = ({ width, height }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const timeRef = useRef(0)

  // Debug: Log shader content
  useEffect(() => {
    console.log("Vertex shader loaded:", vertexShader ? "✓" : "✗")
    console.log("Fragment shader loaded:", fragmentShader ? "✓" : "✗")
  }, [])

  const conf = useMemo(
    () => ({
      density: [0.12, 0.36],
      seed: 5,
    }),
    []
  )

  // Create geometry with custom attributes
  const geometry = useMemo(() => {
    const xSegments = Math.ceil(width * conf.density[0])
    const ySegments = Math.ceil(height * conf.density[1])

    const geo = new THREE.PlaneGeometry(width, height, xSegments, ySegments)

    // Create uvNorm attribute
    const uvNorm = new Float32Array(geo.attributes.uv.count * 2)
    geo.attributes.uv.array.forEach((item: number, index: number) => {
      uvNorm[index] = 2 * item - 1
    })
    geo.setAttribute("uvNorm", new THREE.Float32BufferAttribute(uvNorm, 2))

    // Rotate geometry
    geo.rotateX(-Math.PI / 2)

    return geo
  }, [width, height, conf.density])

  // Get gradient colors from CSS variables
  const sectionColors = useMemo(() => {
    if (typeof window === "undefined") {
      // Fallback colors for SSR
      return [
        [0.0, 0.31, 0.58], // #004f95
        [0.04, 0.09, 1.0], // #0a16ff
        [0.49, 0.9, 1.0], // #7de5ff
        [0.99, 0.77, 0.38], // #fdc461
      ]
    }

    try {
      // Try to get styles from the canvas wrapper element
      const wrapperElement = document.getElementById("vos-canvas-wrapper")
      const computedStyle = wrapperElement
        ? getComputedStyle(wrapperElement)
        : getComputedStyle(document.documentElement)

      const colors = [
        "--gradientColorZero",
        "--gradientColorOne",
        "--gradientColorTwo",
        "--gradientColorThree",
      ]
        .map((cssPropertyName) => {
          try {
            let hex = computedStyle.getPropertyValue(cssPropertyName).trim()

            // Check if hex is valid and not empty
            if (!hex || hex === "") {
              return null
            }

            // Handle short hex format (#fff -> #ffffff)
            if (hex.length === 4 && hex.startsWith("#")) {
              const hexTemp = hex
                .substring(1)
                .split("")
                .map((hexChar) => hexChar + hexChar)
                .join("")
              hex = `#${hexTemp}`
            }

            // Ensure hex starts with # and has valid length
            if (hex.startsWith("#") && hex.length === 7) {
              return `0x${hex.substring(1)}`
            }

            return null
          } catch (error) {
            console.error(
              `Error processing CSS variable ${cssPropertyName}:`,
              error
            )
            return null
          }
        })
        .filter((hex): hex is string => hex !== null)
        .map((hex) => {
          try {
            return normalizeColor(hex)
          } catch (error) {
            console.error(`Error normalizing color ${hex}:`, error)
            return [0.5, 0.5, 0.5] // gray fallback
          }
        })

      // Return fallback colors if no valid colors found
      if (colors.length === 0) {
        return [
          [0.0, 0.31, 0.58], // #004f95
          [0.04, 0.09, 1.0], // #0a16ff
          [0.49, 0.9, 1.0], // #7de5ff
          [0.99, 0.77, 0.38], // #fdc461
        ]
      }

      return colors
    } catch (error) {
      console.error("Error in sectionColors calculation:", error)
      // Return fallback colors on any error
      return [
        [0.0, 0.31, 0.58], // #004f95
        [0.04, 0.09, 1.0], // #0a16ff
        [0.49, 0.9, 1.0], // #7de5ff
        [0.99, 0.77, 0.38], // #fdc461
      ]
    }
  }, [])

  // Create shader material
  const uniforms = useMemo(() => {
    // Calculate a scale factor based on display size (smaller screens = larger freq)
    const baseFreq = 14e-5
    const baseFreqY = 28e-5
    const scale = Math.min(1.8, Math.max(1, 1000 / width))

    return {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_active_colors: {
        value: new THREE.Vector3(1, 1, 1),
      },
      u_global: {
        value: {
          noiseFreq: new THREE.Vector2(baseFreq * scale, baseFreqY * scale),
          noiseSpeed: 5e-6,
        },
      },
      u_vertDeform: {
        value: {
          incline: Math.sin(0) / Math.cos(0),
          offsetTop: 10,
          offsetBottom: 0,
          noiseFreq: new THREE.Vector2(3 * scale, 4 * scale),
          noiseAmp: 320,
          noiseSpeed: 10,
          noiseFlow: 3,
          noiseSeed: 5,
        },
      },
      u_baseColor: {
        value: new THREE.Vector3(0.2, 0.2, 0.6),
      },
      u_waveLayers: {
        value: sectionColors.map((_item, e) => {
          return {
            color: new THREE.Vector3(
              sectionColors[e]?.[0] || 0.5,
              sectionColors[e]?.[1] || 0.5,
              sectionColors[e]?.[2] || 0.5
            ),
            noiseFreq: new THREE.Vector2(
              (1 + e / sectionColors.length) * scale,
              (1 + e / sectionColors.length) * scale
            ),
            noiseSpeed: 11 + 0.3 * e,
            noiseFlow: 10 + 0.3 * e,
            noiseSeed: conf.seed + 10 * e,
            noiseFloor: 0.1,
            noiseCeil: 0.63 + 0.07 * e,
          }
        }),
      },
    }
  }, [width, height, sectionColors, conf.seed])

  // Update time in animation loop
  useFrame((state, delta) => {
    timeRef.current += Math.min(delta * 1000, 1000 / 15)
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = timeRef.current
    }
  })

  // Update resolution when size changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_resolution.value.set(width, height)
      // Force material to update
      materialRef.current.needsUpdate = true
    }
  }, [width, height])

  // Dispose of old geometry when dimensions change
  useEffect(() => {
    return () => {
      if (geometry) {
        geometry.dispose()
      }
    }
  }, [geometry])

  return (
    <mesh ref={meshRef} geometry={geometry} key={`${width}-${height}`}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default GradientMesh
