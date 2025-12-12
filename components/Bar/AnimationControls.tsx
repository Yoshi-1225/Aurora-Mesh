
import React from 'react';
import { AppSettings, MotionType } from '../../types';
import { Icon } from '../Common/Icon';

interface Props {
    settings: AppSettings;
    onUpdate: (updates: Partial<AppSettings>) => void;
}

export const AnimationControls: React.FC<Props> = ({ settings, onUpdate }) => {
    const motionOptions: { value: MotionType; label: string; icon: string }[] = [
        { value: 'float', label: '漂浮模式', icon: 'filter_drama' },
        { value: 'breath', label: '呼吸模式', icon: 'waves' },
        { value: 'circular', label: '軌道模式', icon: 'sync' },
    ];

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:bg-slate-900/90 hover:scale-[1.02]">
            
            {/* Play/Pause Button */}
            <button
                onClick={() => onUpdate({ animation: !settings.animation })}
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg
                    ${settings.animation 
                        ? 'bg-cyan-500 text-white shadow-cyan-500/30 hover:bg-cyan-400' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}
                `}
                title={settings.animation ? "暫停動畫" : "播放動畫"}
            >
                <Icon name={settings.animation ? "pause" : "play_arrow"} className="text-2xl" />
            </button>

            {/* Vertical Separator */}
            <div className="w-px h-8 bg-slate-700/50"></div>

            {/* Speed Control */}
            <div className="flex flex-col gap-1 w-32">
                <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    <span>速度</span>
                    <span className="font-mono text-cyan-400">{settings.speed.toFixed(1)}x</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={settings.speed}
                    onChange={(e) => onUpdate({ speed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                    [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                />
            </div>

            {/* Vertical Separator */}
            <div className="w-px h-8 bg-slate-700/50"></div>

            {/* Motion Type Selector (Icon Only) */}
            <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/30 gap-1">
                {motionOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onUpdate({ motionType: opt.value })}
                        className={`
                            p-2 rounded-md flex items-center justify-center transition-all
                            ${settings.motionType === opt.value 
                                ? 'bg-slate-700 text-white shadow-sm' 
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/50'}
                        `}
                        title={opt.label}
                    >
                        <Icon name={opt.icon} className="text-xl" />
                    </button>
                ))}
            </div>
        </div>
    );
};
