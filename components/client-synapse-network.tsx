"use client";

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import with no SSR
const SynapseNetworkBackground = dynamic(
  () => import('./synapse-network-background'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 w-full h-full z-[-1] bg-black bg-gradient-to-b from-teal-950/20 to-black/90 opacity-50" />
    )
  }
)

export default function ClientSynapseNetwork() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="fixed inset-0 w-full h-full z-[-1] bg-black bg-gradient-to-b from-teal-950/20 to-black/90 opacity-50" />
    )
  }
  
  return (
    <div className="fixed inset-0 w-full h-full z-[-1]">
      <SynapseNetworkBackground />
    </div>
  )
} 