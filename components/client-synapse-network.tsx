"use client";

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Import the SynapseNetworkBackground component with SSR disabled
const SynapseNetworkBackground = dynamic(
  () => import('./synapse-network-background'),
  { ssr: false }
)

export default function ClientSynapseNetwork() {
  const [isMounted, setIsMounted] = useState(false)
  
  // Only render on client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Prevent hydration mismatch by only rendering the component client-side
  if (!isMounted) {
    return null // Return null during server rendering and initial mount
  }
  
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]">
      <SynapseNetworkBackground />
    </div>
  )
} 