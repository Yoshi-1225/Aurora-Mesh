
import React from 'react';
import { AuroraNode, AppSettings, RandomizationConfig } from '../../types';
import { Icon } from '../Common/Icon';
import { EditNodePanel } from './EditNodePanel';

interface Props {
    nodes: AuroraNode[];
    selectedIndex: number;
    settings: AppSettings;
    onSelect: (index: number) => void;
    onAdd: () => void;
    onDelete: (index: number) => void;
    onUpdateNode: (index: number, data: Partial<AuroraNode>) => void;
    onUpdateSettings: (data: Partial<AppSettings>) => void;
    onRandomize: (config: RandomizationConfig) => void;
}

export const NodePanel: React.FC<Props> = ({
    nodes, selectedIndex, settings, onSelect, onAdd, onDelete, onUpdateNode, onUpdateSettings, onRandomize
}) => {
    const selectedNode = selectedIndex >= 0 ? nodes[selectedIndex] : null;

    return (
        <aside className="w-80 flex-shrink-0 bg-slate-900/90 backdrop-blur-md border-l border-slate-700 flex flex-col z-30 relative overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <h2 className="font-bold text-slate-200 flex items-center gap-2">
                    <Icon name="layers" className="text-slate-400" />
                    圖層列表
                </h2>
                <button 
                    onClick={onAdd} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-medium text-white transition-all shadow-lg shadow-cyan-900/20" 
                    title="新增節點"
                >
                    <Icon name="add" className="text-sm" /> 新增
                </button>
            </div>

            {/* Node List Container */}
            <div className="flex-1 overflow-y-auto p-5 pb-80"> 
                
                {/* List of Nodes */}
                <div className="space-y-2">
                    {nodes.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-xs italic">
                            暫無節點，請點擊 "新增" 開始。
                        </div>
                    )}
                    
                    {nodes.map((node, i) => (
                        <div
                            key={node.id}
                            onClick={() => onSelect(i)}
                            className={`
                                group relative p-3 rounded-lg flex items-center justify-between cursor-pointer border transition-all duration-200
                                ${i === selectedIndex 
                                    ? 'bg-slate-800 border-cyan-500/50 shadow-[0_2px_12px_rgba(0,0,0,0.2)]' 
                                    : 'bg-slate-800/30 border-transparent hover:bg-slate-800 hover:border-slate-600'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div 
                                        className="w-8 h-8 rounded shadow-sm border border-white/10" 
                                        style={{ backgroundColor: node.color }}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                                         <Icon 
                                            name={node.shape === 'round' ? 'circle' : node.shape === 'square' ? 'square' : 'change_history'} 
                                            className={`text-[10px] ${i === selectedIndex ? 'text-cyan-400' : 'text-slate-500'}`} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-xs font-medium ${i === selectedIndex ? 'text-cyan-400' : 'text-slate-300'}`}>
                                        節點 {i + 1}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono uppercase">
                                        {node.color}
                                    </div>
                                </div>
                            </div>
                            
                            {i === selectedIndex && (
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Editing Panel (Slide up) */}
            <EditNodePanel 
                node={selectedNode}
                index={selectedIndex}
                onClose={() => onSelect(-1)}
                onDelete={onDelete}
                onUpdateNode={onUpdateNode}
                onRandomize={onRandomize}
            />
        </aside>
    );
};
