"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Send, Shield, Lock, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function RequestAccessPage() {
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
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <section className="pt-32 pb-20 flex-grow flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-4">
                Request{" "}
                <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                  Early Access
                </span>
              </h1>
              <p className="text-lg text-gray-300 max-w-xl mx-auto">
                Join our beta program and be among the first to leverage AI-powered patient matching for your clinical
                trials.
              </p>
            </div>

            <Card className="bg-gradient-to-br from-black to-teal-950/30 border border-teal-500/20 overflow-hidden shadow-xl">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm text-gray-300">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm text-gray-300">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-gray-300">
                      Work Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm text-gray-300">
                      Organization
                    </label>
                    <Input
                      id="company"
                      placeholder="Your hospital or research institution"
                      className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm text-gray-300">
                      Your Role
                    </label>
                    <Select>
                      <SelectTrigger className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-teal-900/50">
                        <SelectItem value="clinician">Clinician</SelectItem>
                        <SelectItem value="researcher">Clinical Researcher</SelectItem>
                        <SelectItem value="administrator">Hospital Administrator</SelectItem>
                        <SelectItem value="it">IT Professional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="trials" className="text-sm text-gray-300">
                      Number of Clinical Trials You Manage
                    </label>
                    <Select>
                      <SelectTrigger className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-teal-900/50">
                        <SelectItem value="1-5">1-5</SelectItem>
                        <SelectItem value="6-10">6-10</SelectItem>
                        <SelectItem value="11-20">11-20</SelectItem>
                        <SelectItem value="20+">20+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm text-gray-300">
                      How would you use SynapseCare? (Optional)
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your specific needs and use cases..."
                      className="bg-black/50 border-teal-900/50 focus:border-teal-500 focus:ring-teal-500/20 min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      className="mt-1 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300">
                      I agree to receive communications from SynapseCare. Your data will be processed in accordance with
                      our{" "}
                      <Link href="#" className="text-teal-400 hover:text-teal-300 underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <Button className="w-full bg-teal-500 hover:bg-teal-400 text-black font-medium py-6 text-lg">
                    Submit Request <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-teal-900/30 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-gray-300">Secure Submission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-gray-300">Data Privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-400" />
                    <span className="text-sm text-gray-300">24-48hr Response</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-teal-900/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} SynapseCare, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
