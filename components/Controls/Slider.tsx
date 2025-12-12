import React from 'react';

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => {
    return (
        <div className="control-group mb-5">
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                <span>{label}</span>
                <span className="font-mono">{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full"
            />
        </div>
    );
};
