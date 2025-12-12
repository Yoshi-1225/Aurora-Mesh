
import React, { useState } from 'react';
import { GlobalSettingsPanel } from './components/Panels/GlobalSettingsPanel';
import { EditNodePanel } from './components/Panels/EditNodePanel';
import { NodeTopBar } from './components/Bar/NodeTopBar';
import { AnimationControls } from './components/Bar/AnimationControls';
import { MeshCanvas } from './components/Workspace/MeshCanvas';
import { ExportModal } from './components/Modals/ExportModal';
import { useAurora } from './hooks/useAurora';

const App: React.FC = () => {
    const {
        nodes,
        nodesRef,
        settings,
        setSettings,
        selectedNodeIndex,
        setSelectedNodeIndex,
        updateNodes,
        updateNode,
        addNode,
        removeNode,
        applyRandomization
    } = useAurora();

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Derived state for the right panel
    const selectedNode = selectedNodeIndex >= 0 ? nodes[selectedNodeIndex] : null;

    return (
        <div className="flex h-screen w-screen text-sm bg-slate-950 text-slate-200 font-sans overflow-hidden">
            {/* Left Panel: Global Visual Settings */}
            <GlobalSettingsPanel 
                settings={settings}
                onUpdate={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
                onExport={() => setIsExportModalOpen(true)}
            />

            {/* Center: Canvas Workspace */}
            <div className="flex-1 relative flex flex-col min-w-0">
                
                {/* Floating Top Bar (Visual Node List) */}
                <NodeTopBar 
                    nodes={nodes}
                    selectedNodeIndex={selectedNodeIndex}
                    onSelectNode={setSelectedNodeIndex}
                    onAddNode={addNode}
                />

                <MeshCanvas 
                    nodes={nodes}
                    settings={settings}
                    nodesRef={nodesRef}
                    selectedNodeIndex={selectedNodeIndex}
                    onSelectNode={setSelectedNodeIndex}
                    onUpdateNodePos={(index, x, y) => updateNode(index, { x, y })}
                />

                {/* Floating Bottom Bar (Animation Controls) */}
                <AnimationControls 
                    settings={settings}
                    onUpdate={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
                />
            </div>

            {/* Right Panel: Contextual Inspector (Generator or Node Editor) */}
            <EditNodePanel 
                node={selectedNode}
                index={selectedNodeIndex}
                onClose={() => setSelectedNodeIndex(-1)}
                onDelete={removeNode}
                onUpdateNode={updateNode}
                onRandomize={applyRandomization}
            />

            {/* Modals */}
            <ExportModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                nodes={nodes}
                nodesRef={nodesRef}
                settings={settings}
            />
        </div>
    );
};

export default App;
