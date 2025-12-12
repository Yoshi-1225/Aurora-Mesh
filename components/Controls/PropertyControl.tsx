import React from 'react';
import { Icon } from '../Common/Icon';

interface PropertyControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit?: string;
    isAnimating?: boolean;
    onValueChange: (val: number) => void;
    onToggleAnimation: (animating: boolean) => void;
}

export const PropertyControl: React.FC<PropertyControlProps> = ({ 
    label, 
    value, 
    min, 
    max, 
    unit, 
    isAnimating, 
    onValueChange, 
    onToggleAnimation 
}) => {
    return (
        <div className="bg-slate-800/50 rounded-md p-2 border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
                    <button 
                        onClick={() => onToggleAnimation(!isAnimating)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                            isAnimating 
                                ? 'bg-cyan-600 border-cyan-500 text-white shadow-[0_0_8px_rgba(8,145,178,0.5)]' 
                                : 'border-slate-600 bg-slate-800 text-slate-600 hover:border-slate-500 hover:text-slate-400'
                        }`}
                        title={`自動動畫化：${label}`}
                    >
                        <Icon name="waves" className="text-[10px]" />
                    </button>
                </div>
                <span className="text-[10px] text-slate-300 font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                    {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(0) : value}{unit}
                </span>
            </div>
            <div className="relative h-4 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onValueChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:bg-slate-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:hover:bg-cyan-300 [&::-webkit-slider-thumb]:transition-colors"
                />
            </div>
        </div>
    );
};