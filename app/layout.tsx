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
              try {
                if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
                  var base = '/synapsecare-homepage';
                  
                  // Fix dynamic imports paths
                  var originalCreateElement = document.createElement;
                  document.createElement = function(tag) {
                    var element = originalCreateElement.call(document, tag);
                    if (tag.toLowerCase() === 'script') {
                      var originalSetAttribute = element.setAttribute;
                      element.setAttribute = function(name, value) {
                        if (name === 'src' && value && value.startsWith('/') && !value.startsWith(base)) {
                          value = base + value;
                        }
                        return originalSetAttribute.call(this, name, value);
                      };
                    }
                    return element;
                  };
                  
                  // Fix link hrefs and script srcs
                  var fixElements = function() {
                    var links = document.getElementsByTagName('link');
                    var scripts = document.getElementsByTagName('script');
                    
                    for (var i = 0; i < links.length; i++) {
                      if (links[i].href && !links[i].href.includes(base) && links[i].href.startsWith(window.location.origin)) {
                        links[i].href = links[i].href.replace(window.location.origin, window.location.origin + base);
                      }
                    }
                    
                    for (var j = 0; j < scripts.length; j++) {
                      if (scripts[j].src && !scripts[j].src.includes(base) && scripts[j].src.startsWith(window.location.origin)) {
                        scripts[j].src = scripts[j].src.replace(window.location.origin, window.location.origin + base);
                      }
                    }
                  };
                  
                  fixElements();
                  // Run periodically to catch dynamically added elements
                  setInterval(fixElements, 1000);
                }
              } catch(e) {
                console.error('Error in path fix script:', e);
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