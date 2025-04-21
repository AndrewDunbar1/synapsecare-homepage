"use client";

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import the SynapseNetworkBackground component with SSR disabled and no loading fallback
const SynapseNetworkBackground = dynamic(
  () => import('./synapse-network-background'),
  { ssr: false, loading: () => null }
)

export default function ClientSynapseNetwork() {
  // Use state to track if we're in browser environment
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Prevent hydration issues by only rendering on client
  if (!isClient) {
    return null
  }
  
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]">
      <SynapseNetworkBackground />
    </div>
  )
} 