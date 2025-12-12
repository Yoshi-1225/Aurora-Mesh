import React, { useState } from 'react';
import { AuroraNode, AppSettings } from '../../types';
import { useExport } from '../../hooks/useExport';
import { Icon } from '../Common/Icon';
import { Select } from '../Controls/Select';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    nodes: AuroraNode[]; // Used for static image export
    nodesRef: React.MutableRefObject<AuroraNode[]>; // Used for video export (live positions)
    settings: AppSettings;
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose, nodes, nodesRef, settings }) => {
    const { exportImage, exportVideo, isExporting, progress } = useExport();
    const [mode, setMode] = useState<'image' | 'video'>('video');
    const [videoDuration, setVideoDuration] = useState('5'); // string for select

    if (!isOpen) return null;

    const handleVideoExport = () => {
        exportVideo(nodesRef, settings, parseInt(videoDuration));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="ios_share" className="text-cyan-400" /> 匯出資源
                    </h2>
                    {!isExporting && (
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <Icon name="close" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                    <button 
                        onClick={() => setMode('video')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mode === 'video' ? 'text-cyan-400 bg-slate-800/50 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                        disabled={isExporting}
                    >
                        <Icon name="movie" /> 影片 (MP4)
                    </button>
                    <button 
                        onClick={() => setMode('image')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${mode === 'image' ? 'text-cyan-400 bg-slate-800/50 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                        disabled={isExporting}
                    >
                        <Icon name="image" /> 圖片 (PNG)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Common Info */}
                    <div className="bg-cyan-900/20 border border-cyan-800/50 p-3 rounded text-cyan-200 text-xs flex gap-2">
                        <Icon name="aspect_ratio" className="text-sm" />
                        <span>目前匯出比例： <strong>{settings.aspectRatio}</strong></span>
                    </div>

                    {mode === 'video' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400">錄製一段目前漸層網格動畫的無縫循環影片。</p>
                            
                            <Select 
                                label="影片長度"
                                value={videoDuration}
                                onChange={setVideoDuration}
                                options={[
                                    { label: '5 秒', value: '5' },
                                    { label: '10 秒', value: '10' },
                                    { label: '15 秒', value: '15' },
                                    { label: '30 秒', value: '30' },
                                ]}
                            />

                            {isExporting ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-cyan-400 font-medium">
                                        <span>正在渲染影格...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 text-center pt-2">處理中，請勿關閉此視窗。</p>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleVideoExport}
                                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium shadow-lg shadow-cyan-900/20 transition-all flex justify-center items-center gap-2"
                                >
                                    <Icon name="fiber_manual_record" /> 開始錄製
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <p className="text-sm text-slate-400">下載目前畫面的高解析度快照 (2倍縮放)。</p>
                             
                             <button 
                                onClick={() => exportImage(nodes, settings)}
                                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                <Icon name="download" /> 下載 PNG
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};