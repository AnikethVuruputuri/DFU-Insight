import React from 'react';

interface NavbarProps {
  currentView: 'home' | 'analyze' | 'auth' | 'dashboard';
  isAuthenticated?: boolean;
  userRole?: string | null;
  onNavigate: (view: 'home' | 'analyze' | 'auth' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  isAuthenticated = false,
  userRole = null,
  onNavigate,
}) => {
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
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-normal text-[#B7AA98]">
          {isAuthenticated && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'dashboard' ? 'text-[#DC5000] font-medium' : ''
              }`}
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('problem');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Clinical Context
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('approach');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Methodology
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('architecture');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Model Architecture
          </button>
          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => {
                const el = document.getElementById('explainability');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#FFEDD7] transition-colors whitespace-nowrap shrink-0"
          >
            Explainability
          </button>
        </nav>

        {/* Zone 3: Actions (Sign In + Primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {!isAuthenticated && currentView !== 'auth' && (
            <button
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 text-xs font-mono text-[#B7AA98] hover:text-[#FFEDD7] transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          )}

          {isAuthenticated && userRole && (
            <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded bg-[#181411] border border-[#40372E] text-[#B7AA98] uppercase">
              {userRole}
            </span>
          )}

          {currentView === 'home' ? (
            <button
              onClick={() => onNavigate(isAuthenticated ? 'analyze' : 'auth')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              {isAuthenticated ? 'Analyze an Image' : 'Get Started'}
            </button>
          ) : currentView === 'analyze' ? (
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'home')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-[#FFEDD7] bg-[#181411] hover:bg-[#241C15] border border-[#40372E] rounded transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#40372E]"
            >
              {isAuthenticated ? 'Return to Dashboard' : 'Return to Overview'}
            </button>
          ) : currentView === 'dashboard' ? (
            <button
              onClick={() => onNavigate('analyze')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#DC5000]"
            >
              Analyze an Image
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 text-xs font-medium tracking-wide text-[#FFEDD7] bg-[#181411] hover:bg-[#241C15] border border-[#40372E] rounded transition-all whitespace-nowrap shrink-0"
            >
              Return to Overview
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
