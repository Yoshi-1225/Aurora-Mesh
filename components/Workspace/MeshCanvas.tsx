
import React, { useRef, useEffect, memo } from 'react';
import { AuroraNode, AppSettings } from '../../types';
import { auroraRenderer } from '../../renderer';

interface Props {
    nodes: AuroraNode[];
    settings: AppSettings;
    nodesRef: React.MutableRefObject<AuroraNode[]>;
    selectedNodeIndex: number;
    onSelectNode: (index: number) => void;
    onUpdateNodePos: (index: number, x: number, y: number) => void;
}

// -----------------------------------------------------------------------------
// Constants & Styles
// -----------------------------------------------------------------------------

// Safe zone padding to prevent Artboard from overlapping with floating UI bars
// Top Bar ~72px, Bottom Bar ~100px (including margins)
const SAFE_PADDING = 'pt-28 pb-36 px-10';

const getAspectRatio = (ratio: string): number => {
    if (ratio === 'fullscreen') return 0;
    const [w, h] = ratio.split(':').map(Number);
    return w / h;
};

// -----------------------------------------------------------------------------
// Sub-Components
// -----------------------------------------------------------------------------

interface NodeMarkersProps {
    nodes: AuroraNode[];
    selectedNodeIndex: number;
    markerRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
    onPointerDown: (e: React.MouseEvent, index: number) => void;
}

// Memoized Markers Layer to prevent unnecessary React re-renders
const NodeMarkers = memo(({ nodes, selectedNodeIndex, markerRefs, onPointerDown }: NodeMarkersProps) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none">
            {nodes.map((node, i) => (
                <div
                    key={node.id}
                    ref={(el) => {
                        if (el) markerRefs.current.set(node.id, el);
                        else markerRefs.current.delete(node.id);
                    }}
                    onMouseDown={(e) => onPointerDown(e, i)}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute w-5 h-5 rounded-full border-2 shadow-sm cursor-grab transition-transform will-change-transform pointer-events-auto
                        ${i === selectedNodeIndex 
                            ? 'border-white scale-125 z-30 ring-2 ring-cyan-500 box-content' 
                            : 'border-white/50 z-20 hover:border-white'}`}
                    style={{
                        backgroundColor: node.color,
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: `translate(-50%, -50%)`
                    }}
                />
            ))}
        </div>
    );
});

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export const MeshCanvas: React.FC<Props> = ({ 
    nodes, 
    settings, 
    nodesRef, 
    selectedNodeIndex, 
    onSelectNode, 
    onUpdateNodePos 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const animationFrameId = useRef<number>(0);
    const markerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    
    // Cache settings in ref for Animation Loop (performance)
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    // Interaction State
    const draggingRef = useRef<{ index: number } | null>(null);
    const isDraggingRef = useRef<boolean>(false);

    // 1. Responsive Layout Logic
    const isFullscreen = settings.aspectRatio === 'fullscreen';

    // 2. Animation & Render Loop
    useEffect(() => {
        const loop = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            const main = mainRef.current;
            const currentSettings = settingsRef.current;

            if (canvas && container && main) {
                // Layout Calculation to fix resizing bugs
                // We manually calculate the best fit dimensions instead of relying on CSS auto
                const mainRect = main.getBoundingClientRect();
                const style = window.getComputedStyle(main);
                const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
                const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
                
                const availW = mainRect.width - paddingX;
                const availH = mainRect.height - paddingY;
                
                let targetW = availW;
                let targetH = availH;

                if (currentSettings.aspectRatio !== 'fullscreen') {
                    const ratio = getAspectRatio(currentSettings.aspectRatio);
                    // "Contain" logic: Fit rectangle into available space
                    if (availW / availH > ratio) {
                        // Space is wider than target -> constrain by height
                        targetW = availH * ratio;
                        targetH = availH;
                    } else {
                        // Space is taller than target -> constrain by width
                        targetW = availW;
                        targetH = availW / ratio;
                    }
                }

                // Apply calculated dimensions to container
                // Using styles directly avoids the "stuck" state of CSS aspect-ratio with auto width
                // We update this every frame to handle window resizing and padding transitions smoothly
                container.style.width = `${targetW}px`;
                container.style.height = `${targetH}px`;

                // Sync Canvas Resolution
                const dpr = window.devicePixelRatio || 1;
                const resW = Math.round(targetW * dpr);
                const resH = Math.round(targetH * dpr);

                if (canvas.width !== resW || canvas.height !== resH) {
                    canvas.width = resW;
                    canvas.height = resH;
                }

                // Draw Aurora
                auroraRenderer.draw(
                    canvas,
                    nodesRef.current,
                    currentSettings
                );

                // Sync DOM Markers (High Performance)
                nodesRef.current.forEach((node) => {
                    const el = markerRefs.current.get(node.id);
                    if (el) {
                        el.style.left = `${node.x}%`;
                        el.style.top = `${node.y}%`;
                    }
                });
            }
            animationFrameId.current = requestAnimationFrame(loop);
        };
        
        loop();
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, []); 

    // 3. Interaction Handlers
    const handlePointerDown = (e: React.MouseEvent, index: number) => {
        e.stopPropagation(); 
        draggingRef.current = { index };
        isDraggingRef.current = false;
        onSelectNode(index);
    };

    const handleContainerMouseDown = () => {
        isDraggingRef.current = false;
    };

    const handlePointerMove = (e: React.MouseEvent) => {
        if (!draggingRef.current || !containerRef.current) return;
        
        isDraggingRef.current = true;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate percentage position
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        
        onUpdateNodePos(draggingRef.current.index, x, y);
    };

    const handlePointerUp = () => {
        draggingRef.current = null;
    };

    const handleContainerClick = () => {
        if (!isDraggingRef.current) {
            onSelectNode(-1);
        }
    };

    return (
        <main 
            ref={mainRef}
            className={`flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden transition-[padding] duration-300 ${isFullscreen ? '' : SAFE_PADDING}`}
            onMouseDown={handleContainerMouseDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onClick={handleContainerClick}
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
                     backgroundSize: '24px 24px' 
                 }} 
            />

            {/* Artboard Container */}
            <div 
                ref={containerRef} 
                className="relative group cursor-crosshair shadow-2xl ring-1 ring-white/10 overflow-hidden bg-slate-900"
                // Removed explicit style prop as we handle sizing in JS loop now
                onMouseMove={handlePointerMove}
            >
                {/* Transparency Checkerboard */}
                <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `conic-gradient(#cbd5e1 90deg, transparent 90deg 180deg, #cbd5e1 180deg 270deg, transparent 270deg)`,
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Main Render Canvas */}
                <canvas 
                    ref={canvasRef} 
                    className="block w-full h-full"
                />

                {/* Node Markers Overlay */}
                <NodeMarkers 
                    nodes={nodes}
                    selectedNodeIndex={selectedNodeIndex}
                    markerRefs={markerRefs}
                    onPointerDown={handlePointerDown}
                />

                {/* Dimensions Hint */}
                <div className="absolute -bottom-8 right-0 pointer-events-none text-slate-500 font-mono text-xs select-none z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(containerRef.current?.clientWidth || 0)} &times; {Math.round(containerRef.current?.clientHeight || 0)} px
                </div>
            </div>
        </main>
    );
};
