"use client";

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Import with no SSR
const SynapseNetworkBackground = dynamic(
  () => import('./synapse-network-background'),
  { 
    ssr: false,
    loading: () => null
  }
)

export default function ClientSynapseNetwork() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <div className="fixed inset-0 w-full h-full z-[-1]">
      <SynapseNetworkBackground />
    </div>
  )
} 