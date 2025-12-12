
export type ShapeType = 'round' | 'square' | 'triangle';
export type MotionType = 'float' | 'breath' | 'circular';
export type HarmonyMode = 'analogous' | 'complementary';
export type BlendMode = 'overlay' | 'soft-light' | 'multiply' | 'screen';
export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | 'fullscreen';

export interface AnimatableProps {
    width?: boolean;
    height?: boolean;
    rotation?: boolean;
}

export interface AuroraNode {
    id: string; // Added for React key purposes
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    color: string;
    width: number; // relative scale
    height: number; // relative scale
    rotation: number; // degrees
    shape: ShapeType;
    
    seed: number; // Random seed for shape generation

    // Animation properties
    vx: number;
    vy: number;
    vRot: number;
    phase: number;
    ox: number; // original X for oscillation
    oy: number; // original Y for oscillation

    // Auto-animation specific properties
    animatingProps: AnimatableProps;
    baseValues: {
        width: number;
        height: number;
        rotation: number;
    };
}

export interface AppSettings {
    backgroundColor: string;
    noiseOpacity: number; // 0.0 - 0.5
    noiseFreq: number;
    blendMode: BlendMode;
    animation: boolean;
    speed: number;
    motionType: MotionType;
    globalBlur: number; // px
    harmonyMode: HarmonyMode;
    aspectRatio: AspectRatio;
}

export interface RandomizationConfig {
    colors: boolean;
    colorStrategy: 'current' | 'analogous' | 'complementary' | 'random';
    position: boolean;
    width: boolean;  // Split from size
    height: boolean; // Split from size
    rotation: boolean;
    shape: boolean; // Added shape randomization
}

export const DEFAULT_SETTINGS: AppSettings = {
    backgroundColor: '#ffffff',
    noiseOpacity: 0,
    noiseFreq: 0, 
    blendMode: 'overlay',
    animation: true,
    speed: 1.0,
    motionType: 'float',
    globalBlur: 80,
    harmonyMode: 'analogous',
    aspectRatio: '16:9'
};