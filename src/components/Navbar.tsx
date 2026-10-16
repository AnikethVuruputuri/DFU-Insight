import React from 'react';

interface NavbarProps {
  currentView: 'home' | 'analyze' | 'auth';
  onNavigate: (view: 'home' | 'analyze' | 'auth') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#100904]/90 backdrop-blur-md border-b border-[#40372E]/50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-lg font-medium tracking-tight text-[#FFEDD7] whitespace-nowrap shrink-0 text-left hover:text-white transition-colors"
        >
          DFU Insight
        </button>

        {/* Zone 2: Minimal single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-normal text-[#B7AA98]">
          <button
            onClick={() => {
              onNavigate('home');
              const el = document.getElementById('problem');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Clinical Context
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              const el = document.getElementById('approach');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Methodology
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              const el = document.getElementById('architecture');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Model Architecture
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              const el = document.getElementById('explainability');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Explainability
          </button>
        </nav>

        {/* Zone 3: Actions (Sign In + Primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView !== 'auth' && (
            <button
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 text-xs font-mono text-[#B7AA98] hover:text-[#FFEDD7] transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {currentView === 'home' ? (
            <button
              onClick={() => onNavigate('analyze')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              Analyze an Image
            </button>
          ) : currentView === 'analyze' ? (
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-[#FFEDD7] bg-[#181411] hover:bg-[#241C15] border border-[#40372E] rounded transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#40372E]"
            >
              Return to Overview
            </button>
          ) : (
            <button
              onClick={() => onNavigate('analyze')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              Analyze an Image
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
