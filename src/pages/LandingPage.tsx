import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { CinematicHero } from '../components/CinematicHero';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

interface LandingPageProps {
  onStartAnalysis: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalysis }) => {
  return (
    <div className="bg-[#100904] text-[#FFEDD7] selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      {/* CHAPTER 01 — CINEMATIC FULL-SCREEN HERO */}
      <CinematicHero onStartAnalysis={onStartAnalysis} />

      {/* CHAPTER 02 — THE CLINICAL CHALLENGE */}
      <section id="problem" className="w-full border-b border-[#40372E]/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 text-left">
            <div className="lg:col-span-4 space-y-4">
              <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
                01 · The Clinical Dilemma
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal text-[#FFEDD7] tracking-display leading-tight">
                Every wound tells a different story.
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-6 text-[#B7AA98] font-light text-base sm:text-lg leading-relaxed">
              <p>
                Diabetic foot ulceration remains one of the most devastating complications of diabetes, preceding over 80% of lower-limb amputations worldwide. Yet physical wound examination is fraught with ambiguity.
              </p>
              <p>
                Infection and ischemia frequently co-exist in neuro-ischemic ulcers. Localized erythema can mimic inflammatory vasodilation, while subtle micro-vascular necrosis easily hides under hyperkeratotic callous. Standard convolutional networks often memorize background artifacts rather than true pathophysiological markers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 font-mono text-xs">
                <div className="p-5 bg-[#181411] border border-[#40372E] rounded-lg space-y-2">
                  <span className="text-[#FFEDD7] font-medium text-sm">Pathological Mimicry</span>
                  <p className="text-[#817568] leading-relaxed">
                    Purulent exudate and fibrinous slough share overlapping spectral signatures with sterile tissue debris, confounding single-backbone feature extractors.
                  </p>
                </div>
                <div className="p-5 bg-[#181411] border border-[#40372E] rounded-lg space-y-2">
                  <span className="text-[#FFEDD7] font-medium text-sm">Non-Linear Severity</span>
                  <p className="text-[#817568] leading-relaxed">
                    Wagner severity progression is fundamentally ordinal, requiring models that preserve continuous monotonic staging rather than disjoint categorical labels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 03 — THE RESEARCH APPROACH */}
      <section id="approach" className="w-full border-b border-[#40372E]/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="space-y-12 text-left">
            <div className="max-w-2xl space-y-4">
              <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
                02 · Dual-Task Formulation
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal text-[#FFEDD7] tracking-display leading-tight">
                Two perspectives. <br />
                One clinical picture.
              </h2>
              <p className="text-[#B7AA98] font-light text-base leading-relaxed">
                DFU Insight decouples wound assessment into two complementary predictive axes, aligning multi-class biological pathology with ordinal surgical staging.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Task A: Pathology Classification */}
              <div className="p-8 bg-[#181411] border border-[#40372E] rounded-xl space-y-5">
                <div className="flex items-center justify-between text-xs font-mono text-[#817568]">
                  <span>PREDICTIVE AXIS 1</span>
                  <span className="text-[#DC5000]">4-CLASS TAXONOMY</span>
                </div>
                <h3 className="text-2xl font-normal text-[#FFEDD7]">Pathology Classification</h3>
                <p className="text-sm text-[#B7AA98] font-light leading-relaxed">
                  Discriminates between primary microbiological and vascular etiologies to guide antimicrobial or revascularization pathways.
                </p>
                <div className="divide-y divide-[#40372E]/50 pt-2 font-mono text-xs text-[#B7AA98]">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">None</span>
                    <span className="text-[#817568]">Uncomplicated baseline defect</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Infection</span>
                    <span className="text-[#817568]">Purulent exudate & erythema &gt;2cm</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Ischaemia</span>
                    <span className="text-[#817568]">Arterial compromise & dark eschar</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Both</span>
                    <span className="text-[#DC5000]">Neuro-ischemic critical limb threat</span>
                  </div>
                </div>
              </div>

              {/* Task B: Wagner Ordinal Grading */}
              <div className="p-8 bg-[#181411] border border-[#40372E] rounded-xl space-y-5">
                <div className="flex items-center justify-between text-xs font-mono text-[#817568]">
                  <span>PREDICTIVE AXIS 2</span>
                  <span className="text-[#DC5000]">ORDINAL CONTINUUM (0–4)</span>
                </div>
                <h3 className="text-2xl font-normal text-[#FFEDD7]">Wagner Ulcer Staging</h3>
                <p className="text-sm text-[#B7AA98] font-light leading-relaxed">
                  Applies cumulative link ordinal margins to model progressive anatomical penetration depth from superficial dermis to osteomyelitis.
                </p>
                <div className="divide-y divide-[#40372E]/50 pt-2 font-mono text-xs text-[#B7AA98]">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Grade 0</span>
                    <span className="text-[#817568]">Pre-ulcerative / healed epidermis</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Grade 1</span>
                    <span className="text-[#817568]">Superficial full-thickness dermis</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Grade 2</span>
                    <span className="text-[#817568]">Deep ulcer penetrating to tendon/capsule</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Grade 3</span>
                    <span className="text-[#817568]">Deep abscess / osteomyelitis</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-[#FFEDD7]">Grade 4</span>
                    <span className="text-[#DC5000]">Localized forefoot or heel gangrene</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 04 — INSIDE THE MODEL (Interactive Architecture Diagram) */}
      <section id="architecture" className="w-full border-b border-[#40372E]/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="space-y-10 text-left">
            <div className="max-w-2xl space-y-4">
              <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
                03 · Model Architecture
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal text-[#FFEDD7] tracking-display leading-tight">
                From pixels to interpretable evidence.
              </h2>
              <p className="text-[#B7AA98] font-light text-base leading-relaxed">
                DFU-Wagner net fuses convolutional inductive bias (EfficientNetV2-S) with shifted-window self-attention (Swin-Tiny), aligning local texture with long-range tissue margins into a shared 512-dimensional metric embedding.
              </p>
            </div>

            <ArchitectureDiagram />
          </div>
        </div>
      </section>

      {/* CHAPTER 05 — EXPLAINABLE AI SUITE */}
      <section id="explainability" className="w-full border-b border-[#40372E]/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="space-y-12 text-left">
            <div className="max-w-2xl space-y-4">
              <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
                04 · Visual Attribution
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal text-[#FFEDD7] tracking-display leading-tight">
                An answer is not enough.
              </h2>
              <p className="text-[#B7AA98] font-light text-base leading-relaxed">
                A high classification score is clinically meaningless without spatial transparency. DFU Insight generates four cross-validating attribution heatmaps to expose which pixels governed the prediction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-[#181411] border border-[#40372E] rounded-xl space-y-3">
                <span className="font-mono text-xs text-[#DC5000]">METHOD 01</span>
                <h4 className="text-lg font-medium text-[#FFEDD7]">Grad-CAM</h4>
                <p className="text-xs text-[#B7AA98] leading-relaxed">
                  Backpropagates target gradients into the final convolutional stage of EfficientNetV2-S, pinpointing localized purulence and erythema halos.
                </p>
              </div>

              <div className="p-6 bg-[#181411] border border-[#40372E] rounded-xl space-y-3">
                <span className="font-mono text-xs text-[#0d9488]">METHOD 02</span>
                <h4 className="text-lg font-medium text-[#FFEDD7]">Swin Token Rollout</h4>
                <p className="text-xs text-[#B7AA98] leading-relaxed">
                  Aggregates hierarchical attention matrices across shifted windows, uncovering long-range context between ulcer crater and distal ischemic pallor.
                </p>
              </div>

              <div className="p-6 bg-[#181411] border border-[#40372E] rounded-xl space-y-3">
                <span className="font-mono text-xs text-[#DC5000]">METHOD 03</span>
                <h4 className="text-lg font-medium text-[#FFEDD7]">Integrated Gradients</h4>
                <p className="text-xs text-[#B7AA98] leading-relaxed">
                  Computes path integrals against a black baseline, satisfying axiomatic completeness and sensitivity at fine pixel granularity.
                </p>
              </div>

              <div className="p-6 bg-[#181411] border border-[#40372E] rounded-xl space-y-3">
                <span className="font-mono text-xs text-[#0d9488]">METHOD 04</span>
                <h4 className="text-lg font-medium text-[#FFEDD7]">KernelSHAP</h4>
                <p className="text-xs text-[#B7AA98] leading-relaxed">
                  Segments lesions into SLIC superpixels and performs weighted ridge regression on masked coalitions to calculate empirical Shapley marginal values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 06 — INTERACTIVE CONSOLE TRANSITION */}
      <section className="w-full border-b border-[#40372E]/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
          <div className="p-10 sm:p-16 bg-[#181411] border border-[#40372E] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
            <div className="space-y-4 max-w-xl">
              <div className="text-xs font-mono text-[#DC5000] uppercase tracking-widest">
                05 · Research Application
              </div>
              <h2 className="text-3xl sm:text-5xl font-normal text-[#FFEDD7] tracking-display leading-tight">
                Bring an image. <br />
                Examine the evidence.
              </h2>
              <p className="text-[#B7AA98] font-light text-base leading-relaxed">
                Launch the laboratory analysis console. Upload custom photographic samples or load calibrated clinical benchmark cases to inspect real-time inference and multi-method explainability maps.
              </p>
            </div>

            <button
              onClick={onStartAnalysis}
              className="px-8 py-4 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all whitespace-nowrap self-start md:self-auto"
            >
              Launch Analysis Console
            </button>
          </div>
        </div>
      </section>

      {/* CHAPTER 07 — RESEARCH RIGOR & DISCLAIMERS */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 text-left">
          <div className="p-6 bg-[#181411]/60 border border-[#40372E]/70 rounded-xl flex items-start gap-4">
            <ShieldAlert className="w-5 h-5 text-[#DC5000] shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs font-light text-[#B7AA98] leading-relaxed">
              <span className="font-medium text-[#FFEDD7] font-mono uppercase tracking-wider">
                Research Prototype Governance & Medical Safety Protocol
              </span>
              <p>
                DFU Insight is an investigational medical AI research platform designed for academic model auditing, multi-modal representation alignment analysis, and explainability benchmarking. Predictions and visual attributions do not constitute medical advice, microbiological proof, or clinical diagnostic determinations.
              </p>
              <p>
                All photographic ulcer evaluations must be performed under the supervision of certified podiatrists, vascular surgeons, or wound-care specialists. Uploaded images are processed locally within the session and are not permanently retained.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
