import Image from "next/image"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-teal-900/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Synapse Care Logo" width={32} height={32} className="h-8 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                Synapse Care
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Synapse Care combines advanced neural networks with healthcare expertise to deliver personalized,
              predictive care solutions that transform patient outcomes.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-teal-300 transition">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-900/30 mt-12 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Synapse Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
