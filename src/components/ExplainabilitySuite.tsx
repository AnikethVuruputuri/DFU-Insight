import React, { useState } from 'react';
import { Eye, Layers, HelpCircle, SplitSquareVertical, SlidersHorizontal, Info, Sparkles } from 'lucide-react';
import { PathologyClass, PredictionResult, XAIMethod } from '../types/dfu';

interface ExplainabilitySuiteProps {
  result: PredictionResult;
}

export const ExplainabilitySuite: React.FC<ExplainabilitySuiteProps> = ({ result }) => {
  const [selectedMethod, setSelectedMethod] = useState<XAIMethod>('gradcam');
  const [viewMode, setViewMode] = useState<'side_by_side' | 'single_overlay'>('side_by_side');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.72);
  const [selectedTargetClass, setSelectedTargetClass] = useState<PathologyClass>(result.predictedPathology);

  const methodsList: { id: XAIMethod; name: string; category: string; description: string }[] = [
    {
      id: 'gradcam',
      name: 'Grad-CAM',
      category: 'CNN Feature Activation',
      description: 'Backpropagated gradients through EfficientNetV2 stage 6, localizing erythematous flare and purulent tissue debris.',
    },
    {
      id: 'swin_attention',
      name: 'Swin Token Rollout',
      category: 'Transformer Self-Attention',
      description: 'Hierarchical cross-window attention weights mapping spatial relationships between necrotic core and perilesional skin.',
    },
    {
      id: 'integrated_gradients',
      name: 'Integrated Gradients',
      category: 'Axiomatic Path Integral',
      description: 'Path integral of gradients along a straight line from black reference baseline to original input pixels.',
    },
    {
      id: 'kernel_shap',
      name: 'KernelSHAP',
      category: 'Superpixel Coalition',
      description: 'SLIC superpixel coalitions evaluated via weighted linear surrogate model to estimate local Shapley contributions.',
    },
  ];

  const currentMap = result.explainability[selectedMethod];

  return (
    <div id="explainability-suite" className="bg-[#181411] rounded-xl border border-[#40372E] p-6 sm:p-8 space-y-6 text-left">
      {/* Header and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#40372E]">
        <div>
          <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
            Visual Attribution Suite
          </div>
          <h3 className="text-xl sm:text-2xl font-normal text-[#FFEDD7] tracking-tight mt-0.5">
            Multi-Method Evidence & Spatial Attribution
          </h3>
        </div>

        {/* View Mode & Opacity Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#100904] border border-[#40372E] rounded-lg">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'side_by_side'
                  ? 'bg-[#241C15] text-[#FFEDD7]'
                  : 'text-[#817568] hover:text-[#B7AA98]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-[#DC5000]" />
              <span>Side-by-Side Gallery</span>
            </button>
            <button
              onClick={() => setViewMode('single_overlay')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                viewMode === 'single_overlay'
                  ? 'bg-[#241C15] text-[#FFEDD7]'
                  : 'text-[#817568] hover:text-[#B7AA98]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#DC5000]" />
              <span>Focused Inspector</span>
            </button>
          </div>

          {/* Opacity Scrubber */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#100904] border border-[#40372E] rounded-lg text-xs font-mono text-[#B7AA98]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#817568]" />
            <span>Heatmap Alpha:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-20 accent-[#DC5000] cursor-pointer"
            />
            <span className="w-8 tabular-nums font-medium text-[#FFEDD7]">{Math.round(overlayOpacity * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Target Class Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#100904] rounded-lg border border-[#40372E] text-xs">
        <div className="flex items-center gap-2 text-[#B7AA98]">
          <span className="font-mono uppercase tracking-wider text-[#FFEDD7]">Target Pathology Attribution:</span>
          <span className="text-[#817568] hidden sm:inline">
            (Evidence projected for predicted {result.predictedPathology})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['None', 'Infection', 'Ischaemia', 'Both'] as PathologyClass[]).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedTargetClass(cls)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedTargetClass === cls
                  ? 'bg-[#DC5000] text-white font-medium'
                  : 'bg-[#181411] text-[#817568] hover:text-[#FFEDD7] border border-[#40372E]'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Mode A: Side-by-Side Gallery */}
      {viewMode === 'side_by_side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {methodsList.map((m) => {
            const xai = result.explainability[m.id];
            const peakX = Math.round((xai.peakCoordinates?.x ?? 0.5) * 100);
            const peakY = Math.round((xai.peakCoordinates?.y ?? 0.5) * 100);
            return (
              <div
                key={m.id}
                className="bg-[#100904] rounded-xl border border-[#40372E] p-4 flex flex-col justify-between space-y-4 hover:border-[#817568] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono pb-2">
                    <span className="text-[#DC5000] uppercase">{m.name}</span>
                    <span className="text-[#817568]">{m.category.split(' ')[0]}</span>
                  </div>

                  {/* Overlaid Image Visual Canvas */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[#40372E] bg-black">
                    <img
                      src={result.originalImageDataUrl}
                      alt="Original wound"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <img
                      src={xai.dataUrl}
                      alt={`${m.name} heatmap`}
                      style={{ opacity: overlayOpacity }}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity"
                    />

                    {/* Peak Coordinate Reticle */}
                    <div
                      className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        left: `${peakX}%`,
                        top: `${peakY}%`,
                      }}
                    >
                      <div className="w-full h-full border border-white/80 rounded-full animate-ping opacity-60" />
                      <div className="w-2 h-2 bg-[#DC5000] rounded-full mx-auto my-1 shadow-[0_0_8px_#DC5000]" />
                    </div>

                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-[#100904]/80 border border-[#40372E] rounded text-[10px] font-mono text-[#B7AA98]">
                      Peak: [{peakX}%, {peakY}%]
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-[#40372E]/50">
                  <p className="text-[11px] text-[#817568] leading-relaxed">
                    {m.description}
                  </p>
                  <div className="flex justify-between text-[11px] font-mono text-[#817568]">
                    <span>Mean Saliency:</span>
                    <span className="text-[#FFEDD7] tabular-nums">
                      {xai.attributionMean.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mode B: Focused Inspector View */
        <div className="space-y-6">
          {/* Method Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#40372E] pb-3">
            {methodsList.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                  selectedMethod === m.id
                    ? 'bg-[#241C15] text-[#FFEDD7] border border-[#DC5000]'
                    : 'bg-[#100904] text-[#817568] border border-[#40372E] hover:text-[#B7AA98]'
                }`}
              >
                {m.name} · {m.category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Large Interactive Overlaid Canvas */}
            <div className="lg:col-span-8 bg-[#100904] rounded-xl border border-[#40372E] p-4">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-[#40372E] bg-black">
                <img
                  src={result.originalImageDataUrl}
                  alt="Original wound"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <img
                  src={currentMap.dataUrl}
                  alt={`${selectedMethod} heatmap`}
                  style={{ opacity: overlayOpacity }}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity"
                />

                <div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${Math.round((currentMap.peakCoordinates?.x ?? 0.5) * 100)}%`,
                    top: `${Math.round((currentMap.peakCoordinates?.y ?? 0.5) * 100)}%`,
                  }}
                >
                  <div className="w-full h-full border border-[#DC5000] rounded-full animate-ping opacity-75" />
                  <div className="w-2.5 h-2.5 bg-[#DC5000] rounded-full mx-auto my-1.5 shadow-[0_0_12px_#DC5000]" />
                </div>
              </div>

              {/* Colormap Legend Scale */}
              <div className="mt-4 pt-3 border-t border-[#40372E] flex items-center justify-between text-xs font-mono text-[#817568]">
                <span>0.0 (Null Saliency)</span>
                <div className="h-2 w-48 rounded bg-gradient-to-r from-blue-900 via-teal-500 via-yellow-400 to-[#DC5000] border border-[#40372E]" />
                <span>1.0 (Peak Saliency)</span>
              </div>
            </div>

            {/* Inspector Telemetry Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-[#100904] border border-[#40372E] rounded-xl space-y-3">
                <div className="text-xs font-mono text-[#DC5000] uppercase">Method Profile</div>
                <h4 className="text-lg font-medium text-[#FFEDD7]">{methodsList.find((m) => m.id === selectedMethod)?.name}</h4>
                <p className="text-xs text-[#B7AA98] leading-relaxed">
                  {methodsList.find((m) => m.id === selectedMethod)?.description}
                </p>
              </div>

              <div className="p-5 bg-[#100904] border border-[#40372E] rounded-xl space-y-3 text-xs font-mono">
                <div className="text-xs uppercase text-[#817568]">Spatial Metrics</div>
                <div className="divide-y divide-[#40372E]/50">
                  <div className="py-2 flex justify-between">
                    <span className="text-[#817568]">Peak Coordinate:</span>
                    <span className="text-[#FFEDD7] tabular-nums">
                      [{Math.round((currentMap.peakCoordinates?.x ?? 0.5) * 100)}%, {Math.round((currentMap.peakCoordinates?.y ?? 0.5) * 100)}%]
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#817568]">Attribution Mean:</span>
                    <span className="text-[#FFEDD7] tabular-nums">{currentMap.attributionMean.toFixed(4)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#817568]">Target Class:</span>
                    <span className="text-[#DC5000]">{selectedTargetClass}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
