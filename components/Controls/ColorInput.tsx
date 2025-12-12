import React from 'react';

interface ColorInputProps {
    label?: string;
    value: string;
    onChange: (color: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
    return (
        <div className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
            {label && <span className="text-xs text-slate-300 ml-1">{label}</span>}
            <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400 uppercase">{value}</span>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};
