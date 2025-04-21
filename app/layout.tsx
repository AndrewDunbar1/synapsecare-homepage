import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

export const metadata: Metadata = {
  title: "SynapseCare",
  description: "AI-powered clinical trial patient matching platform",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script id="fix-paths" strategy="beforeInteractive">
          {`
            (function() {
              if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
                var base = '/synapsecare-homepage';
                var links = document.getElementsByTagName('link');
                var scripts = document.getElementsByTagName('script');
                
                // Fix link hrefs
                for (var i = 0; i < links.length; i++) {
                  if (links[i].href && links[i].href.indexOf(base) === -1 && links[i].href.indexOf('http') === 0) {
                    links[i].href = links[i].href.replace(window.location.origin, window.location.origin + base);
                  }
                }
                
                // Fix script srcs
                for (var j = 0; j < scripts.length; j++) {
                  if (scripts[j].src && scripts[j].src.indexOf(base) === -1 && scripts[j].src.indexOf('http') === 0) {
                    scripts[j].src = scripts[j].src.replace(window.location.origin, window.location.origin + base);
                  }
                }
              }
            })();
          `}
        </Script>
      </head>
      <body className="bg-black min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}