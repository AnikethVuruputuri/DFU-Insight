/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { AuthPage } from './pages/AuthPage';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'analyze' | 'auth'>('home');

  return (
    <div className="min-h-screen flex flex-col bg-[#100904] text-[#FFEDD7] selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      {/* 3-Zone Top Bar — always visible */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' ? (
          <LandingPage
            onStartAnalysis={() => {
              setCurrentView('analyze');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'analyze' ? (
          <AnalyzePage
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <AuthPage
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSuccess={() => {
              setCurrentView('analyze');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Persistent Research Safety Footer — hidden on auth page */}
      {currentView !== 'auth' && (
        <Footer
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
