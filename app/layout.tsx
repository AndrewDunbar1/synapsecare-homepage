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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="fix-paths" strategy="beforeInteractive">
          {`
            (function() {
              if (window.location.hostname !== 'localhost') {
                var base = document.createElement('base');
                base.href = '/synapsecare-homepage/';
                document.head.prepend(base);
              }
            })();
          `}
        </Script>
      </head>
      <body className="bg-black min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}