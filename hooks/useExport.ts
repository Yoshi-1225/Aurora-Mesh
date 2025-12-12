
import React, { useState, useCallback } from 'react';
import { AuroraNode, AppSettings } from '../types';
import { auroraRenderer } from '../renderer';

export const useExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const getExportDimensions = (ratio: string) => {
        let width = 1920, height = 1080;
        if (ratio === '1:1') { width = 2048; height = 2048; }
        else if (ratio === '4:3') { width = 2048; height = 1536; }
        else if (ratio === '9:16') { width = 1080; height = 1920; }
        else if (ratio === 'fullscreen') { width = 1920; height = 1080; }
        return { width, height };
    };

    const exportImage = useCallback((nodes: AuroraNode[], settings: AppSettings) => {
        const { width, height } = getExportDimensions(settings.aspectRatio);
        
        // Use a 2x multiplier for "High Quality" export
        // The renderer will handle the visual scaling of blur/noise automatically based on this larger size.
        const exportScale = 2; 
        
        const canvas = document.createElement('canvas');
        canvas.width = width * exportScale;
        canvas.height = height * exportScale;
        
        // Unified render call
        auroraRenderer.draw(canvas, nodes, settings);

        // Download
        const link = document.createElement('a');
        link.download = `aurora-${settings.aspectRatio.replace(':','-')}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 0.9);
        link.click();
    }, []);

    const exportVideo = useCallback(async (
        nodesRef: React.MutableRefObject<AuroraNode[]>, 
        settings: AppSettings, 
        duration: number
    ) => {
        setIsExporting(true);
        setProgress(0);

        const { width, height } = getExportDimensions(settings.aspectRatio);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Capture stream at 60 FPS
        const stream = canvas.captureStream(60);
        
        let mimeType = 'video/webm';
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
            mimeType = 'video/webm;codecs=h264';
        }

        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 16_000_000 // High bitrate
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aurora-video-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
            a.click();
            URL.revokeObjectURL(url);
            setIsExporting(false);
            setProgress(0);
        };

        recorder.start();

        const startTime = performance.now();
        let animationFrameId: number;

        // Render loop for the video export
        const renderLoop = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            
            if (elapsed >= duration) {
                recorder.stop();
                cancelAnimationFrame(animationFrameId);
                return;
            }

            setProgress(Math.round((elapsed / duration) * 100));

            // Unified Render Call 
            // Renderer automatically handles relative sizing of blur/noise
            auroraRenderer.draw(canvas, nodesRef.current, settings);

            animationFrameId = requestAnimationFrame(renderLoop);
        };

        animationFrameId = requestAnimationFrame(renderLoop);

    }, []);

    return { exportImage, exportVideo, isExporting, progress };
};
