"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"

export default function NeuralNetworkSimulation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 80

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1)
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, // strength
      0.3, // radius
      0.7, // threshold
    )
    composer.addPass(bloomPass)

    // Neural network nodes and connections
    const nodes: THREE.Mesh[] = []
    const nodePositions: THREE.Vector3[] = []
    const nodeVelocities: THREE.Vector3[] = []
    const connections: THREE.Line[] = []

    // Node material
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.9,
    })

    // Connection material
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.2,
      linewidth: 1,
    })

    // Create nodes
    const nodeCount = 50
    const nodeGeometry = new THREE.SphereGeometry(0.4, 16, 16)

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone())

      // Position nodes in a 3D space
      const x = (Math.random() - 0.5) * 100
      const y = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100

      node.position.set(x, y, z)
      scene.add(node)
      nodes.push(node)

      // Store position and velocity for physics simulation
      nodePositions.push(new THREE.Vector3(x, y, z))
      nodeVelocities.push(
        new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05),
      )
    }

    // Create connections between nodes
    const connectionDistance = 30
    const lineGeometry = new THREE.BufferGeometry()

    function updateConnections() {
      // Remove old connections
      connections.forEach((connection) => {
        scene.remove(connection)
      })
      connections.length = 0

      // Create new connections based on current positions
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const distance = nodes[i].position.distanceTo(nodes[j].position)

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance

            const points = [nodes[i].position.clone(), nodes[j].position.clone()]

            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = connectionMaterial.clone()
            material.opacity = opacity * 0.4

            const line = new THREE.Line(geometry, material)
            scene.add(line)
            connections.push(line)
          }
        }
      }
    }

    // Physics simulation parameters
    const bounds = 50
    const dampingFactor = 0.98

    // Animation loop
    function animate() {
      requestAnimationFrame(animate)

      // Update node positions based on physics
      for (let i = 0; i < nodes.length; i++) {
        // Apply velocity
        nodePositions[i].add(nodeVelocities[i])

        // Boundary check and bounce
        if (Math.abs(nodePositions[i].x) > bounds) {
          nodeVelocities[i].x *= -1
          nodePositions[i].x = Math.sign(nodePositions[i].x) * bounds
        }

        if (Math.abs(nodePositions[i].y) > bounds) {
          nodeVelocities[i].y *= -1
          nodePositions[i].y = Math.sign(nodePositions[i].y) * bounds
        }

        if (Math.abs(nodePositions[i].z) > bounds) {
          nodeVelocities[i].z *= -1
          nodePositions[i].z = Math.sign(nodePositions[i].z) * bounds
        }

        // Apply damping
        nodeVelocities[i].multiplyScalar(dampingFactor)

        // Update mesh position
        nodes[i].position.copy(nodePositions[i])
      }

      // Update connections
      updateConnections()

      // Rotate camera slowly around the scene
      camera.position.x = 80 * Math.sin(Date.now() * 0.0001)
      camera.position.z = 80 * Math.cos(Date.now() * 0.0001)
      camera.lookAt(scene.position)

      // Render
      composer.render()
    }

    // Handle window resize
    function handleResize() {
      if (!containerRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
      composer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)

      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }

      // Dispose of geometries and materials
      nodeGeometry.dispose()
      nodeMaterial.dispose()
      connectionMaterial.dispose()

      nodes.forEach((node) => {
        scene.remove(node)
      })

      connections.forEach((connection) => {
        scene.remove(connection)
        connection.geometry.dispose()
        if (connection.material instanceof THREE.Material) {
          connection.material.dispose()
        } else if (Array.isArray(connection.material)) {
          connection.material.forEach((material) => material.dispose())
        }
      })
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-full"
    />
  )
}
