
import { useState, useRef, useEffect, useCallback } from 'react';
import { AppSettings, AuroraNode, DEFAULT_SETTINGS, RandomizationConfig, HarmonyMode, ShapeType } from '../types';
import { generateRandomNodes, createNode, hslToHex } from '../utils';

export const useAurora = () => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [nodes, setNodes] = useState<AuroraNode[]>([]);
    const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(-1);
    
    // Refs for animation loop to access latest state without triggering re-renders
    const nodesRef = useRef<AuroraNode[]>([]);
    const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS);

    // Initialize
    useEffect(() => {
        const initialNodes = generateRandomNodes(4);
        setNodes(initialNodes);
        nodesRef.current = JSON.parse(JSON.stringify(initialNodes));
    }, []);

    // Sync refs when state changes
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const updateNodes = useCallback((newNodes: AuroraNode[]) => {
        setNodes(newNodes);
        nodesRef.current = newNodes; // Sync ref immediately
    }, []);

    const updateNode = useCallback((index: number, updates: Partial<AuroraNode>) => {
        setNodes(prev => {
            const next = [...prev];
            if (next[index]) {
                const updatedNode = { ...next[index], ...updates };
                
                // Important: Update baseValues if specific properties are manually changed
                // This ensures oscillation happens around the new value
                if (updates.width !== undefined) updatedNode.baseValues.width = updates.width;
                if (updates.height !== undefined) updatedNode.baseValues.height = updates.height;
                if (updates.rotation !== undefined) updatedNode.baseValues.rotation = updates.rotation;

                // If position changed manually, update origin for animation
                if (updates.x !== undefined) updatedNode.ox = updates.x;
                if (updates.y !== undefined) updatedNode.oy = updates.y;
                
                next[index] = updatedNode;
                nodesRef.current[index] = updatedNode; // Sync ref
            }
            return next;
        });
    }, []);

    const addNode = useCallback(() => {
        const newNode = createNode(50, 50, '#38bdf8');
        setNodes(prev => {
            const next = [...prev, newNode];
            nodesRef.current = next;
            return next;
        });
        setSelectedNodeIndex(nodes.length);
    }, [nodes.length]);

    const removeNode = useCallback((index: number) => {
        setNodes(prev => {
            const next = prev.filter((_, i) => i !== index);
            nodesRef.current = next;
            return next;
        });
        setSelectedNodeIndex(-1);
    }, []);

    // Unified Randomization Logic
    const applyRandomization = useCallback((config: RandomizationConfig) => {
        setNodes(prev => {
            // 1. Determine Color Strategy
            let baseHue = Math.random() * 360;
            let harmonyMode: HarmonyMode = settings.harmonyMode;

            if (config.colors) {
                if (config.colorStrategy === 'random') {
                    harmonyMode = Math.random() > 0.5 ? 'analogous' : 'complementary';
                } else if (config.colorStrategy !== 'current') {
                    harmonyMode = config.colorStrategy as HarmonyMode;
                }
                
                // Update global setting if strategy changed effectively
                if (config.colorStrategy !== 'current') {
                    setSettings(s => ({ ...s, harmonyMode }));
                }
            }

            const next = prev.map((node, i) => {
                const newNode = { ...node };

                // Randomize Colors
                if (config.colors) {
                    let h;
                    if (harmonyMode === 'analogous') h = (baseHue + (i * 30)) % 360;
                    else h = (baseHue + (i % 2 === 0 ? 0 : 180)) % 360;
                    newNode.color = hslToHex(h, 80, 60);
                }

                // Randomize Position
                if (config.position) {
                    const newX = Math.random() * 80 + 10;
                    const newY = Math.random() * 80 + 10;
                    newNode.x = newX;
                    newNode.y = newY;
                    newNode.ox = newX;
                    newNode.oy = newY;
                }

                // Randomize Width
                if (config.width) {
                    const newW = Math.random() * 30 + 30;
                    newNode.width = newW;
                    newNode.baseValues.width = newW;
                }

                // Randomize Height
                if (config.height) {
                    const newH = Math.random() * 30 + 30;
                    newNode.height = newH;
                    newNode.baseValues.height = newH;
                }

                // Randomize Rotation
                if (config.rotation) {
                    const newRot = Math.random() * 360;
                    newNode.rotation = newRot;
                    newNode.baseValues.rotation = newRot;
                }

                // Randomize Shape
                if (config.shape) {
                    const shapes: ShapeType[] = ['round', 'square', 'triangle'];
                    newNode.shape = shapes[Math.floor(Math.random() * shapes.length)];
                }

                return newNode;
            });

            nodesRef.current = next;
            return next;
        });
    }, [settings.harmonyMode]);

    return {
        nodes,
        nodesRef, // Exposed for Canvas loop
        settings,
        setSettings,
        selectedNodeIndex,
        setSelectedNodeIndex,
        updateNodes,
        updateNode,
        addNode,
        removeNode,
        applyRandomization
    };
};
