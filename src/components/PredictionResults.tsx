import React from 'react';
import { Activity, AlertTriangle, Clock, Cpu, Download, FileText, Layers, RefreshCw, GitFork } from 'lucide-react';
import { PATHOLOGY_DESCRIPTIONS, WAGNER_DEFINITIONS } from '../constants/clinicalData';
import { PathologyClass, PredictionResult, WagnerGrade } from '../types/dfu';

interface PredictionResultsProps {
  result: PredictionResult;
  onReset: () => void;
  onOpenReport: () => void;
  onScrollToExplainability: () => void;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({
  result,
  onReset,
  onOpenReport,
  onScrollToExplainability,
}) => {
  const getProbability = (cls: PathologyClass): number => {
    const found = result.pathologyScores.find((s) => s.className === cls);
    return found ? found.probability : 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Summary Card */}
      <div className="bg-[#181411] rounded-xl border border-[#40372E] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#40372E]">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#40372E] shrink-0 bg-[#100904]">
              <img
                src={result.originalImageDataUrl}
                alt="Wound analyzed"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 text-left">
              <div className="text-xs font-mono text-[#817568] uppercase tracking-wider">
                INFERENCE OUTPUT · SESSION ID: {result.id}
              </div>
              <h2 className="text-2xl sm:text-3xl font-normal text-[#FFEDD7] tracking-tight flex flex-wrap items-baseline gap-2">
                <span>{result.predictedPathology}</span>
                <span className="text-[#40372E] font-light">/</span>
                <span className="text-[#DC5000]">Wagner Grade {result.predictedWagnerGrade}</span>
              </h2>
              <div className="text-xs text-[#817568] pt-1 flex flex-wrap items-center gap-3 font-mono">
                <span>Model: {result.modelVersion}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#817568]" />
                  <span className="tabular-nums text-[#B7AA98]">{result.inferenceDurationMs} ms</span>
                </span>
                <span>·</span>
                <span>Target: {result.device}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start">
            <button
              onClick={onScrollToExplainability}
              className="px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Attribution Suite</span>
            </button>
            <button
              onClick={onOpenReport}
              className="px-4 py-2.5 text-xs font-medium tracking-wider text-[#FFEDD7] bg-[#241C15] hover:bg-[#100904] border border-[#40372E] rounded transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#817568]" />
              <span>Export Audit JSON</span>
            </button>
            <button
              onClick={onReset}
              className="px-3.5 py-2.5 text-xs font-medium text-[#B7AA98] hover:text-[#FFEDD7] bg-[#100904] hover:bg-[#241C15] border border-[#40372E] rounded transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Dual Primary Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Panel 1: Pathology Classification */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FFEDD7]">
                <Layers className="w-4 h-4 text-[#DC5000]" />
                <span className="uppercase tracking-wider">Predictive Axis 1 · Pathology Taxonomy</span>
              </div>
              <span className="text-xs font-mono text-[#817568]">Softmax Margin</span>
            </div>

            <div className="p-5 rounded-lg border border-[#40372E] bg-[#100904] space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-mono text-[#817568] uppercase">Class Determination</div>
                  <div className="text-lg font-medium text-[#FFEDD7] mt-0.5">
                    {result.predictedPathology}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-[#817568] uppercase">Model Confidence</div>
                  <div className="text-lg font-mono font-medium text-[#DC5000] tabular-nums mt-0.5">
                    {(result.pathologyConfidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Class Probability Distribution Bars */}
              <div className="space-y-2.5 pt-2 border-t border-[#40372E]/50">
                {(['None', 'Infection', 'Ischaemia', 'Both'] as PathologyClass[]).map((cls) => {
                  const prob = getProbability(cls);
                  const isTop = cls === result.predictedPathology;
                  return (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={isTop ? 'text-[#FFEDD7] font-medium' : 'text-[#817568]'}>
                          {cls}
                        </span>
                        <span className={`tabular-nums ${isTop ? 'text-[#DC5000] font-medium' : 'text-[#817568]'}`}>
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#181411] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${
                            isTop ? 'bg-[#DC5000]' : 'bg-[#40372E]'
                          }`}
                          style={{ width: `${Math.max(2, prob * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pathology Clinical Summary Note */}
              <div className="pt-2 text-xs text-[#B7AA98] border-t border-[#40372E]/50 leading-relaxed">
                {PATHOLOGY_DESCRIPTIONS[result.predictedPathology]}
              </div>
            </div>
          </div>

          {/* Panel 2: Wagner Severity Grading */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FFEDD7]">
                <Cpu className="w-4 h-4 text-[#DC5000]" />
                <span className="uppercase tracking-wider">Predictive Axis 2 · Wagner Ulcer Staging</span>
              </div>
              <span className="text-xs font-mono text-[#817568]">Ordinal Continuum</span>
            </div>

            <div className="p-5 rounded-lg border border-[#40372E] bg-[#100904] space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-mono text-[#817568] uppercase">Severity Staging</div>
                  <div className="text-lg font-medium text-[#FFEDD7] mt-0.5">
                    Wagner Grade {result.predictedWagnerGrade}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-[#817568] uppercase">Ordinal Score</div>
                  <div className="text-lg font-mono font-medium text-[#DC5000] tabular-nums mt-0.5">
                    {result.wagnerOrdinalScore.toFixed(2)} / 4.00
                  </div>
                </div>
              </div>

              {/* Ordinal Step Bar Indicators */}
              <div className="grid grid-cols-5 gap-1.5 pt-2">
                {([0, 1, 2, 3, 4] as WagnerGrade[]).map((grade) => {
                  const isActive = result.predictedWagnerGrade === grade;
                  const isPast = result.predictedWagnerGrade > grade;
                  return (
                    <div
                      key={grade}
                      className={`p-2 rounded text-center border transition-all ${
                        isActive
                          ? 'border-[#DC5000] bg-[#241C15] text-[#FFEDD7]'
                          : isPast
                          ? 'border-[#40372E] bg-[#181411] text-[#B7AA98]'
                          : 'border-[#40372E]/40 bg-[#100904] text-[#817568]'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase">G{grade}</div>
                      <div className="text-[11px] font-mono mt-0.5 tabular-nums">
                        {WAGNER_DEFINITIONS[grade].ordinalScore.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wagner Definition & Significance */}
              <div className="space-y-2 pt-2 border-t border-[#40372E]/50 text-xs text-[#B7AA98] leading-relaxed">
                <div>
                  <span className="font-mono text-[#FFEDD7] text-[11px] uppercase tracking-wider block">
                    Penetration Depth
                  </span>
                  <span>{result.wagnerDetails.definition}</span>
                </div>
                <div>
                  <span className="font-mono text-[#FFEDD7] text-[11px] uppercase tracking-wider block">
                    Surgical / Clinical Implication
                  </span>
                  <span className="text-[#817568]">{result.wagnerDetails.clinicalSignificance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual-Branch Feature Fusion Telemetry */}
        <div className="mt-8 pt-6 border-t border-[#40372E] text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFEDD7] mb-3">
            <GitFork className="w-3.5 h-3.5 text-[#DC5000]" />
            <span className="uppercase tracking-wider">Dual-Branch Metric Alignment Telemetry</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-[#100904] border border-[#40372E] rounded-lg">
              <span className="text-[#817568] block">CNN Attribution Ratio</span>
              <span className="text-[#FFEDD7] font-medium mt-1 block tabular-nums">
                {(result.dualBranchDetails.efficientNetV2AttributionRatio * 100).toFixed(1)}% (EfficientNetV2)
              </span>
            </div>
            <div className="p-3.5 bg-[#100904] border border-[#40372E] rounded-lg">
              <span className="text-[#817568] block">Transformer Context Ratio</span>
              <span className="text-[#FFEDD7] font-medium mt-1 block tabular-nums">
                {(result.dualBranchDetails.swinTinyAttributionRatio * 100).toFixed(1)}% (Swin-Tiny)
              </span>
            </div>
            <div className="p-3.5 bg-[#100904] border border-[#40372E] rounded-lg">
              <span className="text-[#817568] block">Alignment Loss</span>
              <span className="text-[#DC5000] font-medium mt-1 block tabular-nums">
                {result.dualBranchDetails.representationAlignmentLoss.toFixed(4)}
              </span>
            </div>
            <div className="p-3.5 bg-[#100904] border border-[#40372E] rounded-lg">
              <span className="text-[#817568] block">Architecture Embedding</span>
              <span className="text-[#FFEDD7] font-medium mt-1 block">
                512-d Shared Latent Space
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
