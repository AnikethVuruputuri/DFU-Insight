import React, { useState, useRef } from 'react';
import { ArrowLeft, Play, RefreshCw, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { PredictionResults } from '../components/PredictionResults';
import { ExplainabilitySuite } from '../components/ExplainabilitySuite';
import { ResearchReportModal } from '../components/ResearchReportModal';
import { runInferencePipeline } from '../services/inferenceService';
import { BenchmarkSample, PredictionResult } from '../types/dfu';

interface AnalyzePageProps {
  onBackToHome: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onBackToHome }) => {
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<BenchmarkSample | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inferenceError, setInferenceError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const explainabilityRef = useRef<HTMLDivElement>(null);

  const handleImageSelected = (dataUrl: string, sampleInfo?: BenchmarkSample) => {
    setSelectedImageDataUrl(dataUrl);
    setSelectedSample(sampleInfo || null);
    setResult(null);
    setInferenceError(null);
  };

  const handleClear = () => {
    setSelectedImageDataUrl(null);
    setSelectedSample(null);
    setResult(null);
    setInferenceError(null);
  };

  const handleRunInference = async () => {
    if (!selectedImageDataUrl) return;

    setIsLoading(true);
    setInferenceError(null);

    try {
      const pred = await runInferencePipeline(selectedImageDataUrl);
      setResult(pred);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during inference.';
      setInferenceError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrollToExplainability = () => {
    explainabilityRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#100904] text-[#FFEDD7] min-h-[calc(100vh-80px)] selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 space-y-10 text-left pb-28">
        {/* Top Header & Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#40372E]">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="p-2 text-[#817568] hover:text-[#FFEDD7] rounded border border-[#40372E] bg-[#181411] hover:bg-[#241C15] transition-colors"
              title="Return to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-mono text-[#DC5000] tracking-widest uppercase">
                RESEARCH LABORATORY CONSOLE
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal text-[#FFEDD7] tracking-tight mt-0.5">
                Wound Image Analysis & Staging
              </h1>
            </div>
          </div>
        </div>

        {/* Main Upload Stage */}
        <div className="space-y-6">
          <ImageUploader
            onImageSelected={handleImageSelected}
            isLoading={isLoading}
            onClear={handleClear}
            selectedImageDataUrl={selectedImageDataUrl}
          />

          {/* Selected Sample Context Badge (if clicked from benchmark presets) */}
          {selectedSample && (
            <div className="p-4 bg-[#181411] border border-[#40372E] rounded-lg text-xs text-[#B7AA98] flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-[#FFEDD7]">Loaded Benchmark Case:</span> {selectedSample.name} · {selectedSample.lesionSite}
                <div className="text-[11px] text-[#817568] mt-1 font-mono">
                  Ground Truth: Pathology [{selectedSample.groundTruthPathology}], Wagner [Grade {selectedSample.groundTruthWagner}]
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#DC5000] bg-[#241C15] border border-[#40372E] px-2.5 py-1 rounded">
                Verified Clinical Annotation
              </span>
            </div>
          )}

          {/* Inference Action Trigger */}
          {selectedImageDataUrl && !result && (
            <div className="flex items-center justify-center pt-4">
              <button
                onClick={handleRunInference}
                disabled={isLoading}
                className={`px-8 py-4 text-xs font-medium tracking-wider uppercase text-white rounded transition-all flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-[#DC5000] ${
                  isLoading
                    ? 'bg-[#b84300] cursor-wait'
                    : 'bg-[#DC5000] hover:bg-[#b84300] shadow-lg shadow-[#DC5000]/10'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Dual-Branch Forward Pass & Attribution Maps...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute DFU-Wagner net Inference</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Inference Error Alert */}
          {inferenceError && (
            <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-rose-200">Inference Execution Error:</span> {inferenceError}
              </div>
            </div>
          )}
        </div>

        {/* Results and Explainability Section */}
        {result && (
          <div className="space-y-10 pt-4">
            <PredictionResults
              result={result}
              onReset={handleClear}
              onOpenReport={() => setIsReportOpen(true)}
              onScrollToExplainability={handleScrollToExplainability}
            />

            <div ref={explainabilityRef}>
              <ExplainabilitySuite result={result} />
            </div>
          </div>
        )}

        {/* Report Export Modal */}
        {result && isReportOpen && (
          <ResearchReportModal result={result} onClose={() => setIsReportOpen(false)} />
        )}
      </div>
    </div>
  );
};
