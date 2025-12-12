import React from 'react';

interface ToggleProps {
    label?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between mb-3">
            {label && <span className="text-xs text-slate-300">{label}</span>}
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={checked} 
                    onChange={(e) => onChange(e.target.checked)} 
                    className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
        </div>
    );
};