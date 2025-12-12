
import React, { useState } from 'react';
import { RandomizationConfig } from '../../types';
import { Icon } from '../Common/Icon';

interface Props {
    onApply: (config: RandomizationConfig) => void;
}

export const RandomizerSettings: React.FC<Props> = ({ onApply }) => {
    const [config, setConfig] = useState<RandomizationConfig>({
        colors: true,
        colorStrategy: 'analogous',
        position: true,
        width: true,
        height: true,
        rotation: true,
        shape: true,
    });

    const toggle = (key: keyof RandomizationConfig) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key as any] }));
    };

    const handleApply = () => {
        onApply(config);
    };

    return (
        <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                <Icon name="casino" className="text-xs" /> 智慧隨機生成器
            </h2>

            {/* Color Settings */}
            <div className="mb-3">
                <div 
                    className={`flex items-center gap-2 mb-2 cursor-pointer ${config.colors ? 'text-cyan-400' : 'text-slate-500'}`}
                    onClick={() => toggle('colors')}
                >
                    <Icon name={config.colors ? "check_box" : "check_box_outline_blank"} className="text-base" />
                    <span className="text-xs font-medium">隨機色彩</span>
                </div>
                
                {config.colors && (
                    <div className="pl-6">
                        <select 
                            value={config.colorStrategy}
                            onChange={(e) => setConfig(prev => ({ ...prev, colorStrategy: e.target.value as any }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-1.5 text-slate-300 outline-none focus:border-cyan-500"
                        >
                            <option value="analogous">類比色 (Analogous)</option>
                            <option value="complementary">互補色 (Complementary)</option>
                            <option value="random">完全隨機 (Surprise Me)</option>
                            <option value="current">保持當前模式</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Physical Properties Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                    onClick={() => toggle('position')}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors border ${
                        config.position 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <Icon name={config.position ? "check_circle" : "circle"} className="text-[10px]" /> 位置
                </button>

                <button 
                    onClick={() => toggle('rotation')}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors border ${
                        config.rotation 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <Icon name={config.rotation ? "check_circle" : "circle"} className="text-[10px]" /> 角度
                </button>

                <button 
                    onClick={() => toggle('width')}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors border ${
                        config.width 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <Icon name={config.width ? "check_circle" : "circle"} className="text-[10px]" /> 寬度
                </button>

                 <button 
                    onClick={() => toggle('height')}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors border ${
                        config.height 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <Icon name={config.height ? "check_circle" : "circle"} className="text-[10px]" /> 長度
                </button>

                <button 
                    onClick={() => toggle('shape')}
                    className={`col-span-2 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors border ${
                        config.shape 
                        ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <Icon name={config.shape ? "check_circle" : "circle"} className="text-[10px]" /> 形狀樣式
                </button>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleApply}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-xs font-bold shadow-lg shadow-cyan-900/20 transition-all flex justify-center items-center gap-2 group active:scale-95"
            >
                <Icon name="auto_awesome" className="text-sm group-hover:rotate-12 transition-transform" />
                立即生成
            </button>
        </div>
    );
};