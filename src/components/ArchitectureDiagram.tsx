import React, { useState } from 'react';
import { Cpu, Layers, GitFork, CheckCircle, Network, Sliders } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [activeBranch, setActiveBranch] = useState<'both' | 'cnn' | 'transformer'>('both');
  const [selectedModule, setSelectedModule] = useState<string>('fusion');

  const moduleDescriptions: Record<string, { title: string; techSpecs: string; role: string }> = {
    input: {
      title: 'Multimodal Photographic Input',
      techSpecs: '384 × 384 × 3 RGB tensor, standard ImageNet mean & std normalization',
      role: 'Captures high-resolution macro-photographic diabetic foot ulcer lesions, periwound erythema, and peripheral plantar tissue.',
    },
    cnn: {
      title: 'Branch 1: EfficientNetV2-S (Local Convolutional Feature Extractor)',
      techSpecs: 'Fused-MBConv & MBConv stages, 21.5M params, outputs 1280-d spatial feature map',
      role: 'Extracts localized high-frequency spatial features, micro-vascular changes, ulcer crater depth, granulation tissue, and purulent exudate.',
    },
    transformer: {
      title: 'Branch 2: Swin-Tiny Transformer (Shifted-Window Self-Attention)',
      techSpecs: 'Window size 7×7, 4 hierarchical stages, 28.3M params, outputs 768-d token representation',
      role: 'Models long-range spatial dependencies between central ulcer beds, peripheral ischemic zones, and global limb anatomical landmarks.',
    },
    fusion: {
      title: 'Cross-Attention Representation Fusion & Alignment Module',
      techSpecs: 'Multi-head cross-attention projection, projection dimension 512, cosine similarity alignment',
      role: 'Aligns and projects heterogeneous CNN inductive biases and Transformer self-attentions into a shared metric latent space.',
    },
    pathologyHead: {
      title: 'Pathology Classification Head',
      techSpecs: 'MLP with LayerNorm and Dropout (p=0.2), 4 output logits with Softmax',
      role: 'Classifies wound into 4 distinct pathology states: None, Infection, Ischaemia, or Both.',
    },
    wagnerHead: {
      title: 'Wagner Ordinal Severity Grading Head',
      techSpecs: 'Cumulative link ordinal projection, constrained threshold margins, output range [0, 4]',
      role: 'Computes ordinal clinical severity score corresponding directly to Wagner Grade 0 through Grade 4.',
    },
  };

  const currentInfo = moduleDescriptions[selectedModule] || moduleDescriptions.fusion;

  return (
    <div className="bg-[#181411] rounded-xl border border-[#40372E] p-6 md:p-10 shadow-2xl space-y-8">
      {/* Header and Branch Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-6 border-b border-[#40372E]/60">
        <div>
          <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
            Dual-Branch Architecture
          </div>
          <h3 className="text-2xl sm:text-3xl font-normal text-[#FFEDD7] tracking-tight mt-1">
            DFU-Wagner net (DFU-SIAM v3)
          </h3>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-[#100904] border border-[#40372E] rounded-lg self-start">
          <button
            onClick={() => setActiveBranch('both')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-all ${
              activeBranch === 'both'
                ? 'bg-[#241C15] text-[#FFEDD7] shadow-sm'
                : 'text-[#817568] hover:text-[#B7AA98]'
            }`}
          >
            Unified Network
          </button>
          <button
            onClick={() => setActiveBranch('cnn')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-all ${
              activeBranch === 'cnn'
                ? 'bg-[#241C15] text-[#FFEDD7] shadow-sm'
                : 'text-[#817568] hover:text-[#B7AA98]'
            }`}
          >
            CNN Branch
          </button>
          <button
            onClick={() => setActiveBranch('transformer')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-all ${
              activeBranch === 'transformer'
                ? 'bg-[#241C15] text-[#FFEDD7] shadow-sm'
                : 'text-[#817568] hover:text-[#B7AA98]'
            }`}
          >
            Swin Transformer
          </button>
        </div>
      </div>

      {/* Schematic Diagram Canvas */}
      <div className="py-4 overflow-x-auto">
        <div className="min-w-[700px] max-w-4xl mx-auto flex flex-col items-center gap-6">
          {/* Input Node */}
          <button
            onClick={() => setSelectedModule('input')}
            className={`w-72 p-3.5 rounded-lg border text-center transition-all ${
              selectedModule === 'input'
                ? 'border-[#DC5000] bg-[#241C15] ring-1 ring-[#DC5000]'
                : 'border-[#40372E] bg-[#100904] hover:border-[#817568]'
            }`}
          >
            <div className="text-[10px] font-mono text-[#817568] uppercase tracking-wider">
              Normalized Tensor
            </div>
            <div className="text-sm font-medium text-[#FFEDD7] mt-0.5">Photographic Input (384 × 384 × 3)</div>
          </button>

          {/* Divergence Line */}
          <div className="w-px h-6 bg-[#40372E]" />

          {/* Dual Backbone Branches */}
          <div className="w-full grid grid-cols-2 gap-8 relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-[#40372E]" />

            {/* Left: EfficientNetV2-S */}
            <button
              onClick={() => setSelectedModule('cnn')}
              className={`p-5 rounded-lg border text-left transition-all ${
                activeBranch === 'transformer' ? 'opacity-30 grayscale' : 'opacity-100'
              } ${
                selectedModule === 'cnn'
                  ? 'border-[#DC5000] bg-[#241C15] ring-1 ring-[#DC5000]'
                  : 'border-[#40372E] bg-[#100904] hover:border-[#817568]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-[#DC5000]">
                <Cpu className="w-3.5 h-3.5" />
                <span className="tracking-wider">BRANCH A · CONVOLUTIONAL</span>
              </div>
              <div className="text-base font-medium text-[#FFEDD7] mt-1.5">EfficientNetV2-S</div>
              <div className="text-xs text-[#B7AA98] mt-1 leading-relaxed">
                Fused-MBConv stages · Extracts fine ulcer texture, margin clarity & purulence
              </div>
              <div className="mt-3 text-[11px] font-mono text-[#817568] bg-[#181411] px-2.5 py-1 rounded border border-[#40372E]/50">
                Output: 1,280-dim feature map
              </div>
            </button>

            {/* Right: Swin-Tiny */}
            <button
              onClick={() => setSelectedModule('transformer')}
              className={`p-5 rounded-lg border text-left transition-all ${
                activeBranch === 'cnn' ? 'opacity-30 grayscale' : 'opacity-100'
              } ${
                selectedModule === 'transformer'
                  ? 'border-[#DC5000] bg-[#241C15] ring-1 ring-[#DC5000]'
                  : 'border-[#40372E] bg-[#100904] hover:border-[#817568]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-[#0d9488]">
                <Network className="w-3.5 h-3.5" />
                <span className="tracking-wider">BRANCH B · VISION TRANSFORMER</span>
              </div>
              <div className="text-base font-medium text-[#FFEDD7] mt-1.5">Swin-Tiny Transformer</div>
              <div className="text-xs text-[#B7AA98] mt-1 leading-relaxed">
                Shifted-window self-attention · Models long-range contextual relationships
              </div>
              <div className="mt-3 text-[11px] font-mono text-[#817568] bg-[#181411] px-2.5 py-1 rounded border border-[#40372E]/50">
                Output: 768-dim token sequence
              </div>
            </button>
          </div>

          {/* Convergence Line */}
          <div className="w-px h-6 bg-[#40372E]" />

          {/* Fusion Module */}
          <button
            onClick={() => setSelectedModule('fusion')}
            className={`w-full max-w-xl p-5 rounded-lg border text-center transition-all ${
              selectedModule === 'fusion'
                ? 'border-[#DC5000] bg-[#241C15] ring-1 ring-[#DC5000]'
                : 'border-[#40372E] bg-[#100904] hover:border-[#817568]'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#DC5000]">
              <GitFork className="w-3.5 h-3.5" />
              <span className="tracking-wider">CROSS-ATTENTION FUSION & ALIGNMENT</span>
            </div>
            <div className="text-base font-medium text-[#FFEDD7] mt-1.5">
              Unified Multi-Task Embedding (512-dim)
            </div>
            <div className="text-xs text-[#B7AA98] mt-0.5">
              Cosine feature alignment + Cross-attention gating
            </div>
          </button>

          {/* Head Divergence Line */}
          <div className="w-px h-6 bg-[#40372E]" />

          {/* Dual Heads */}
          <div className="w-full grid grid-cols-2 gap-8">
            <button
              onClick={() => setSelectedModule('pathologyHead')}
              className={`p-5 rounded-lg border text-left transition-all ${
                selectedModule === 'pathologyHead'
                  ? 'border-[#DC5000] bg-[#241C15] ring-1 ring-[#DC5000]'
                  : 'border-[#40372E] bg-[#100904] hover:border-[#817568]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-[#DC5000]">
                <Layers className="w-3.5 h-3.5" />
                <span className="tracking-wider">TASK 1 · CLASSIFICATION HEAD</span>
              </div>
              <div className="text-base font-medium text-[#FFEDD7] mt-1.5">Pathology Head</div>
              <div className="text-xs text-[#B7AA98] mt-1">
                Softmax probabilities across 4 discrete pathology classes:
              </div>
              <div className="mt-2.5 text-xs font-mono text-[#B7AA98] flex flex-wrap gap-2">
                <span className="text-[#FFEDD7]">None</span>
                <span className="text-[#817568]">·</span>
                <span className="text-rose-400">Infection</span>
                <span className="text-[#817568]">·</span>
                <span className="text-amber-400">Ischaemia</span>
                <span className="text-[#817568]">·</span>
                <span className="text-orange-400">Both</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedModule('wagnerHead')}
              className={`p-5 rounded-lg border text-left transition-all ${
                selectedModule === 'wagnerHead'
                  ? 'border-[#DC5000] bg-[#241C15] ring-1 ring-[#DC5000]'
                  : 'border-[#40372E] bg-[#100904] hover:border-[#817568]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-[#DC5000]">
                <Sliders className="w-3.5 h-3.5" />
                <span className="tracking-wider">TASK 2 · ORDINAL REGRESSION</span>
              </div>
              <div className="text-base font-medium text-[#FFEDD7] mt-1.5">Wagner Severity Head</div>
              <div className="text-xs text-[#B7AA98] mt-1">
                Cumulative link ordinal prediction with constrained threshold margins:
              </div>
              <div className="mt-2.5 text-xs font-mono text-[#B7AA98] flex gap-2">
                <span>G0</span>
                <span className="text-[#817568]">·</span>
                <span>G1</span>
                <span className="text-[#817568]">·</span>
                <span>G2</span>
                <span className="text-[#817568]">·</span>
                <span>G3</span>
                <span className="text-[#817568]">·</span>
                <span className="text-[#DC5000] font-semibold">G4</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Detail Inspector Drawer */}
      <div className="p-5 bg-[#100904] rounded-lg border border-[#40372E] text-xs">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-[#DC5000] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-mono text-[#817568] uppercase tracking-wider text-[11px]">
              Inspected Module Specification
            </div>
            <div className="text-sm font-medium text-[#FFEDD7]">{currentInfo.title}</div>
            <p className="text-xs text-[#B7AA98] leading-relaxed">{currentInfo.role}</p>
            <div className="font-mono text-[#DC5000] text-[11px] pt-1">
              Parameters & Tensor: {currentInfo.techSpecs}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
