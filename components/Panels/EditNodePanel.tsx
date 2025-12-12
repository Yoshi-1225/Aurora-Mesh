
import React from 'react';
import { AuroraNode, ShapeType, RandomizationConfig } from '../../types';
import { ColorInput } from '../Controls/ColorInput';
import { Icon } from '../Common/Icon';
import { PropertyControl } from '../Controls/PropertyControl';
import { RandomizerSettings } from './RandomizerSettings';

interface EditNodePanelProps {
    node: AuroraNode | null;
    index: number;
    onClose: () => void;
    onDelete: (index: number) => void;
    onUpdateNode: (index: number, data: Partial<AuroraNode>) => void;
    onRandomize: (config: RandomizationConfig) => void;
}

export const EditNodePanel: React.FC<EditNodePanelProps> = ({ 
    node, 
    index, 
    onClose, 
    onDelete, 
    onUpdateNode,
    onRandomize
}) => {
    
    // Mode 1: Generator / Randomizer (When no node is selected)
    if (!node) {
        return (
            <aside className="w-72 flex-shrink-0 bg-slate-900/90 backdrop-blur-md border-l border-slate-700 flex flex-col z-30 transition-all duration-300">
                {/* Header */}
                <div className="p-5 border-b border-slate-700 bg-slate-900/50">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Icon name="auto_awesome" className="text-cyan-400" /> 
                        快速生成
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                        您目前未選取任何節點。您可以使用下方的工具隨機生成全新的漸層配置，或點擊畫布上的節點進行編輯。
                    </p>
                    <RandomizerSettings onApply={onRandomize} />
                </div>
            </aside>
        );
    }

    // Mode 2: Node Editor (When a node is selected)
    const togglePropAnimation = (prop: keyof AuroraNode['animatingProps'], isActive: boolean) => {
        onUpdateNode(index, {
            animatingProps: {
                ...node.animatingProps,
                [prop]: isActive
            }
        });
    };

    const shapes: { type: ShapeType; icon: string; label: string }[] = [
        { type: 'round', icon: 'circle', label: '圓形' },
        { type: 'square', icon: 'square', label: '方形' },
        { type: 'triangle', icon: 'change_history', label: '三角形' },
    ];

    return (
        <aside className="w-72 flex-shrink-0 bg-slate-900/90 backdrop-blur-md border-l border-slate-700 flex flex-col z-30 transition-all duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Icon name="tune" className="text-sm" />
                    <span className="text-sm font-bold uppercase tracking-wider">編輯節點 {index + 1}</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-slate-500 hover:text-white transition-colors"
                    title="取消選取 (返回生成器)"
                >
                    <Icon name="close" className="text-lg" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Section 1: Color & Shape */}
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <Icon name="palette" className="text-sm" /> 外觀樣式
                    </h2>
                    
                    <div className="mb-4">
                        <ColorInput 
                            label="顏色"
                            value={node.color} 
                            onChange={(c) => onUpdateNode(index, { color: c })} 
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {shapes.map((s) => (
                            <button
                                key={s.type}
                                onClick={() => onUpdateNode(index, { shape: s.type })}
                                className={`
                                    flex flex-col items-center justify-center gap-1 py-3 rounded-md border transition-all
                                    ${node.shape === s.type 
                                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(8,145,178,0.2)]' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}
                                `}
                            >
                                <Icon name={s.icon} className="text-lg" />
                                <span className="text-[10px] font-medium">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 2: Dimensions */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
                        <Icon name="transform" className="text-sm" /> 變形屬性
                    </h2>
                    
                    <PropertyControl 
                        label="寬度" 
                        value={Math.round(node.width)} 
                        min={10} max={200}
                        isAnimating={node.animatingProps?.width}
                        onValueChange={(v) => onUpdateNode(index, { width: v })}
                        onToggleAnimation={(v) => togglePropAnimation('width', v)}
                    />
                    
                    <PropertyControl 
                        label="高度" 
                        value={Math.round(node.height)} 
                        min={10} max={200}
                        isAnimating={node.animatingProps?.height}
                        onValueChange={(v) => onUpdateNode(index, { height: v })}
                        onToggleAnimation={(v) => togglePropAnimation('height', v)}
                    />

                    <PropertyControl 
                        label="旋轉" 
                        value={Math.round(node.rotation)} 
                        min={0} max={360} unit="°"
                        isAnimating={node.animatingProps?.rotation}
                        onValueChange={(v) => onUpdateNode(index, { rotation: v })}
                        onToggleAnimation={(v) => togglePropAnimation('rotation', v)}
                    />
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-700 bg-slate-900/50">
                 <button 
                    onClick={() => onDelete(index)} 
                    className="w-full py-2.5 text-red-400 bg-red-950/20 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500/50 rounded-md transition-all flex items-center justify-center gap-2 font-medium text-xs group"
                >
                    <Icon name="delete" className="text-sm group-hover:scale-110 transition-transform" /> 刪除節點
                </button>
            </div>
        </aside>
    );
};
