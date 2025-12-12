
import { AuroraNode, AppSettings } from './types';

/**
 * Updates the physics and properties of nodes for a single animation frame.
 */
export const simulateFrame = (
    nodes: AuroraNode[],
    settings: AppSettings,
    time: number
) => {
    const speed = settings.speed;
    
    nodes.forEach(node => {
        // 1. Position Animation
        if (settings.motionType === 'float') {
            node.x += node.vx * speed;
            node.y += node.vy * speed;
            node.rotation += node.vRot * speed;
            
            // Bounce logic
            if (node.x < -20 || node.x > 120) node.vx *= -1;
            if (node.y < -20 || node.y > 120) node.vy *= -1;
        } 
        else if (settings.motionType === 'breath') {
            node.x = node.ox + Math.sin(time + node.phase) * 3;
            node.y = node.oy + Math.cos(time + node.phase) * 3;
        }
        else if (settings.motionType === 'circular') {
            node.x = node.ox + Math.cos(time + node.phase) * 10;
            node.y = node.oy + Math.sin(time + node.phase) * 10;
            node.rotation += 0.2 * speed;
        }

        // 2. Property Oscillation (User toggled checkmarks)
        // Uses baseValues as the center point
        if (node.animatingProps.width) {
            const fluctuation = node.baseValues.width * 0.3; // 30% variation
            node.width = node.baseValues.width + Math.sin(time * 2 + node.phase) * fluctuation;
        }
        if (node.animatingProps.height) {
            const fluctuation = node.baseValues.height * 0.3;
            node.height = node.baseValues.height + Math.cos(time * 2.5 + node.phase) * fluctuation;
        }
        if (node.animatingProps.rotation) {
            // Swing back and forth 30 degrees
            node.rotation = node.baseValues.rotation + Math.sin(time * 0.5 + node.phase) * 30;
        }
    });
};
