
import { AuroraNode, ShapeType } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

export const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

export const getAspectRatio = (ratio: string): number => {
    if (ratio === 'fullscreen') return 0;
    const [w, h] = ratio.split(':').map(Number);
    return w / h;
};

export const createNode = (x: number, y: number, color: string): AuroraNode => {
    const width = Math.random() * 30 + 30;
    const height = Math.random() * 30 + 30;
    const rotation = Math.random() * 360;

    return {
        id: generateId(),
        x,
        y,
        color,
        width,
        height,
        rotation,
        shape: 'round',
        seed: Math.random() * 1000, // Random seed for unique shapes
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vRot: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        ox: x,
        oy: y,
        animatingProps: {
            width: false,
            height: false,
            rotation: false,
        },
        baseValues: {
            width,
            height,
            rotation,
        }
    };
};

export const generateRandomNodes = (count: number): AuroraNode[] => {
    const nodes: AuroraNode[] = [];
    const baseHue = Math.random() * 360;
    const shapes: ShapeType[] = ['round', 'round', 'square', 'triangle', 'round'];

    for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i * 40)) % 360;
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const n = createNode(
            Math.random() * 60 + 20,
            Math.random() * 60 + 20,
            hslToHex(hue, 80, 60)
        );
        n.shape = shape;
        
        if (Math.random() > 0.5) {
            n.width *= 1.5;
            n.height *= 0.7;
            n.baseValues.width = n.width;
            n.baseValues.height = n.height;
        }
        nodes.push(n);
    }
    return nodes;
};