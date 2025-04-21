"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

// Add type definition for global p5 - needed for TypeScript build
declare global {
  interface Window {
    p5: any; // Use 'any' for simplicity, or find/create more specific types if desired
  }
}

export default function SynapseNetworkBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<any>(null); // Ref to store the p5 instance
  const [isClientReady, setIsClientReady] = useState(false); // State to track if client & p5 are ready

  useEffect(() => {
    // Indicate component has mounted on client
    setIsClientReady(true);

    // Guard against running logic if component unmounts early or no container
    if (!containerRef.current) return;

    // Reference container for cleanup and attachment
    const container = containerRef.current;
    let script: HTMLScriptElement | null = null; // Keep track of the script tag

    // Function to initialize p5 sketch
    const initP5 = () => {
      if (!container || typeof window.p5 === 'undefined') {
        console.warn("p5 script not ready or container missing.");
        return;
      }

      // Ensure no duplicate instance
      if (p5InstanceRef.current) {
        try {
           p5InstanceRef.current.remove();
        } catch (e) {
           console.warn("Error removing previous p5 instance:", e);
        }
        p5InstanceRef.current = null;
      }

      const p5 = window.p5; // Use the globally loaded p5

      const sketch = (p: any) => {
        const nodes: Array<{ x: number; y: number; vx: number; vy: number; size: number; pulseSpeed: number; pulsePhase: number; }> = [];
        const numNodes = 150;
        const maxDistance = 200;
        const nodeColors = [
          [45, 212, 191], // teal-400
          [20, 184, 166], // teal-500
          [13, 148, 136], // teal-600
        ];
        let mouseX = p.width / 2, mouseY = p.height / 2, mouseInfluenceRadius = 250, mouseInfluenceStrength = 0.02, lastMouseMoveTime = 0, mouseActivity = 0;

        p.mouseMoved = () => {
          mouseX = p.mouseX;
          mouseY = p.mouseY;
          lastMouseMoveTime = p.millis();
          mouseActivity = 1;
        };

        const drawPulse = (node1: any, node2: any, distance: number) => {
          const pulseCount = 3;
          for (let k = 0; k < pulseCount; k++) {
            const pulsePosition = (p.frameCount / 30 + k / pulseCount) % 1;
            const x = p.lerp(node1.x, node2.x, pulsePosition);
            const y = p.lerp(node1.y, node2.y, pulsePosition);
            const pulseSize = p.map(distance, 0, maxDistance * 0.7, 12, 4);
            const pulseOpacity = p.map(distance, 0, maxDistance * 0.7, 120, 30);
            const colorIndex = k % nodeColors.length;
            const [r, g, b] = nodeColors[colorIndex];
            p.fill(r, g, b, pulseOpacity);
            p.noStroke();
            p.ellipse(x, y, pulseSize, pulseSize);
          }
        };

        p.setup = () => {
          const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
          canvas.parent(container); // Attach canvas specifically to the container
          canvas.style("display", "block");
          canvas.style("position", "absolute");
          canvas.style("top", "0");
          canvas.style("left", "0");
          canvas.style("z-index", "-1");

          for (let i = 0; i < numNodes; i++) {
            nodes.push({
              x: p.random(p.width), y: p.random(p.height),
              vx: p.random(-0.5, 0.5), vy: p.random(-0.5, 0.5),
              size: p.random(2.5, 5),
              pulseSpeed: p.random(0.02, 0.05), pulsePhase: p.random(0, p.TWO_PI),
            });
          }
        };

        p.draw = () => {
          p.clear();
          const timeSinceMouseMove = p.millis() - lastMouseMoveTime;
          if (timeSinceMouseMove > 300) {
            mouseActivity = p.max(0, mouseActivity - 0.01);
          }

          for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            if (mouseActivity > 0) {
              const dx = n.x - mouseX, dy = n.y - mouseY;
              const distToMouse = p.sqrt(dx * dx + dy * dy);
              if (distToMouse < mouseInfluenceRadius) {
                const influenceFactor = p.map(distToMouse, 0, mouseInfluenceRadius, mouseInfluenceStrength, 0) * mouseActivity;
                const angle = p.atan2(dy, dx) + p.PI / 2;
                n.vx += p.cos(angle) * influenceFactor;
                n.vy += p.sin(angle) * influenceFactor;
              }
            }
            n.x += n.vx; n.y += n.vy; n.pulsePhase += n.pulseSpeed;
            n.vx *= 0.99; n.vy *= 0.99;
            if (n.x < 0 || n.x > p.width) { n.vx *= -1; n.x = p.constrain(n.x, 0, p.width); }
            if (n.y < 0 || n.y > p.height) { n.vy *= -1; n.y = p.constrain(n.y, 0, p.height); }
          }

          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
              const distance = p.sqrt(dx * dx + dy * dy);
              const node1DistToMouse = p.dist(nodes[i].x, nodes[i].y, mouseX, mouseY);
              const node2DistToMouse = p.dist(nodes[j].x, nodes[j].y, mouseX, mouseY);
              const nearMouse = (node1DistToMouse < mouseInfluenceRadius || node2DistToMouse < mouseInfluenceRadius);
              const mouseBoost = nearMouse ? mouseActivity * 1.5 : 1;

              if (distance < maxDistance) {
                const opacity = p.map(distance, 0, maxDistance, 150, 25) * mouseBoost;
                const colorIndex = i % nodeColors.length;
                const [r, g, b] = nodeColors[colorIndex];
                p.stroke(r, g, b, opacity * 0.75);
                p.strokeWeight(p.map(distance, 0, maxDistance, 2, 0.4) * (nearMouse ? 1 + mouseActivity * 0.8 : 1));
                p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                const pulseProbability = nearMouse ? 0.93 - mouseActivity * 0.1 : 0.96;
                if (distance < maxDistance * 0.7 && p.random() > pulseProbability) {
                  drawPulse(nodes[i], nodes[j], distance);
                }
              }
            }
          }

          p.noStroke();
          for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            const colorIndex = i % nodeColors.length;
            const [r, g, b] = nodeColors[colorIndex];
            const distToMouse = p.dist(n.x, n.y, mouseX, mouseY);
            const nearMouse = distToMouse < mouseInfluenceRadius;
            const highlightFactor = nearMouse ? 1 + (mouseActivity * (1 - distToMouse / mouseInfluenceRadius)) : 1;
            const pulseSize = n.size + p.sin(n.pulsePhase) * 2.2;
            const glowSize = pulseSize * 4 * highlightFactor;
            const glowAlpha = 35 * highlightFactor;
            p.fill(r, g, b, glowAlpha);
            p.circle(n.x, n.y, glowSize);
            p.fill(r, g, b, 55 * highlightFactor);
            p.circle(n.x, n.y, glowSize * 0.7);
            p.fill(r, g, b, 245);
            p.circle(n.x, n.y, pulseSize * highlightFactor);
          }
        };

        p.windowResized = () => {
           // Use container dimensions for resizing
           if (container) {
             p.resizeCanvas(container.clientWidth, container.clientHeight);
           } else {
             p.resizeCanvas(p.windowWidth, p.windowHeight); // Fallback
           }
        };
      };

      // Create the p5 instance and store its reference
      p5InstanceRef.current = new p5(sketch);
    };

    // --- Script Loading Logic --- 
    const scriptId = 'p5-global-script';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript && typeof window.p5 !== 'undefined') {
      // Script already exists and p5 is loaded
      initP5();
    } else if (existingScript && !existingScript.dataset.loaded) {
       // Script exists but might still be loading
       existingScript.addEventListener('load', initP5);
       existingScript.addEventListener('error', () => console.error("p5.js script failed to load."));
    } else if (!existingScript) {
      // Script doesn't exist, create and load it
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js';
      script.async = true;
      script.onload = () => {
        script!.dataset.loaded = 'true'; // Mark as loaded
        initP5();
      };
      script.onerror = () => console.error("p5.js script failed to load.");
      document.body.appendChild(script);
    }
    // --- End Script Loading Logic ---

    // Cleanup function
    return () => {
      console.log("Cleaning up p5 instance");
      // Remove p5 instance on component unmount
      if (p5InstanceRef.current) {
         try {
            p5InstanceRef.current.remove();
         } catch (e) {
            console.warn("Error removing p5 instance during cleanup:", e);
         }
         p5InstanceRef.current = null;
      }
      // We generally don't remove the global script tag itself upon unmount
      // as other components might need it or it causes issues on fast refresh.
       if (script && script.parentNode) {
          // Optionally remove the event listener if script exists but component unmounts before load
          // script.removeEventListener('load', initP5);
       }
    };
  }, [isClientReady]); // Re-run effect if needed, though it gates on client-side mount

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isClientReady ? 1 : 0 }} // Use isClientReady for initial fade-in
      transition={{ duration: 0.75 }} // Adjust timing as needed
      className="fixed inset-0 w-full h-full z-[-1] pointer-events-none" // Ensure it doesn't block interactions
      style={{ position: "fixed" }} // Optional: Explicitly set position
    />
  );
}
