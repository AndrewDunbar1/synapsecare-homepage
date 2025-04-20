"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="bg-gradient-to-br from-teal-950/50 to-black/80 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-2">
          <div className="bg-teal-900/30 p-3 rounded-lg w-fit mb-4">{icon}</div>
          <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors duration-300">
            {title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
