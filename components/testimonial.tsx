"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

interface TestimonialProps {
  quote: string
  author: string
  role: string
}

export default function Testimonial({ quote, author, role }: TestimonialProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="bg-gradient-to-br from-teal-950/30 to-black border border-teal-500/20 overflow-hidden relative">
        <div className="absolute top-4 left-4 text-teal-500/30">
          <Quote className="h-12 w-12" />
        </div>
        <CardContent className="pt-12 pb-6 px-6">
          <p className="text-gray-300 mb-6 relative z-10">{quote}</p>
          <div className="border-t border-teal-900/50 pt-4">
            <p className="font-semibold text-white">{author}</p>
            <p className="text-teal-300/70 text-sm">{role}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
