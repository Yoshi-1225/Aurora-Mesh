import React, { memo } from 'react';
import { AuroraNode } from '../../types';

interface NodeMarkersProps {
    nodes: AuroraNode[];
    selectedNodeIndex: number;
    markerRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
    onPointerDown: (e: React.MouseEvent, index: number) => void;
}

// Memoized Markers Layer to prevent unnecessary React re-renders
export const NodeMarkers = memo(({ nodes, selectedNodeIndex, markerRefs, onPointerDown }: NodeMarkersProps) => {
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