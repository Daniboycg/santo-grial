'use client';

/**
 * Component for rendering Mermaid diagrams
 * Uses the mermaid.js library to parse and render diagrams
 */
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  FaPlus, FaMinus, FaDownload, FaExpand, FaCompress, FaHome 
} from 'react-icons/fa';

// Configure mermaid with a dark theme
mermaid.initialize({
  startOnLoad: false, // Changed from true to false to have more control
  theme: 'dark',
  securityLevel: 'loose',
  logLevel: 'error',
  // Instead of suppressErrors, we'll handle errors manually
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

/**
 * MermaidRenderer component
 * Renders a mermaid diagram with controls for zooming and downloading
 */
interface MermaidRendererProps {
  code: string;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const MermaidRenderer = ({ code, onToggleFullscreen, isFullscreen }: MermaidRendererProps) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [renderError, setRenderError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    async function renderDiagram() {
      if (!code) return;
      
      try {
        setRenderError(null);
        
        mermaid.initialize({
          startOnLoad: true,
          theme: 'dark',
          securityLevel: 'loose',
        });
        
        const { svg } = await mermaid.render('mermaid-diagram', code);
        setSvgContent(svg);
        
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        setRenderError(error instanceof Error ? error.message : String(error));
      }
    }
    
    renderDiagram();
  }, [code]);
  
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;
    
    containerRef.current.innerHTML = svgContent;
    
    // Access the SVG element
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;
    
    // Make sure SVG is responsive and take full height of container
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '100%');
    
    // Ensure the SVG has a viewBox for proper scaling
    const bbox = svgElement.getBBox?.() || { width: 1000, height: 1000 };
    svgElement.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
    
    // Apply styling to the SVG elements for better visibility
    const nodes = svgElement.querySelectorAll('.node');
    nodes.forEach((node: Element) => {
      // Add a subtle glow effect to nodes
      node.setAttribute('filter', 'drop-shadow(0 0 3px rgba(120, 255, 214, 0.7))');
      
      // Add hover effects for better interactivity
      node.classList.add('diagram-node');
    });
    
    // Apply styling to edges
    const edges = svgElement.querySelectorAll('.edge');
    edges.forEach((edge: Element) => {
      const stroke = edge.getAttribute('stroke');
      if (stroke && !stroke.includes('none')) {
        // Make edges more visible
        const paths = edge.querySelectorAll('path');
        paths.forEach((path: Element) => {
          // Increase edge visibility with a subtle glow
          path.setAttribute('stroke-width', '1.5');
          path.setAttribute('filter', 'drop-shadow(0 0 1px rgba(120, 255, 214, 0.5))');
          path.classList.add('diagram-edge');
        });
      }
    });
    
    // Make the SVG draggable
    svgElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add custom styling for the SVG via a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .diagram-node {
        transition: filter 0.2s ease;
        cursor: pointer;
      }
      .diagram-node:hover {
        filter: drop-shadow(0 0 8px rgba(120, 255, 214, 0.9)) !important;
      }
      .diagram-edge {
        transition: all 0.2s ease;
      }
      .diagram-edge:hover {
        stroke-width: 2.5;
        filter: drop-shadow(0 0 3px rgba(120, 255, 214, 0.8)) !important;
      }
    `;
    svgElement.appendChild(styleElement);
    
    return () => {
      svgElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [svgContent]);
  
  // Update zoom level
  useEffect(() => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;
    
    svgElement.style.transform = `scale(${zoomLevel})`;
    svgElement.style.transformOrigin = 'center center';
  }, [zoomLevel]);
  
  // Add wheel event for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only zoom if Ctrl key is pressed (like Figma)
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = -e.deltaY * 0.001;
        setZoomLevel(prev => {
          const newZoom = Math.max(0.1, Math.min(4, prev + zoomFactor));
          return newZoom;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);
  
  // Mouse event handlers for dragging
  const handleMouseDown = (e: MouseEvent) => {
    if (e.target instanceof SVGElement || 
        (e.target as Element).closest('svg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Store current scroll position
      if (containerRef.current) {
        setScrollPosition({
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop
        });
      }
      
      // Change cursor to grabbing
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
      
      e.preventDefault(); // Prevent text selection during drag
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    containerRef.current.scrollLeft = scrollPosition.x - dx;
    containerRef.current.scrollTop = scrollPosition.y - dy;
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle zoom in/out with smoother transitions
  const zoomIn = () => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev * 1.2, 4);
      return parseFloat(newZoom.toFixed(2));
    });
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev / 1.2, 0.1);
      return parseFloat(newZoom.toFixed(2));
    });
  };
  
  const resetZoom = () => {
    setZoomLevel(1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };
  
  // Handle download diagram
  const downloadDiagram = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;
    
    const canvas = document.createElement('canvas');
    const rect = svgElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create image from SVG
    const data = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    img.onload = () => {
      // Fill with a dark background
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Convert to data URL and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'workflow-diagram.png';
      link.href = dataUrl;
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  };
  
  if (renderError) {
    return (
      <div className="p-4 text-red-500 bg-red-900/20 rounded-md w-full border border-red-500/30">
        <p>Error rendering diagram:</p>
        <pre className="mt-2 p-2 bg-red-900/10 rounded overflow-auto">{renderError}</pre>
        <pre className="mt-2 p-2 bg-gray-800/80 rounded overflow-auto text-gray-300">{code}</pre>
      </div>
    );
  }
  
  return (
    <div 
      className="relative w-full h-full"
      style={{ 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Background grid for better spatial awareness - conditionally rendered */}
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(60, 60, 100, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(60, 60, 100, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
            backgroundPosition: `${position.x}px ${position.y}px`,
            zIndex: 0
          }}
        />
      )}
      
      {/* Diagram container with scrolling and zooming */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          minHeight: 'calc(100% - 65px)', // Increased height for controls
          padding: '1rem',
          zIndex: 1,
          position: 'relative'
        }}
      />
      
      {/* Zoom indicator */}
      <div
        className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm"
        style={{
          zIndex: 20,
          border: '1px solid rgba(120, 255, 214, 0.3)'
        }}
      >
        {(zoomLevel * 100).toFixed(0)}%
      </div>
      
      {/* Controls - fixed to the bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 z-20 flex justify-between items-center px-5 py-2"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(120, 255, 214, 0.2)'
        }}
      >
        {/* Zoom controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={zoomOut}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all tooltip-trigger p-2 hover:bg-gray-800/50 rounded-full" 
            aria-label="Reducir zoom"
          >
            <FaMinus className="w-5 h-5" />
            <span className="tooltip-text">Reducir (Ctrl + -)</span>
          </button>
          <span className="text-gray-200 text-base font-medium min-w-[50px] text-center">{Math.round(zoomLevel * 100)}%</span>
          <button 
            onClick={zoomIn}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all tooltip-trigger p-2 hover:bg-gray-800/50 rounded-full" 
            aria-label="Aumentar zoom"
          >
            <FaPlus className="w-5 h-5" />
            <span className="tooltip-text">Aumentar (Ctrl + +)</span>
          </button>
          <button 
            onClick={resetZoom}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all tooltip-trigger p-2 hover:bg-gray-800/50 rounded-full ml-1" 
            aria-label="Restablecer vista"
          >
            <FaHome className="w-5 h-5" />
            <span className="tooltip-text">Restablecer vista (Ctrl + 0)</span>
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`ml-1 ${showGrid ? 'text-cyan-400' : 'text-gray-500'} hover:text-cyan-300 focus:outline-none transition-all tooltip-trigger p-2 hover:bg-gray-800/50 rounded-full`}
            aria-label="Mostrar/ocultar cuadrícula"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h7v7H3z"></path>
              <path d="M14 3h7v7h-7z"></path>
              <path d="M14 14h7v7h-7z"></path>
              <path d="M3 14h7v7H3z"></path>
            </svg>
            <span className="tooltip-text">Mostrar/ocultar cuadrícula</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={downloadDiagram}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all tooltip-trigger p-2 hover:bg-gray-800/50 rounded-full" 
            aria-label="Descargar diagrama"
          >
            <FaDownload className="w-5 h-5" />
            <span className="tooltip-text">Descargar como PNG</span>
          </button>
          <button 
            onClick={onToggleFullscreen}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all tooltip-trigger p-2 hover:bg-gray-800/50 rounded-full" 
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
            <span className="tooltip-text">{isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}</span>
          </button>
        </div>
      </div>
      
      {/* Add keyboard shortcuts */}
      <div className="sr-only">
        <p>Keyboard shortcuts:</p>
        <ul>
          <li>Ctrl + Scroll: Zoom in/out</li>
          <li>Ctrl + '+': Zoom in</li>
          <li>Ctrl + '-': Zoom out</li>
          <li>Ctrl + '0': Reset view</li>
        </ul>
      </div>
    </div>
  );
};

export default MermaidRenderer; 