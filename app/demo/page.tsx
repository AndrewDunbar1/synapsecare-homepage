"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Code, Lightbulb, Zap } from "lucide-react"
import TrialMatchingDemo from "@/components/trial-matching-demo"

export default function DemoPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/80 border-b border-teal-500/20">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo-full.png"
                alt="SynapseCare Logo"
                width={280}
                height={80}
                className="h-32 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link href="/request-access">
              <Button className="bg-teal-500 hover:bg-teal-400 text-black font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-teal-500/20 text-teal-300 border-teal-500/30 py-1.5 inline-flex">
              <span className="animate-pulse mr-1.5 h-2 w-2 rounded-full bg-teal-400 inline-block"></span>
              Interactive Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Experience{" "}
              <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                Trial to Patient Matching
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See how our AI-powered platform matches the right patients to your clinical trials in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="pb-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <TrialMatchingDemo />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 relative bg-gradient-to-b from-black to-teal-950/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-teal-950/50 to-black/80 border border-teal-500/20 rounded-xl p-6">
              <div className="bg-teal-900/30 p-3 rounded-lg w-fit mb-4 mx-auto">
                <FileText className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">1. Trial Selection</h3>
              <p className="text-gray-400 text-center">
                Upload your clinical trial criteria or select from our database of active trials.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-950/50 to-black/80 border border-teal-500/20 rounded-xl p-6">
              <div className="bg-teal-900/30 p-3 rounded-lg w-fit mb-4 mx-auto">
                <Code className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">2. AI Processing</h3>
              <p className="text-gray-400 text-center">
                Our algorithms analyze patient data against trial criteria to identify potential matches.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-950/50 to-black/80 border border-teal-500/20 rounded-xl p-6">
              <div className="bg-teal-900/30 p-3 rounded-lg w-fit mb-4 mx-auto">
                <Lightbulb className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">3. Results & Insights</h3>
              <p className="text-gray-400 text-center">
                Review matching patients, match scores, and reasons for non-matches to optimize recruitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-teal-900/30 to-teal-800/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-teal-500/20 max-w-5xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to implement this in your{" "}
                <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                  clinical workflow
                </span>
                ?
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
                Get early access to SynapseCare's full platform and transform your trial recruitment process.
              </p>
              <Link href="/request-access">
                <Button className="bg-teal-500 hover:bg-teal-400 text-black font-medium text-lg px-8 py-6">
                  Request Access <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-teal-900/30 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} SynapseCare, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
