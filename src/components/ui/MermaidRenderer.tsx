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
    <div className="w-full h-full flex flex-col justify-center items-center overflow-auto p-4 bg-purple-900/20 rounded-lg">
      {renderError ? (
        <div className="p-4 text-red-500 bg-red-100 rounded-md w-full">
          <p>Error rendering diagram:</p>
          <pre className="mt-2 p-2 bg-red-50 rounded overflow-auto">{renderError}</pre>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">{code}</pre>
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