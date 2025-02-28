'use client';

/**
 * Component for rendering Mermaid diagrams
 * Uses the mermaid.js library to parse and render diagrams
 */
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  FaPlus, FaMinus, FaDownload, FaExpand, FaCompress 
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
        });
      }
    });
    
    // Make the SVG draggable
    svgElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
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
  
  // Mouse event handlers for dragging
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Store current scroll position
    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
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
  
  // Handle zoom in/out
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoomLevel(1);
  
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
      {/* Diagram container with scrolling and zooming */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          minHeight: 'calc(100% - 50px)', // Reserve space for controls
          padding: zoomLevel > 1 ? '1rem' : 0
        }}
      />
      
      {/* Controls - fixed to the bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-12 z-20 flex justify-between items-center px-4 py-2"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(120, 255, 214, 0.1)'
        }}
      >
        {/* Zoom controls */}
        <div className="flex gap-3">
          <button 
            onClick={zoomOut}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all" 
            aria-label="Reducir zoom"
          >
            <FaMinus className="w-4 h-4" />
          </button>
          <div className="text-gray-400 text-sm">
            {Math.round(zoomLevel * 100)}%
          </div>
          <button 
            onClick={zoomIn}
            className="text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all" 
            aria-label="Aumentar zoom"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Download and fullscreen controls */}
        <div className="flex gap-3">
          <button 
            onClick={downloadDiagram}
            className="text-purple-400 hover:text-purple-300 focus:outline-none transition-all" 
            aria-label="Descargar como PNG"
          >
            <FaDownload className="w-4 h-4" />
          </button>
          <button 
            onClick={onToggleFullscreen}
            className="text-purple-400 hover:text-purple-300 focus:outline-none transition-all" 
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MermaidRenderer; 