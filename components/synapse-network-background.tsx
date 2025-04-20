"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import p5 from "p5"

export default function SynapseNetworkBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create the p5 sketch
    const sketch = (p: p5) => {
      const nodes: {
        x: number
        y: number
        vx: number
        vy: number
        size: number
        pulseSpeed: number
        pulsePhase: number
      }[] = []
      const numNodes = 100
      const maxDistance = 180
      const nodeColors = [
        [45, 212, 191], // teal-400
        [20, 184, 166], // teal-500
        [13, 148, 136], // teal-600
      ]

      const drawPulse = (node1: any, node2: any, distance: number) => {
        const pulseCount = 3 // Number of pulses
        for (let k = 0; k < pulseCount; k++) {
          const pulsePosition = (p.frameCount / 30 + k / pulseCount) % 1 // Normalized pulse position
          const x = p.lerp(node1.x, node2.x, pulsePosition)
          const y = p.lerp(node1.y, node2.y, pulsePosition)

          const pulseSize = p.map(distance, 0, maxDistance * 0.7, 10, 3)
          const pulseOpacity = p.map(distance, 0, maxDistance * 0.7, 100, 20)

          const colorIndex = k % nodeColors.length
          const [r, g, b] = nodeColors[colorIndex]

          p.fill(r, g, b, pulseOpacity)
          p.noStroke()
          p.ellipse(x, y, pulseSize, pulseSize)
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
        canvas.style("display", "block")
        canvas.style("position", "fixed")
        canvas.style("top", "0")
        canvas.style("left", "0")
        canvas.style("z-index", "-1")

        // Initialize nodes - distribute them across the entire screen
        for (let i = 0; i < numNodes; i++) {
          nodes.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-0.5, 0.5),
            vy: p.random(-0.5, 0.5),
            size: p.random(2, 4),
            pulseSpeed: p.random(0.02, 0.05),
            pulsePhase: p.random(0, p.TWO_PI),
          })
        }
      }

      p.draw = () => {
        p.clear() // Transparent background

        // Update node positions
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          n.pulsePhase += n.pulseSpeed

          // Keep them on screen with a bounce effect
          if (n.x < 0 || n.x > p.width) {
            n.vx *= -1
            n.x = p.constrain(n.x, 0, p.width)
          }
          if (n.y < 0 || n.y > p.height) {
            n.vy *= -1
            n.y = p.constrain(n.y, 0, p.height)
          }
        }

        // Draw connecting lines with gradient effect
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x
            const dy = nodes[i].y - nodes[j].y
            const distance = p.sqrt(dx * dx + dy * dy)

            if (distance < maxDistance) {
              // Calculate opacity based on distance
              const opacity = p.map(distance, 0, maxDistance, 130, 15)

              // Draw line with gradient
              const colorIndex = i % nodeColors.length
              const [r, g, b] = nodeColors[colorIndex]

              p.stroke(r, g, b, opacity * 0.6)
              p.strokeWeight(p.map(distance, 0, maxDistance, 1.8, 0.3))
              p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)

              // Draw pulse effect along the line
              if (distance < maxDistance * 0.7 && p.random() > 0.98) {
                drawPulse(nodes[i], nodes[j], distance)
              }
            }
          }
        }

        // Draw nodes with glow effect
        p.noStroke()
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          const colorIndex = i % nodeColors.length
          const [r, g, b] = nodeColors[colorIndex]

          // Outer glow
          const pulseSize = n.size + p.sin(n.pulsePhase) * 1.8
          const glowSize = pulseSize * 3.5

          p.fill(r, g, b, 25)
          p.circle(n.x, n.y, glowSize)

          p.fill(r, g, b, 45)
          p.circle(n.x, n.y, glowSize * 0.7)

          // Core
          p.fill(r, g, b, 230)
          p.circle(n.x, n.y, pulseSize)
        }
      }

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
      }
    }

    // Create new p5 instance
    sketchRef.current = new p5(sketch, containerRef.current)

    // Cleanup
    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove()
      }
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 w-screen h-screen z-0"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    />
  )
}
