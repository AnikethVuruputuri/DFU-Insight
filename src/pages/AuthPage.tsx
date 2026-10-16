import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface AuthPageProps {
  onBackToHome: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToHome, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate authentication processing
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 800);
  };

  return (
    <div className="w-full flex-1 flex items-stretch bg-[#100904] text-[#FFEDD7] selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-5rem)]">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Clean Editorial Brand Panel */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 lg:p-16 xl:p-24 border-r border-[#40372E]/50 bg-[#0c0705] relative overflow-hidden">
          {/* Subtle warm ambient lighting glow */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle, #DC5000 0%, transparent 70%)',
            }}
          />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#DC5000]" />
            <span className="text-sm font-medium tracking-wide text-[#FFEDD7]">
              DFU Insight
            </span>
          </div>

          {/* Center Editorial Typography */}
          <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl text-left">
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-normal text-[#FFEDD7] tracking-display leading-display uppercase">
                Understand <br />
                the wound. <br />
                <span className="text-[#B7AA98]">Interpret</span> <br />
                the evidence.
              </h2>
              <p className="text-base text-[#B7AA98] font-light leading-relaxed">
                An explainable AI platform for diabetic foot-ulcer pathology classification and Wagner severity assessment with dual-branch vision backbones.
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 text-xs text-[#B7AA98]">
                <CheckCircle2 className="w-4 h-4 text-[#DC5000] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-[#FFEDD7] font-medium">Dual-Axis Staging:</strong> Multi-class pathology assessment coupled with ordinal Wagner grading.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-[#B7AA98]">
                <CheckCircle2 className="w-4 h-4 text-[#DC5000] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-[#FFEDD7] font-medium">Explainable AI:</strong> Cross-validating visual attributions with Grad-CAM and attention rollout maps.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-[#B7AA98]">
                <CheckCircle2 className="w-4 h-4 text-[#DC5000] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong className="text-[#FFEDD7] font-medium">Instant Analysis:</strong> Upload wound photographs and inspect predictions directly in your browser.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="relative z-10 pt-6 border-t border-[#40372E]/50 text-xs font-light text-[#817568] text-left">
            © {new Date().getFullYear()} DFU Insight. Advanced explainable biomedical vision.
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Simple Sign In / Sign Up Form */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-24 bg-[#100904]">
          <div className="max-w-md w-full mx-auto space-y-8">
            {/* Top Back Action */}
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 text-xs font-mono text-[#817568] hover:text-[#FFEDD7] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Return to Overview</span>
              </button>
            </div>

            {/* Header Title & Subtitle */}
            <div className="space-y-2 text-left">
              <h1 className="text-3xl sm:text-4xl font-normal text-[#FFEDD7] tracking-display">
                {mode === 'login' ? 'Sign In' : 'Create an Account'}
              </h1>
              <p className="text-xs sm:text-sm text-[#B7AA98] font-light leading-relaxed">
                {mode === 'login'
                  ? 'Enter your email and password to access your account.'
                  : 'Enter your information below to create a new account.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#181411] border border-[#40372E] rounded-lg">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 text-xs font-medium tracking-wider uppercase rounded transition-all ${
                  mode === 'login'
                    ? 'bg-[#241C15] text-[#FFEDD7] shadow-sm'
                    : 'text-[#817568] hover:text-[#B7AA98]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 text-xs font-medium tracking-wider uppercase rounded transition-all ${
                  mode === 'signup'
                    ? 'bg-[#241C15] text-[#FFEDD7] shadow-sm'
                    : 'text-[#817568] hover:text-[#B7AA98]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Simple Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="block text-xs font-mono text-[#B7AA98] uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#817568]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-10 py-3 text-sm text-[#FFEDD7] placeholder-[#817568]/70 focus:outline-none transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#B7AA98] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#817568]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-10 py-3 text-sm text-[#FFEDD7] placeholder-[#817568]/70 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-[#B7AA98] uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="text-[11px] font-mono text-[#817568] hover:text-[#DC5000] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#817568]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-10 py-3 text-sm text-[#FFEDD7] placeholder-[#817568]/70 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#817568] hover:text-[#FFEDD7] transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || submittedSuccess}
                className="w-full py-3.5 px-6 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] active:scale-[0.99] rounded transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#DC5000] disabled:opacity-60 disabled:pointer-events-none pt-3"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : submittedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Success · Launching...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Simple Alternative Sign In Divider */}
            <div className="pt-2 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#40372E]/50" />
                </div>
                <span className="relative px-3 bg-[#100904] text-[11px] font-mono text-[#817568] uppercase">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitting(true);
                  setTimeout(() => {
                    setIsSubmitting(false);
                    setSubmittedSuccess(true);
                    setTimeout(onSuccess, 500);
                  }, 500);
                }}
                className="w-full py-2.5 px-4 bg-[#181411] hover:bg-[#241C15] border border-[#40372E] rounded text-xs font-mono text-[#B7AA98] hover:text-[#FFEDD7] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Terms Notice */}
            <div className="pt-2 text-[11px] font-light text-[#817568] text-center">
              By continuing, you agree to DFU Insight&apos;s Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
