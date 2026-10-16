import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'analyze' | 'auth') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#100904] text-[#B7AA98] border-t border-[#40372E]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 space-y-12 text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <button
              onClick={() => onNavigate('home')}
              className="text-xl font-normal tracking-tight text-[#FFEDD7] hover:text-white transition-colors"
            >
              DFU Insight
            </button>
            <p className="text-xs text-[#817568] max-w-md leading-relaxed font-light">
              Understand the wound. Interpret the evidence. An explainable AI research platform for diabetic foot-ulcer pathology classification and Wagner severity grading based on the dual-branch DFU-Wagner net architecture.
            </p>
            <div className="text-[11px] font-mono text-[#817568] pt-1">
              Architecture: EfficientNetV2-S + Swin-Tiny Transformer (DFU-SIAM v3)
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#FFEDD7]">
              Platform
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#FFEDD7] transition-colors text-[#817568]"
                >
                  Overview & Chapters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('analyze')}
                  className="hover:text-[#FFEDD7] transition-colors text-[#817568]"
                >
                  Laboratory Console
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('auth')}
                  className="hover:text-[#FFEDD7] transition-colors text-[#817568]"
                >
                  Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Transparency */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#FFEDD7]">
              Methodology
            </div>
            <ul className="space-y-2 text-xs text-[#817568]">
              <li>4-Class Pathology Taxonomy</li>
              <li>Wagner Ulcer Staging (0–4)</li>
              <li>Dual-Branch Metric Alignment</li>
              <li>4-Method Visual Attribution</li>
            </ul>
          </div>
        </div>

        {/* Mandatory Research Prototype Disclaimer Banner */}
        <div className="p-6 bg-[#181411] rounded-xl border border-[#40372E] text-xs text-[#B7AA98] leading-relaxed">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-4 h-4 text-[#DC5000] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="font-mono text-[#FFEDD7] uppercase tracking-wider text-[11px]">
                Clinical Research Prototype Disclaimer
              </span>
              <p>
                This research prototype provides AI-generated image assessments for academic research, representation auditing, and educational use. It is not a substitute for professional medical evaluation. If a wound is worsening or presents signs of acute infection, critical limb ischemia, or spreading tissue loss, seek immediate evaluation from a certified medical specialist.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#40372E]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#817568] font-mono">
          <div>© {new Date().getFullYear()} DFU Insight Research Consortium. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Investigational Medical AI</span>
            <span>·</span>
            <span>Zero Server Retention</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
