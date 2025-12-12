import React from 'react';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
    return (
        <div className="control-group mb-5">
            <div className="text-xs text-slate-400 mb-2 font-medium">{label}</div>
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};