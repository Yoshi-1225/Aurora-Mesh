import React from 'react';
import { AuroraNode } from '../../types';
import { Icon } from '../Common/Icon';

interface NodeTopBarProps {
    nodes: AuroraNode[];
    selectedNodeIndex: number;
    onSelectNode: (index: number) => void;
    onAddNode: () => void;
}

export const NodeTopBar: React.FC<NodeTopBarProps> = ({ 
    nodes, 
    selectedNodeIndex, 
    onSelectNode, 
    onAddNode 
}) => {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-slate-900/90">
            <div className="flex items-center gap-2 pl-1">
                {nodes.map((node, i) => (
                    <button
                        key={node.id}
                        onClick={() => onSelectNode(i)}
                        className={`
                            relative group w-8 h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-center
                            ${i === selectedNodeIndex 
                                ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                                : 'ring-1 ring-white/10 hover:scale-105 hover:ring-white/50 opacity-80 hover:opacity-100'}
                        `}
                        style={{ backgroundColor: node.color }}
                        title={`選擇節點 ${i + 1}`}
                    >
                        {/* Shape Indicator Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <Icon 
                                name={node.shape === 'round' ? 'circle' : node.shape === 'square' ? 'square' : 'change_history'} 
                                className="text-[10px] text-white/70 drop-shadow-md" 
                            />
                        </div>
                        
                        {/* Active Indicator Dot */}
                        {i === selectedNodeIndex && (
                            <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]"></div>
                        )}
                    </button>
                ))}
            </div>

            <div className="w-px h-6 bg-slate-700/50 mx-1"></div>

            <button
                onClick={onAddNode}
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all flex items-center justify-center group"
                title="新增節點"
            >
                <Icon name="add" className="text-lg transition-transform group-hover:rotate-90" />
            </button>
        </div>
    );
};