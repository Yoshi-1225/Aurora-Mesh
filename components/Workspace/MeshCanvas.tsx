
import React, { useRef, useEffect, memo, useState } from 'react';
import { AuroraNode, AppSettings } from '../../types';
import { auroraRenderer } from '../../renderer';
import { simulateFrame } from '../../simulation';

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
    const markerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    
    // Animation Loop Ref
    const animationFrameId = useRef<number>(0);
    const settingsRef = useRef(settings);

    // Layout State (Controlled by ResizeObserver)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => { settingsRef.current = settings; }, [settings]);

    // Interaction State
    const draggingRef = useRef<{ index: number } | null>(null);
    const isDraggingRef = useRef<boolean>(false);
    const isFullscreen = settings.aspectRatio === 'fullscreen';

    // 1. Efficient Layout Handling using ResizeObserver
    useEffect(() => {
        if (!mainRef.current || !containerRef.current) return;

        const calculateLayout = () => {
            if (!mainRef.current) return;
            
            const mainRect = mainRef.current.getBoundingClientRect();
            const style = window.getComputedStyle(mainRef.current);
            const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
            const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
            
            const availW = mainRect.width - paddingX;
            const availH = mainRect.height - paddingY;
            
            let targetW = availW;
            let targetH = availH;

            const currentRatio = settings.aspectRatio;

            if (currentRatio !== 'fullscreen') {
                const ratio = getAspectRatio(currentRatio);
                if (availW / availH > ratio) {
                    targetW = availH * ratio;
                    targetH = availH;
                } else {
                    targetW = availW;
                    targetH = availW / ratio;
                }
            }

            // Only update DOM/State if necessary
            if (Math.abs(targetW - dimensions.width) > 1 || Math.abs(targetH - dimensions.height) > 1) {
                setDimensions({ width: targetW, height: targetH });
            }
        };

        const observer = new ResizeObserver(calculateLayout);
        observer.observe(mainRef.current);

        // Initial calc
        calculateLayout();

        return () => observer.disconnect();
    }, [settings.aspectRatio]); // Recalculate when ratio changes

    // 2. Unified Game Loop (Update + Draw)
    useEffect(() => {
        const loop = () => {
            const canvas = canvasRef.current;
            const currentSettings = settingsRef.current;

            if (canvas && dimensions.width > 0 && dimensions.height > 0) {
                
                // --- Step A: Update Physics (Simulation) ---
                if (currentSettings.animation) {
                    const time = Date.now() * 0.001 * currentSettings.speed;
                    simulateFrame(nodesRef.current, currentSettings, time);
                }

                // --- Step B: Render (Draw) ---
                // Sync Canvas Resolution to Dimensions
                const dpr = window.devicePixelRatio || 1;
                const resW = Math.round(dimensions.width * dpr);
                const resH = Math.round(dimensions.height * dpr);

                if (canvas.width !== resW || canvas.height !== resH) {
                    canvas.width = resW;
                    canvas.height = resH;
                }

                auroraRenderer.draw(
                    canvas,
                    nodesRef.current,
                    currentSettings
                );

                // --- Step C: Sync DOM Markers ---
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
    }, [dimensions]); // Restart loop if dimensions drastically change (though rarely needed logic change)

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
                style={{
                    width: dimensions.width,
                    height: dimensions.height,
                    transition: 'width 0.3s ease-out, height 0.3s ease-out'
                }}
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
                    {Math.round(dimensions.width)} &times; {Math.round(dimensions.height)} px
                </div>
            </div>
        </main>
    );
};
