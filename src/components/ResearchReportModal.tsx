import React from 'react';
import { X, Download, Printer, CheckCircle, ShieldAlert } from 'lucide-react';
import { PredictionResult } from '../types/dfu';

interface ResearchReportModalProps {
  result: PredictionResult;
  onClose: () => void;
}

export const ResearchReportModal: React.FC<ResearchReportModalProps> = ({ result, onClose }) => {
  const handleDownloadJson = () => {
    const reportData = {
      title: 'DFU Insight — Model Inference & Explainability Audit Report',
      requestId: result.id,
      timestamp: result.timestamp,
      modelVersion: result.modelVersion,
      device: result.device,
      imageMetadata: {
        sha256: result.imageSha256,
        dimensions: result.imageDimensions,
      },
      predictions: {
        pathology: {
          predictedClass: result.predictedPathology,
          confidence: result.pathologyConfidence,
          classScores: result.pathologyScores,
        },
        wagnerSeverity: {
          grade: result.predictedWagnerGrade,
          continuousScore: result.wagnerOrdinalScore,
          definition: result.wagnerDetails.definition,
          clinicalSignificance: result.wagnerDetails.clinicalSignificance,
        },
      },
      dualBranchTelemetry: result.dualBranchDetails,
      explainabilitySummary: {
        gradcam: { meanAttribution: result.explainability.gradcam.attributionMean },
        swinAttention: { meanAttribution: result.explainability.swin_attention.attributionMean },
        integratedGradients: { meanAttribution: result.explainability.integrated_gradients.attributionMean },
        kernelShap: { meanAttribution: result.explainability.kernel_shap.attributionMean },
      },
      disclaimer:
        'RESEARCH PROTOTYPE REPORT: This document contains investigational machine learning predictions generated for academic research and model auditing. It is not a clinical laboratory report or medical diagnostic finding.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DFU_Insight_Report_${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181411] rounded-xl border border-[#40372E] max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl space-y-6 text-left text-[#FFEDD7]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#40372E]">
          <div>
            <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
              Research Prototype Audit Record
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-[#FFEDD7] tracking-tight mt-0.5">
              DFU Insight Model Inference Report
            </h3>
            <div className="text-xs font-mono text-[#817568] mt-1">
              Request ID: {result.id} · Generated: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#817568] hover:text-[#FFEDD7] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Details Grid */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#100904] rounded-lg border border-[#40372E] font-mono">
            <div>
              <span className="text-[#817568]">IMAGE SHA-256:</span>
              <p className="text-[#FFEDD7] truncate mt-0.5" title={result.imageSha256}>
                {result.imageSha256 || 'Calculated on client'}
              </p>
            </div>
            <div>
              <span className="text-[#817568]">INPUT RESOLUTION:</span>
              <p className="text-[#FFEDD7] mt-0.5">
                {result.imageDimensions.width} × {result.imageDimensions.height} px
              </p>
            </div>
            <div>
              <span className="text-[#817568]">MODEL REPOSITORY:</span>
              <p className="text-[#FFEDD7] mt-0.5">DFU-Wagner net ({result.modelVersion})</p>
            </div>
            <div>
              <span className="text-[#817568]">INFERENCE LATENCY:</span>
              <p className="text-[#DC5000] mt-0.5 tabular-nums">{result.inferenceDurationMs} ms</p>
            </div>
          </div>

          {/* Pathology Section */}
          <div className="border border-[#40372E] rounded-lg p-4 bg-[#100904] space-y-2">
            <div className="font-mono text-[#FFEDD7] uppercase tracking-wider text-[11px]">
              1. Pathology Classification Head
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-[#817568]">Top-Ranked Class:</span>
              <span className="text-[#FFEDD7] font-medium font-mono text-sm">
                {result.predictedPathology} ({(result.pathologyConfidence * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#40372E]/50 font-mono text-[11px] text-[#B7AA98]">
              {result.pathologyScores.map((score) => (
                <div key={score.className} className="flex justify-between">
                  <span>{score.className}</span>
                  <span className="tabular-nums">{(score.probability * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wagner Section */}
          <div className="border border-[#40372E] rounded-lg p-4 bg-[#100904] space-y-2">
            <div className="font-mono text-[#FFEDD7] uppercase tracking-wider text-[11px]">
              2. Wagner Ordinal Severity Staging
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-[#817568]">Predicted Wagner Grade:</span>
              <span className="text-[#DC5000] font-medium font-mono text-sm">
                Grade {result.predictedWagnerGrade} (Continuous: {result.wagnerOrdinalScore.toFixed(2)})
              </span>
            </div>
            <p className="text-[#B7AA98] pt-1 leading-relaxed">
              <span className="font-mono text-[#817568] uppercase text-[10px] block">Definition:</span>
              <span>{result.wagnerDetails.definition}</span>
            </p>
            <p className="text-[#B7AA98] leading-relaxed">
              <span className="font-mono text-[#817568] uppercase text-[10px] block">Clinical Implication:</span>
              <span>{result.wagnerDetails.clinicalSignificance}</span>
            </p>
          </div>

          {/* Explainability Cross-Validation */}
          <div className="border border-[#40372E] rounded-lg p-4 bg-[#100904] space-y-3">
            <div className="font-mono text-[#FFEDD7] uppercase tracking-wider text-[11px]">
              3. Explainable AI Audit Summary
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-[#181411] border border-[#40372E] rounded">
                <span className="text-[#817568]">Grad-CAM Saliency:</span>
                <p className="text-[#FFEDD7] font-medium mt-0.5 tabular-nums">
                  Mean {result.explainability.gradcam.attributionMean.toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-[#181411] border border-[#40372E] rounded">
                <span className="text-[#817568]">Swin Token Rollout:</span>
                <p className="text-[#FFEDD7] font-medium mt-0.5 tabular-nums">
                  Mean {result.explainability.swin_attention.attributionMean.toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-[#181411] border border-[#40372E] rounded">
                <span className="text-[#817568]">Integrated Gradients:</span>
                <p className="text-[#FFEDD7] font-medium mt-0.5 tabular-nums">
                  Mean {result.explainability.integrated_gradients.attributionMean.toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-[#181411] border border-[#40372E] rounded">
                <span className="text-[#817568]">KernelSHAP Superpixels:</span>
                <p className="text-[#FFEDD7] font-medium mt-0.5 tabular-nums">
                  Mean {result.explainability.kernel_shap.attributionMean.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3.5 bg-[#181411] border border-[#40372E] rounded-lg text-[#B7AA98] flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#DC5000] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-[#FFEDD7]">Non-Diagnostic Research Protocol:</strong> This report is generated by an experimental research system. It does not replace clinical judgment, bedside debridement, microbial cultures, or angiography.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#40372E]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-[#817568] hover:text-[#FFEDD7] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-mono text-[#FFEDD7] bg-[#241C15] hover:bg-[#100904] border border-[#40372E] rounded transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#817568]" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-5 py-2 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
