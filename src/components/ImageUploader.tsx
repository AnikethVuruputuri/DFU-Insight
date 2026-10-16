import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle, FileCheck, Info, Sparkles } from 'lucide-react';
import { BENCHMARK_SAMPLES, generateSyntheticClinicalSample } from '../constants/clinicalData';
import { BenchmarkSample } from '../types/dfu';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string, sampleInfo?: BenchmarkSample) => void;
  isLoading: boolean;
  onClear: () => void;
  selectedImageDataUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
  onClear,
  selectedImageDataUrl,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a standard JPG, JPEG, or PNG photograph.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 15 MB.`);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file appears to be empty.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onImageSelected(dataUrl);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. The file may be corrupt.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (sample: BenchmarkSample) => {
    setErrorMessage(null);
    let sampleType: 'infection' | 'ischaemia' | 'both' | 'grade1' = 'infection';
    if (sample.groundTruthPathology === 'Infection') sampleType = 'infection';
    else if (sample.groundTruthPathology === 'Ischaemia') sampleType = 'ischaemia';
    else if (sample.groundTruthPathology === 'Both') sampleType = 'both';
    else sampleType = 'grade1';

    const dataUrl = generateSyntheticClinicalSample(sampleType);
    setFileName(`${sample.name}.jpg`);
    setFileSize('142.4 KB (Benchmark sample)');
    onImageSelected(dataUrl, sample);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone Container */}
      {!selectedImageDataUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 md:p-14 text-center transition-all ${
            isDragOver
              ? 'border-[#DC5000] bg-[#241C15]'
              : 'border-[#40372E] bg-[#181411] hover:border-[#817568]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                validateAndProcessFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 rounded-full bg-[#241C15] border border-[#40372E] text-[#DC5000] flex items-center justify-center mx-auto mb-4">
            <Upload className="w-5 h-5" />
          </div>

          <h3 className="text-base font-medium text-[#FFEDD7]">
            Upload Diabetic Foot Ulcer Image
          </h3>
          <p className="text-xs text-[#B7AA98] mt-1.5 max-w-md mx-auto">
            Drag and drop your photographic wound image here, or select from your device. Supported: JPG, JPEG, PNG (up to 15 MB).
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              Select Image from Device
            </button>
          </div>
        </div>
      ) : (
        /* Image Preview State */
        <div className="bg-[#181411] rounded-xl border border-[#40372E] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-[#40372E] bg-[#100904] shrink-0">
              <img
                src={selectedImageDataUrl}
                alt="Selected DFU wound preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  setFileSize(null);
                  onClear();
                }}
                disabled={isLoading}
                className="absolute top-2 right-2 p-1.5 bg-[#100904]/80 hover:bg-[#100904] text-[#B7AA98] hover:text-[#FFEDD7] rounded border border-[#40372E] transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-[#DC5000]">
                <FileCheck className="w-4 h-4" />
                <span className="tracking-wider">IMAGE VERIFIED FOR PREPROCESSING</span>
              </div>
              <div>
                <div className="text-lg font-medium text-[#FFEDD7]">{fileName || 'wound_photo.jpg'}</div>
                <div className="text-xs font-mono text-[#817568] mt-0.5">{fileSize} · Normalized to 384×384 tensor</div>
              </div>
              <p className="text-xs text-[#B7AA98] leading-relaxed">
                The image will be centered, cropped to 384×384 pixels, and normalized using standard ImageNet channel statistics before entering the dual-branch EfficientNetV2-S and Swin-Tiny backbones.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="text-xs text-[#DC5000] hover:text-[#FFEDD7] font-mono transition-colors underline underline-offset-4"
                >
                  Replace with different image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Curated Benchmark Samples Strip */}
      <div className="bg-[#181411] rounded-xl border border-[#40372E] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFEDD7]">
            <Sparkles className="w-3.5 h-3.5 text-[#DC5000]" />
            <span className="tracking-wider uppercase">Curated Clinical Benchmark Presets</span>
          </div>
          <span className="text-xs font-mono text-[#817568] hidden sm:inline">Click to load instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BENCHMARK_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSampleClick(sample)}
              disabled={isLoading}
              className="p-4 bg-[#100904] rounded-lg border border-[#40372E] hover:border-[#DC5000] hover:bg-[#241C15] text-left transition-all group"
            >
              <div className="text-xs font-medium text-[#FFEDD7] group-hover:text-[#DC5000] transition-colors">
                {sample.name}
              </div>
              <div className="text-[11px] font-mono text-[#DC5000] mt-0.5">{sample.category}</div>
              <div className="text-[11px] text-[#817568] mt-1.5 line-clamp-2 leading-relaxed">
                {sample.clinicalNotes}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Consent & Research Protocol Disclaimer */}
      <div className="p-5 bg-[#181411]/60 border border-[#40372E] rounded-xl text-xs text-[#B7AA98] space-y-3">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#817568] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-medium text-[#FFEDD7] font-mono uppercase tracking-wider text-[11px]">
              Non-Diagnostic Research Protocol Notice
            </span>
            <p className="leading-relaxed">
              This application is an investigational research prototype for deep learning evaluation and explainability auditing. Predictions do not constitute medical diagnosis or clinical advice. Uploaded images should not contain protected health information (PHI) or identifiable facial features.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consentAcknowledged}
            onChange={(e) => setConsentAcknowledged(e.target.checked)}
            className="w-4 h-4 rounded border-[#40372E] bg-[#100904] text-[#DC5000] focus:ring-[#DC5000]"
          />
          <span className="text-[11px] text-[#B7AA98]">
            I acknowledge this tool is for research & educational evaluation only and is not a clinical diagnostic device.
          </span>
        </label>
      </div>
    </div>
  );
};
