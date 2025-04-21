"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// Import p5 only on client side
let p5: any
if (typeof window !== 'undefined') {
  p5 = require('p5')
}

export default function SynapseNetworkBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !containerRef.current || !p5) return

    // Create the p5 sketch
    const sketch = (p: any) => {
      const nodes: {
        x: number
        y: number
        vx: number
        vy: number
        size: number
        pulseSpeed: number
        pulsePhase: number
      }[] = []
      const numNodes = 150
      const maxDistance = 200
      const nodeColors = [
        [45, 212, 191], // teal-400
        [20, 184, 166], // teal-500
        [13, 148, 136], // teal-600
      ]
      
      // Mouse interaction variables
      let mouseX = p.width / 2
      let mouseY = p.height / 2
      let mouseInfluenceRadius = 250
      let mouseInfluenceStrength = 0.02
      let lastMouseMoveTime = 0
      let mouseActivity = 0 // 0-1 value for mouse activity
      
      p.mouseMoved = () => {
        mouseX = p.mouseX
        mouseY = p.mouseY
        lastMouseMoveTime = p.millis()
        mouseActivity = 1 // Set to full activity when mouse moves
      }

      const drawPulse = (node1: any, node2: any, distance: number) => {
        const pulseCount = 3 // Number of pulses
        for (let k = 0; k < pulseCount; k++) {
          const pulsePosition = (p.frameCount / 30 + k / pulseCount) % 1 // Normalized pulse position
          const x = p.lerp(node1.x, node2.x, pulsePosition)
          const y = p.lerp(node1.y, node2.y, pulsePosition)

          const pulseSize = p.map(distance, 0, maxDistance * 0.7, 12, 4)
          const pulseOpacity = p.map(distance, 0, maxDistance * 0.7, 120, 30)

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
            size: p.random(2.5, 5),
            pulseSpeed: p.random(0.02, 0.05),
            pulsePhase: p.random(0, p.TWO_PI),
          })
        }
      }

      p.draw = () => {
        p.clear() // Transparent background

        // Update mouse activity (gradually decrease when mouse is not moving)
        const timeSinceMouseMove = p.millis() - lastMouseMoveTime
        if (timeSinceMouseMove > 300) { // Start fading after 300ms of inactivity
          mouseActivity = p.max(0, mouseActivity - 0.01) // Gradually decrease
        }

        // Update node positions
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          
          // Apply mouse influence
          if (mouseActivity > 0) {
            // Calculate distance to mouse
            const dx = n.x - mouseX
            const dy = n.y - mouseY
            const distToMouse = p.sqrt(dx * dx + dy * dy)
            
            if (distToMouse < mouseInfluenceRadius) {
              // Create subtle attraction or gentle swirling effect
              const influenceFactor = p.map(distToMouse, 0, mouseInfluenceRadius, mouseInfluenceStrength, 0) * mouseActivity
              
              // Gentle attraction toward mouse
              n.vx += (mouseX - n.x) * influenceFactor * 0.01
              n.vy += (mouseY - n.y) * influenceFactor * 0.01
              
              // Or create a subtle swirl around the mouse
              const angle = p.atan2(dy, dx) + p.PI/2
              n.vx += p.cos(angle) * influenceFactor
              n.vy += p.sin(angle) * influenceFactor
            }
          }
          
          // Normal movement
          n.x += n.vx
          n.y += n.vy
          n.pulsePhase += n.pulseSpeed
          
          // Add slight damping to prevent excessive speed
          n.vx *= 0.99
          n.vy *= 0.99

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
            
            // Check if either node is near the mouse, if so enhance the connection
            const node1DistToMouse = p.dist(nodes[i].x, nodes[i].y, mouseX, mouseY)
            const node2DistToMouse = p.dist(nodes[j].x, nodes[j].y, mouseX, mouseY)
            const nearMouse = (node1DistToMouse < mouseInfluenceRadius || node2DistToMouse < mouseInfluenceRadius)
            
            // Enhance connections near mouse
            const mouseBoost = nearMouse ? mouseActivity * 1.5 : 1

            if (distance < maxDistance) {
              // Calculate opacity based on distance
              const opacity = p.map(distance, 0, maxDistance, 150, 25) * mouseBoost

              // Draw line with gradient
              const colorIndex = i % nodeColors.length
              const [r, g, b] = nodeColors[colorIndex]

              p.stroke(r, g, b, opacity * 0.75)
              p.strokeWeight(p.map(distance, 0, maxDistance, 2, 0.4) * (nearMouse ? 1 + mouseActivity * 0.8 : 1))
              p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)

              // Draw pulse effect along the line
              const pulseProbability = nearMouse ? 0.93 - mouseActivity * 0.1 : 0.96
              if (distance < maxDistance * 0.7 && p.random() > pulseProbability) {
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
          
          // Check if node is near mouse
          const distToMouse = p.dist(n.x, n.y, mouseX, mouseY)
          const nearMouse = distToMouse < mouseInfluenceRadius
          const highlightFactor = nearMouse ? 1 + (mouseActivity * (1 - distToMouse/mouseInfluenceRadius)) : 1
          
          // Outer glow
          const pulseSize = n.size + p.sin(n.pulsePhase) * 2.2
          const glowSize = pulseSize * 4 * highlightFactor

          const glowAlpha = 35 * highlightFactor
          p.fill(r, g, b, glowAlpha)
          p.circle(n.x, n.y, glowSize)

          p.fill(r, g, b, 55 * highlightFactor)
          p.circle(n.x, n.y, glowSize * 0.7)

          // Core
          p.fill(r, g, b, 245)
          p.circle(n.x, n.y, pulseSize * highlightFactor)
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
