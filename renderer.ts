
import { AuroraNode, AppSettings } from './types';
import { hexToRgb } from './utils';

// 定義參考寬度 (例如一般的筆電螢幕寬度)
// 所有的模糊與噪點大小將以此為基準進行相對縮放，確保 WYSIWYG
const BASE_REFERENCE_WIDTH = 1280;

export class AuroraRenderer {
    private noiseCanvas: HTMLCanvasElement | null = null;
    private noisePattern: CanvasPattern | null = null;
    
    // Cache keys to prevent unnecessary regeneration
    private cachedNoiseOpacity: number = -1;
    private cachedNoiseFreq: number = -1;

    /**
     * 生成或更新噪點紋理
     * 為了效能，我們只在參數變更時重新生成
     */
    private updateNoiseTexture(ctx: CanvasRenderingContext2D, opacity: number, frequency: number) {
        if (this.noisePattern && 
            Math.abs(this.cachedNoiseOpacity - opacity) < 0.01 && 
            Math.abs(this.cachedNoiseFreq - frequency) < 0.01) {
            return;
        }

        const size = 512; // 紋理基礎大小
        if (!this.noiseCanvas) {
            this.noiseCanvas = document.createElement('canvas');
            this.noiseCanvas.width = size;
            this.noiseCanvas.height = size;
        }

        const nCtx = this.noiseCanvas.getContext('2d');
        if (!nCtx) return;

        nCtx.clearRect(0, 0, size, size);
        const iData = nCtx.createImageData(size, size);
        const buffer = new Uint32Array(iData.data.buffer);
        const len = buffer.length;

        for (let i = 0; i < len; i++) {
            // 產生隨機灰階
            const value = Math.random() * 255;
            
            // Alpha 通道控制強度 (0xAABBGGRR)
            const alpha = Math.floor(opacity * 255);
            buffer[i] = (alpha << 24) | (Math.floor(value) << 16) | (Math.floor(value) << 8) | Math.floor(value);
        }

        nCtx.putImageData(iData, 0, 0);

        this.noisePattern = ctx.createPattern(this.noiseCanvas, 'repeat');
        this.cachedNoiseOpacity = opacity;
        this.cachedNoiseFreq = frequency;
    }

    /**
     * 主繪製函數
     * @param canvas 目標畫布
     * @param nodes 節點數據
     * @param settings 全域設定
     */
    public draw(
        canvas: HTMLCanvasElement,
        nodes: AuroraNode[],
        settings: AppSettings
    ) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // 計算視覺縮放比例 (Visual Scale Factor)
        // 這解決了預覽視窗與 4K 匯出時模糊度/噪點看起來不一致的問題
        const visualScale = width / BASE_REFERENCE_WIDTH;

        // 1. 繪製背景
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // 2. 設定全域模糊 (相對縮放)
        // 如果 globalBlur 是 80px，在 1280px 寬度下是 80px
        // 在 3840px (4K) 寬度下，會自動放大為 ~240px，保持視覺比例一致
        const blurRadius = settings.globalBlur * visualScale;
        ctx.filter = `blur(${blurRadius}px)`;

        // 3. 繪製節點
        const minDim = Math.min(width, height);
        nodes.forEach(node => {
            this.drawNode(ctx, node, width, height, minDim);
        });

        // 4. 重置 Filter (噪點不應被模糊)
        ctx.filter = 'none';

        // 5. 繪製噪點疊加層
        if (settings.noiseOpacity > 0) {
            this.drawNoise(ctx, width, height, settings, visualScale);
        }
    }

    private drawNode(
        ctx: CanvasRenderingContext2D, 
        node: AuroraNode, 
        containerW: number, 
        containerH: number, 
        minDim: number
    ) {
        ctx.save();
        
        // 位置與旋轉
        const px = (node.x / 100) * containerW;
        const py = (node.y / 100) * containerH;
        
        ctx.translate(px, py);
        ctx.rotate((node.rotation * Math.PI) / 180);

        // 尺寸計算
        const w = (node.width / 100) * minDim;
        const h = (node.height / 100) * minDim;
        
        const c = hexToRgb(node.color);
        const baseColor = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;
        
        if (node.shape === 'round') {
            // 圓形使用徑向漸層以獲得更自然的邊緣
            const midColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`;
            const fadeColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0)`;

            ctx.scale(w / 100, h / 100);
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.5, midColor);
            gradient.addColorStop(1, fadeColor);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 100, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // 方形與三角形
            ctx.fillStyle = baseColor;
            ctx.globalAlpha = 0.85; 
            
            if (node.shape === 'square') {
                ctx.fillRect(-w/2, -h/2, w, h);
            } else if (node.shape === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -h/1.5);
                ctx.lineTo(w/1.5, h/2);
                ctx.lineTo(-w/1.5, h/2);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    private drawNoise(
        ctx: CanvasRenderingContext2D, 
        width: number, 
        height: number, 
        settings: AppSettings,
        visualScale: number
    ) {
        this.updateNoiseTexture(ctx, settings.noiseOpacity, settings.noiseFreq);

        if (this.noisePattern) {
            ctx.save();
            ctx.globalCompositeOperation = settings.blendMode as GlobalCompositeOperation;
            
            // 噪點大小也必須跟隨畫布尺寸縮放，否則 4K 下噪點會變得太細
            // settings.noiseFreq 越大 -> 顆粒越細 (縮放小)
            // settings.noiseFreq 越小 -> 顆粒越粗 (縮放大)
            const baseScale = 1 / Math.max(0.1, settings.noiseFreq);
            const finalScale = baseScale * visualScale;

            ctx.scale(finalScale, finalScale);
            ctx.fillStyle = this.noisePattern;
            
            // 填充區域需反向縮放以覆蓋全畫面
            ctx.fillRect(0, 0, width / finalScale, height / finalScale);
            
            ctx.restore();
        }
    }
}

export const auroraRenderer = new AuroraRenderer();
