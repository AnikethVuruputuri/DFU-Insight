/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type ViewType = 'home' | 'analyze' | 'auth' | 'dashboard';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');

  // If user is authenticated and navigating to auth, send to their dashboard
  useEffect(() => {
    if (isAuthenticated && currentView === 'auth') {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, currentView]);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#100904] text-[#FFEDD7] selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      {/* 3-Zone Top Bar — always visible */}
      <Navbar
        currentView={currentView}
        isAuthenticated={isAuthenticated}
        userRole={user?.role || null}
        onNavigate={(view) => handleNavigate(view as ViewType)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' ? (
          <LandingPage
            onStartAnalysis={() => handleNavigate(isAuthenticated ? 'analyze' : 'auth')}
          />
        ) : currentView === 'analyze' ? (
          <AnalyzePage
            onBackToHome={() => handleNavigate(isAuthenticated ? 'dashboard' : 'home')}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardPage
            onNavigateAnalyze={() => handleNavigate('analyze')}
            onLogout={() => handleNavigate('home')}
          />
        ) : (
          <AuthPage
            onBackToHome={() => handleNavigate('home')}
            onSuccess={() => handleNavigate('dashboard')}
          />
        )}
      </main>

      {/* Persistent Research Safety Footer — hidden on auth and dashboard */}
      {currentView !== 'auth' && currentView !== 'dashboard' && (
        <Footer
          onNavigate={(view) => handleNavigate(view as ViewType)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
