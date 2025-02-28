'use client';

/**
 * Component for rendering Mermaid diagrams
 * Uses the mermaid.js library to parse and render diagrams
 */
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Configure mermaid with a dark theme
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  logLevel: 'error',
  themeVariables: {
    // Personalizando colores para un aspecto neón
    primaryColor: '#8B5CF6', // Purple
    primaryTextColor: '#fff',
    primaryBorderColor: '#7C3AED',
    lineColor: '#6EE7B7', // Green
    secondaryColor: '#3B82F6', // Blue
    tertiaryColor: '#1E1E2E', // Background
  },
});

interface MermaidRendererProps {
  code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    // Only attempt to render if we have both code and the container
    if (code && containerRef.current) {
      const renderMermaid = async () => {
        try {
          setRenderError(null);
          
          // Clear any existing content
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            
            // Generate a unique ID for this diagram
            const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
            
            // Create a container div for the diagram
            const container = document.createElement('div');
            container.id = id;
            container.className = 'mermaid';
            container.textContent = code;
            containerRef.current.appendChild(container);
            
            // Render the diagram
            await mermaid.init(undefined, document.querySelectorAll('.mermaid'));
            
            // Add neon effects to the SVG
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.classList.add('neon-svg');
              svgElement.style.filter = 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))';
            }
          }
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          setRenderError(String(error));
        }
      };

      renderMermaid();
    }
  }, [code]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center overflow-auto p-4 bg-purple-900/10 backdrop-blur-sm rounded-lg border border-purple-500/20">
      {renderError ? (
        <div className="p-4 text-red-500 bg-red-900/20 rounded-md w-full border border-red-500/30">
          <p>Error rendering diagram:</p>
          <pre className="mt-2 p-2 bg-red-900/10 rounded overflow-auto">{renderError}</pre>
          <pre className="mt-2 p-2 bg-gray-800/80 rounded overflow-auto text-gray-300">{code}</pre>
        </div>
      ) : (
        <div ref={containerRef} className="w-full flex justify-center items-center">
          {!code && (
            <div className="text-gray-400 italic">
              No diagrama disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
} 