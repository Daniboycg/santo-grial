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
  const [lastClick, setLastClick] = useState(0); // Para detectar doble clic
  const [selectedNode, setSelectedNode] = useState<Element | null>(null);

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
  }, [svgContent]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
    if ((e.target instanceof SVGElement || 
        (e.target as Element).closest('svg'))) {
      e.preventDefault(); // Prevent text selection during drag
      
      // Check for double click
      const now = Date.now();
      if (now - lastClick < 300) {
        // Double click detected - center and reset zoom
        resetZoom();
        setLastClick(0);
        return;
      }
      setLastClick(now);
      
      // Check if clicked on a node
      const target = e.target as Element;
      const nodeElement = target.closest('.node');
      if (nodeElement) {
        setSelectedNode(nodeElement);
        // Podríamos añadir una clase visual para mostrar que está seleccionado
        nodeElement.classList.add('selected-node');
        return;
      }
      
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
        document.body.style.userSelect = 'none'; // Prevent text selection
      }
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    containerRef.current.scrollLeft = scrollPosition.x - dx;
    containerRef.current.scrollTop = scrollPosition.y - dy;
    
    // Update the position state for grid background
    setPosition({
      x: position.x + dx * 0.5, // Parallax effect for grid
      y: position.y + dy * 0.5
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = ''; // Restore text selection
    
    // Clear any selected node
    if (selectedNode) {
      selectedNode.classList.remove('selected-node');
      setSelectedNode(null);
    }
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
  
  // Add keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar + drag for pan (like in Figma)
      if (e.code === 'Space' && containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
      
      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
      
      // Escape to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        onToggleFullscreen();
      }
      
      // F key for fullscreen
      if (e.key === 'f' && !isFullscreen) {
        onToggleFullscreen();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && containerRef.current) {
        containerRef.current.style.cursor = 'auto';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [zoomLevel, isFullscreen, onToggleFullscreen]);
  
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
          className="absolute inset-0 pointer-events-none grid-background"
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
      
      {/* Indicador de arrastre */}
      <div className="drag-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l3 3 3-3M19 9l3 3-3 3M5 15l-3 3 3 3M19 15l3 3-3 3M9 19l3 3 3-3M9 5V3M5 9H3M15 5V3M19 9h2M9 19v2M5 15H3M19 15h2M15 19v2"></path>
        </svg>
        Haz clic y arrastra para mover
      </div>
      
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
      
      {/* Zoom indicator - improved styling */}
      <div
        className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
        style={{
          zIndex: 20,
          border: '1px solid rgba(120, 255, 214, 0.3)'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        {(zoomLevel * 100).toFixed(0)}%
      </div>
      
      {/* Controls - fixed to the bottom with improved styling */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 z-20 flex justify-between items-center px-5 py-2"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(120, 255, 214, 0.2)'
        }}
      >
        {/* Left side controls */}
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
        
        {/* Center controls - new */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/70 px-4 py-1.5 rounded-full border border-cyan-500/20">
          <span className="text-xs text-gray-400">Tip: Usa la rueda o Ctrl+Scroll para hacer zoom</span>
        </div>
        
        {/* Right side controls */}
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
      
      {/* Add keyboard shortcuts help tooltip */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          className="bg-black/70 backdrop-blur-sm p-2 rounded-full text-cyan-400 hover:text-cyan-300 focus:outline-none transition-all border border-cyan-500/20"
          title="Atajos de teclado"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h4v4H2V4z"></path>
            <path d="M10 4h4v4h-4V4z"></path>
            <path d="M18 4h4v4h-4V4z"></path>
            <path d="M2 12h4v4H2v-4z"></path>
            <path d="M10 12h4v4h-4v-4z"></path>
            <path d="M18 12h4v4h-4v-4z"></path>
          </svg>
        </button>
      </div>
      
      {/* Keyboard shortcuts reference - hidden but accessible via screen readers */}
      <div className="sr-only">
        <p>Keyboard shortcuts:</p>
        <ul>
          <li>Ctrl + Scroll: Zoom in/out</li>
          <li>Ctrl + &apos;+&apos;: Zoom in</li>
          <li>Ctrl + &apos;-&apos;: Zoom out</li>
          <li>Ctrl + &apos;0&apos;: Reset view</li>
          <li>Spacebar (mantener): Modo arrastre</li>
          <li>F: Pantalla completa</li>
          <li>ESC: Salir de pantalla completa</li>
          <li>Doble clic: Resetear vista</li>
        </ul>
      </div>
    </div>
  );
};

export default MermaidRenderer; 