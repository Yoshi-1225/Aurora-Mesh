
import React from 'react';
import { AppSettings, BlendMode, AspectRatio } from '../../types';
import { Slider } from '../Controls/Slider';
import { ColorInput } from '../Controls/ColorInput';
import { Icon } from '../Common/Icon';
import { Select } from '../Controls/Select';
import { Section } from '../Common/Section';

interface Props {
    settings: AppSettings;
    onUpdate: (updates: Partial<AppSettings>) => void;
    onExport: () => void;
}

export const GlobalSettingsPanel: React.FC<Props> = ({ 
    settings, 
    onUpdate, 
    onExport
}) => {
    return (
        <aside className="w-72 flex-shrink-0 bg-slate-900/90 backdrop-blur-md border-r border-slate-700 flex flex-col z-30">
            {/* Header */}
            <div className="p-5 border-b border-slate-700">
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 select-none">
                    <Icon name="blur_on" className="text-cyan-400" /> Aurora Mesh
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8">
                
                {/* Canvas Settings */}
                <Section title="畫布設定" icon="aspect_ratio">
                    <Select 
                        label="長寬比例"
                        value={settings.aspectRatio}
                        onChange={(val) => onUpdate({ aspectRatio: val as AspectRatio })}
                        options={[
                            { label: '16:9 (影片/桌面)', value: '16:9' },
                            { label: '4:3 (經典比例)', value: '4:3' },
                            { label: '1:1 (正方形/社群)', value: '1:1' },
                            { label: '9:16 (手機/限動)', value: '9:16' },
                            { label: '全螢幕 (適應視窗)', value: 'fullscreen' },
                        ]}
                    />
                </Section>

                {/* Background */}
                <Section title="背景設定" icon="format_paint">
                    <ColorInput 
                        label="基礎底色" 
                        value={settings.backgroundColor} 
                        onChange={(c) => onUpdate({ backgroundColor: c })} 
                    />
                </Section>

                {/* Noise & Texture */}
                <Section title="噪點與質感" icon="grain">
                    <Slider 
                        label="強度" 
                        value={Math.round(settings.noiseOpacity * 100)} 
                        min={0} max={50} unit="%"
                        onChange={(v) => onUpdate({ noiseOpacity: v / 100 })}
                    />
                    <Slider 
                        label="顆粒大小" 
                        value={settings.noiseFreq} 
                        min={0} max={3} step={0.1}
                        onChange={(v) => onUpdate({ noiseFreq: v })}
                    />
                    <Select 
                        label="混合模式"
                        value={settings.blendMode}
                        onChange={(val) => onUpdate({ blendMode: val as BlendMode })}
                        options={[
                            { label: '覆蓋 (Overlay)', value: 'overlay' },
                            { label: '柔光 (Soft Light)', value: 'soft-light' },
                            { label: '色彩增殖 (Multiply)', value: 'multiply' },
                            { label: '濾色 (Screen)', value: 'screen' },
                        ]}
                    />
                </Section>

                {/* Global Effects */}
                <Section title="全域效果" icon="tune">
                    <Slider 
                        label="網格模糊" 
                        value={settings.globalBlur} 
                        min={20} max={150} unit="px"
                        onChange={(v) => onUpdate({ globalBlur: v })}
                    />
                </Section>
            </div>

            {/* Export Footer */}
            <div className="p-5 border-t border-slate-700 bg-slate-900/50">
                <button 
                    onClick={onExport}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium shadow-lg shadow-cyan-900/20 transition-all flex justify-center items-center gap-2 text-sm"
                >
                    <Icon name="ios_share" className="text-lg" /> 匯出 影片 / 圖片
                </button>
            </div>
        </aside>
    );
};