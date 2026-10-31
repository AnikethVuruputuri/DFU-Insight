import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Phone,
  User,
  Stethoscope,
  Heart,
  Shield,
  CheckCircle2,
  Loader2,
  Navigation,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onBackToHome: () => void;
  onSuccess: (role: string) => void;
}

type AuthMode = 'login' | 'signup';
type AuthStep = 'phone' | 'otp' | 'role' | 'location' | 'profile' | 'complete';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  source: 'gps' | 'manual' | null;
}

const COUNTRY_CODES = [
  { code: '91', flag: '🇮🇳', name: 'India (+91)' },
  { code: '1', flag: '🇺🇸', name: 'USA (+1)' },
  { code: '44', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '971', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '61', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '65', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '49', flag: '🇩🇪', name: 'Germany (+49)' },
];

// Declare global for Phone.Email button
declare global {
  interface Window {
    phoneEmailListener?: (userObj: {
      user_json_url: string;
      user_phone_number: string;
      user_country_code: string;
    }) => void;
  }
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToHome, onSuccess }) => {
  const { login, apiUrl } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('phone');

  // Phone state
  const [countryCode, setCountryCode] = useState('91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState('');

  // Role state
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'nurse' | ''>('');

  // Location state
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    source: null,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  // Profile state
  const [fullName, setFullName] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Phone.Email integration setup
  useEffect(() => {
    if (step !== 'phone') return;

    window.phoneEmailListener = async (userObj) => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await fetch(`${apiUrl}/api/v1/auth/verify-phone-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_json_url: userObj.user_json_url }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.detail || 'Phone.Email verification failed.');
          setIsLoading(false);
          return;
        }

        if (data.status === 'login') {
          login(data.token, data.user);
          setStep('complete');
          setTimeout(() => onSuccess(data.user.role), 1200);
        } else {
          setFormattedPhone(data.phone);
          setCountryCode(data.country_code);
          setRegistrationToken(data.registration_token);
          setStep('role');
        }
      } catch {
        setErrorMessage('Failed to connect to verification server.');
      } finally {
        setIsLoading(false);
      }
    };

    // Load Phone.Email external script
    const existingScript = document.querySelector('script[src*="phone.email/sign-in-button"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.phone.email/sign-in-button.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      delete window.phoneEmailListener;
    };
  }, [step, apiUrl, login, onSuccess]);

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      setErrorMessage('Please enter a valid mobile number (7 to 15 digits).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          country_code: countryCode,
          purpose: mode === 'signup' ? 'register' : 'login',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || 'Could not send OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data.success) {
        setErrorMessage(data.message);
        if (data.is_registered === false && mode === 'login') {
          // Suggest switching to sign up
          setErrorMessage('This number is not registered yet. Please switch to Sign Up.');
        } else if (data.is_registered === true && mode === 'signup') {
          setErrorMessage('This number is already registered. Please switch to Sign In.');
        }
        setIsLoading(false);
        return;
      }

      setFormattedPhone(data.phone);
      if (data.dev_otp) {
        setDevOtpHint(data.dev_otp);
      }
      setResendCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setStep('otp');
      setSuccessNotice(`6-digit passcode sent to ${data.phone}`);

      // Auto-focus first digit box
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch {
      setErrorMessage('Network connection error. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input changes
  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next box if filled
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      const fullCode = newDigits.join('');
      executeVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      executeVerifyOtp(pasted);
    } else {
      const nextEmpty = newDigits.findIndex((d) => !d);
      otpInputRefs.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus();
    }
  };

  // Step 2: Verify OTP
  const executeVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber.replace(/\D/g, ''),
          country_code: countryCode,
          otp: code,
          purpose: mode === 'signup' ? 'register' : 'login',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || 'Incorrect or expired OTP.');
        setIsLoading(false);
        return;
      }

      if (data.status === 'login') {
        // Successful login for registered user
        login(data.token, data.user);
        setStep('complete');
        setTimeout(() => onSuccess(data.user.role), 1200);
      } else if (data.status === 'needs_registration') {
        // Proceed to clinical role selection
        setRegistrationToken(data.registration_token);
        setStep('role');
      }
    } catch {
      setErrorMessage('Failed to verify OTP. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Geolocation auto-detect
  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationMessage('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          source: 'gps',
        }));

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          if (geoRes.ok) {
            const data = await geoRes.json();
            const addr = data.address || {};
            setLocation((prev) => ({
              ...prev,
              address: data.display_name || '',
              city: addr.city || addr.town || addr.village || addr.county || '',
              state: addr.state || '',
              country: addr.country || 'India',
              postalCode: addr.postcode || '',
            }));
            setLocationMessage(`GPS coordinates acquired (±${Math.round(accuracy)}m accuracy).`);
          }
        } catch {
          setLocationMessage('Coordinates saved. Reverse address lookup timed out; you may fill manual fields below.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        setIsGettingLocation(false);
        if (err.code === 1) {
          setLocationMessage('Location access was denied. You can enter your details manually below.');
        } else {
          setLocationMessage('Unable to retrieve GPS fix. Please enter your location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Step 5: Finalize Registration
  const handleFinalizeRegistration = async () => {
    if (!selectedRole) {
      setErrorMessage('Clinical role selection is required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_token: registrationToken,
          role: selectedRole,
          name: fullName.trim() || null,
          location: location.source
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                address: location.address,
                city: location.city,
                state: location.state,
                country: location.country,
                postal_code: location.postalCode,
                source: location.source,
              }
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || 'Registration failed. Please restart phone verification.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      setStep('complete');
      setTimeout(() => onSuccess(data.user.role), 1400);
    } catch {
      setErrorMessage('Network error during registration completion.');
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'patient' as const,
      title: 'Patient',
      icon: Heart,
      color: '#DC5000',
      badge: 'Patient Portal',
      description: 'Track personal ulcer recovery, upload weekly progress imagery, and receive AI-backed Wagner severity monitoring.',
    },
    {
      id: 'doctor' as const,
      title: 'Doctor',
      icon: Stethoscope,
      color: '#0d9488',
      badge: 'Clinician Workspace',
      description: 'Access dual-axis pathology inference, inspect Swin Transformer & Grad-CAM visual attributions, and generate clinical reports.',
    },
    {
      id: 'nurse' as const,
      title: 'Nurse',
      icon: Shield,
      color: '#B7AA98',
      badge: 'Ward Protocol Console',
      description: 'Record inpatient dressing assessments, capture point-of-care wound photography, and flag early infection markers.',
    },
  ];

  return (
    <div className="w-full flex-1 flex items-stretch bg-[#100904] text-[#FFEDD7] selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-5rem)]">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Editorial Biomedical Brand Panel */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-12 lg:p-16 xl:p-20 border-r border-[#40372E]/50 bg-[#0c0705] relative overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, #DC5000 0%, transparent 70%)' }}
          />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC5000]" />
            <span className="text-sm font-medium tracking-wide text-[#FFEDD7]">DFU Insight</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#181411] border border-[#40372E] text-[#817568]">
              v3.2.0-rc4
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
              <p className="text-sm text-[#B7AA98] font-light leading-relaxed">
                Biomedical vision framework for diabetic foot ulcer pathology staging, infection/ischaemia dual-branch attribution, and ordinal Wagner severity grading.
              </p>
            </div>

            {/* Registration Progress Indicator */}
            {step !== 'phone' && step !== 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-4 border-t border-[#40372E]/50"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#817568] uppercase">
                  <span>Registration Workflow</span>
                  <span>
                    {step === 'otp' && 'Step 2 / 5'}
                    {step === 'role' && 'Step 3 / 5'}
                    {step === 'location' && 'Step 4 / 5'}
                    {step === 'profile' && 'Step 5 / 5'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {['otp', 'role', 'location', 'profile'].map((s, idx) => {
                    const stepOrder = ['otp', 'role', 'location', 'profile'];
                    const currentIdx = stepOrder.indexOf(step);
                    const isDone = currentIdx >= idx;
                    return (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isDone ? 'bg-[#DC5000]' : 'bg-[#241C15]'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-[#B7AA98]">
                  {step === 'otp' && 'Verifying mobile number with single-use passcode'}
                  {step === 'role' && 'Assigning clinical portal permissions (Patient / Doctor / Nurse)'}
                  {step === 'location' && 'Capturing geographic coordinates for triage referral'}
                  {step === 'profile' && 'Finalizing clinical profile metadata'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Bottom Security Notice */}
          <div className="relative z-10 pt-6 border-t border-[#40372E]/50 text-xs font-light text-[#817568] text-left flex items-center justify-between">
            <span>© {new Date().getFullYear()} DFU Insight</span>
            <span className="font-mono text-[11px]">256-bit Cryptographic OTP</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Interactive Mobile OTP & Registration Flow */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20 bg-[#100904]">
          <div className="max-w-lg w-full mx-auto space-y-7">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step === 'phone') {
                    onBackToHome();
                  } else if (step === 'otp') {
                    setStep('phone');
                    setOtpDigits(['', '', '', '', '', '']);
                  } else if (step === 'role') {
                    setStep('otp');
                  } else if (step === 'location') {
                    setStep('role');
                  } else if (step === 'profile') {
                    setStep('location');
                  }
                }}
                className="flex items-center gap-2 text-xs font-mono text-[#817568] hover:text-[#FFEDD7] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>{step === 'phone' ? 'Return to Overview' : 'Back to Previous Step'}</span>
              </button>

              {formattedPhone && step !== 'phone' && (
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#181411] border border-[#40372E] text-[#B7AA98]">
                  {formattedPhone}
                </span>
              )}
            </div>

            {/* Error & Info Alerts */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 text-left"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </motion.div>
            )}

            {successNotice && !errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successNotice}</span>
              </motion.div>
            )}

            {/* Dev Mode Banner (helpful for instant evaluation) */}
            {devOtpHint && step === 'otp' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-[#DC5000]/10 border border-[#DC5000]/40 rounded-lg flex items-center justify-between text-xs text-left"
              >
                <div className="flex items-center gap-2 text-[#FFEDD7]">
                  <Sparkles className="w-4 h-4 text-[#DC5000]" />
                  <span>
                    <strong>Dev Code:</strong>{' '}
                    <span className="font-mono tracking-widest text-[#DC5000] font-bold text-sm">
                      {devOtpHint}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devOtpHint.split('').slice(0, 6);
                    setOtpDigits(digits);
                    executeVerifyOtp(devOtpHint);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono bg-[#DC5000] text-white rounded hover:bg-[#b84300] transition-colors"
                >
                  Auto Fill & Verify
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* ========================================================= */}
              {/* STEP 1: MOBILE NUMBER ENTRY */}
              {/* ========================================================= */}
              {step === 'phone' && (
                <motion.div
                  key="phone-step"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-left"
                >
                  {/* Title & Mode Switcher */}
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-normal text-[#FFEDD7] tracking-display">
                      {mode === 'login' ? 'Mobile Sign In' : 'Mobile Registration'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#B7AA98] font-light leading-relaxed">
                      {mode === 'login'
                        ? 'Enter your registered mobile number. We will send a secure 6-digit OTP.'
                        : 'Register your mobile number to receive clinical credentials and access.'}
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-2 p-1 bg-[#181411] border border-[#40372E] rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage('');
                        setSuccessNotice('');
                      }}
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
                      onClick={() => {
                        setMode('signup');
                        setErrorMessage('');
                        setSuccessNotice('');
                      }}
                      className={`py-2 text-xs font-medium tracking-wider uppercase rounded transition-all ${
                        mode === 'signup'
                          ? 'bg-[#241C15] text-[#FFEDD7] shadow-sm'
                          : 'text-[#817568] hover:text-[#B7AA98]'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Mobile Number Form */}
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono text-[#B7AA98] uppercase tracking-wider">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        {/* Country code selector */}
                        <div className="relative shrink-0">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="h-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-3 py-3 text-xs sm:text-sm text-[#FFEDD7] focus:outline-none transition-colors appearance-none pr-8 cursor-pointer"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code} className="bg-[#181411] text-[#FFEDD7]">
                                {c.flag} +{c.code}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#817568]">
                            ▼
                          </div>
                        </div>

                        {/* Phone input */}
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#817568]" />
                          <input
                            type="tel"
                            required
                            autoFocus
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="98765 43210"
                            className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded pl-10 pr-4 py-3 text-sm text-[#FFEDD7] placeholder-[#817568]/70 focus:outline-none transition-colors font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !phoneNumber.trim()}
                      className="w-full py-3.5 px-6 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] active:scale-[0.99] rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Passcode...</span>
                        </>
                      ) : (
                        <>
                          <span>Send 6-Digit OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Alternative Phone.Email Integration */}
                  <div className="space-y-4 pt-2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#40372E]/50" />
                      </div>
                      <span className="relative px-3 bg-[#100904] text-[11px] font-mono text-[#817568] uppercase">
                        Or verify via Phone.Email
                      </span>
                    </div>

                    <div className="flex justify-center py-1">
                      <div
                        className="pe_signin_button"
                        data-client-id={import.meta.env.VITE_PHONE_EMAIL_CLIENT_ID || '17638498889498883498'}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
              {/* ========================================================= */}
              {step === 'otp' && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-normal text-[#FFEDD7] tracking-display">
                      Enter Verification Code
                    </h1>
                    <p className="text-xs sm:text-sm text-[#B7AA98] font-light leading-relaxed">
                      We dispatched a 6-digit one-time passcode to{' '}
                      <span className="font-mono text-[#FFEDD7]">{formattedPhone}</span>.{' '}
                      <button
                        type="button"
                        onClick={() => setStep('phone')}
                        className="text-[#DC5000] underline underline-offset-2 hover:text-[#b84300]"
                      >
                        Edit Number
                      </button>
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-mono font-medium text-[#FFEDD7] bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded-lg focus:outline-none transition-colors"
                        />
                      ))}
                    </div>

                    {/* Resend Action & Countdown */}
                    <div className="flex items-center justify-between text-xs font-mono text-[#817568] pt-2">
                      <span>
                        {resendCountdown > 0 ? (
                          <>Resend code in {resendCountdown}s</>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            className="text-[#DC5000] hover:text-[#b84300] flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Resend 6-Digit Code</span>
                          </button>
                        )}
                      </span>
                      <span>Single-use · 5 min expiry</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => executeVerifyOtp()}
                    disabled={isLoading || otpDigits.some((d) => !d)}
                    className="w-full py-3.5 px-6 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] active:scale-[0.99] rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 3: ROLE SELECTION (MANDATORY & IMMUTABLE) */}
              {/* ========================================================= */}
              {step === 'role' && (
                <motion.div
                  key="role-step"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-normal text-[#FFEDD7] tracking-display">
                      Select Clinical Role
                    </h1>
                    <p className="text-xs sm:text-sm text-[#B7AA98] font-light leading-relaxed">
                      Choose your primary clinical identity. Your role dictates dashboard tools, diagnostic capabilities, and patient record access.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRole(r.id)}
                          className={`w-full text-left p-4 sm:p-5 rounded-lg border transition-all group ${
                            isSelected
                              ? 'border-[#DC5000] bg-[#DC5000]/10 shadow-lg shadow-[#DC5000]/5'
                              : 'border-[#40372E] bg-[#181411] hover:bg-[#241C15] hover:border-[#817568]'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: isSelected ? `${r.color}25` : '#241C15',
                              }}
                            >
                              <Icon className="w-5 h-5" style={{ color: r.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-[#FFEDD7]">{r.title}</h3>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#100904] border border-[#40372E] text-[#817568]">
                                  {r.badge}
                                </span>
                              </div>
                              <p className="text-xs text-[#817568] mt-1.5 leading-relaxed">
                                {r.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-[#181411] border border-[#40372E] rounded text-[11px] text-[#817568] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#DC5000] shrink-0" />
                    <span>Important: Role cannot be freely altered after registration.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedRole) {
                        setErrorMessage('Please select one of the three roles to proceed.');
                        return;
                      }
                      setErrorMessage('');
                      setStep('location');
                    }}
                    disabled={!selectedRole}
                    className="w-full py-3.5 px-6 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] active:scale-[0.99] rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span>Proceed to Location Capture</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 4: LOCATION CAPTURE (GPS + REVERSE GEOCODE / MANUAL) */}
              {/* ========================================================= */}
              {step === 'location' && (
                <motion.div
                  key="location-step"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-normal text-[#FFEDD7] tracking-display">
                      Location Capture
                    </h1>
                    <p className="text-xs sm:text-sm text-[#B7AA98] font-light leading-relaxed">
                      Location enables clinical routing, local diabetic wound center referral, and epidemiological correlation. You may auto-detect or enter manually.
                    </p>
                  </div>

                  {/* Browser Geolocation Button */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={requestBrowserLocation}
                      disabled={isGettingLocation}
                      className="w-full py-3.5 px-5 bg-[#181411] hover:bg-[#241C15] border border-[#40372E] focus:border-[#DC5000] rounded-lg text-xs font-medium text-[#FFEDD7] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 text-[#DC5000] animate-spin" />
                          <span>Acquiring High-Precision GPS Coordinates...</span>
                        </>
                      ) : location.source === 'gps' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>GPS Locked ({location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)})</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 text-[#DC5000]" />
                          <span>Request Browser Location (GPS)</span>
                        </>
                      )}
                    </button>

                    {locationMessage && (
                      <p className="text-[11px] font-mono text-[#B7AA98] px-1">{locationMessage}</p>
                    )}
                  </div>

                  {/* Manual Location Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#40372E]/50" />
                    </div>
                    <span className="relative px-3 bg-[#100904] text-[11px] font-mono text-[#817568] uppercase">
                      Or Manual Clinical Address
                    </span>
                  </div>

                  {/* Address Fields */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-[#817568] uppercase">City</label>
                        <input
                          type="text"
                          value={location.city}
                          onChange={(e) =>
                            setLocation((p) => ({
                              ...p,
                              city: e.target.value,
                              source: p.source || 'manual',
                            }))
                          }
                          placeholder="e.g. Mumbai"
                          className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-3 py-2 text-xs text-[#FFEDD7] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-[#817568] uppercase">State</label>
                        <input
                          type="text"
                          value={location.state}
                          onChange={(e) =>
                            setLocation((p) => ({
                              ...p,
                              state: e.target.value,
                              source: p.source || 'manual',
                            }))
                          }
                          placeholder="e.g. Maharashtra"
                          className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-3 py-2 text-xs text-[#FFEDD7] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-[#817568] uppercase">Postal Code</label>
                        <input
                          type="text"
                          value={location.postalCode}
                          onChange={(e) =>
                            setLocation((p) => ({
                              ...p,
                              postalCode: e.target.value,
                              source: p.source || 'manual',
                            }))
                          }
                          placeholder="e.g. 400012"
                          className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-3 py-2 text-xs text-[#FFEDD7] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-[#817568] uppercase">Country</label>
                        <input
                          type="text"
                          value={location.country}
                          onChange={(e) =>
                            setLocation((p) => ({
                              ...p,
                              country: e.target.value,
                              source: p.source || 'manual',
                            }))
                          }
                          placeholder="India"
                          className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-3 py-2 text-xs text-[#FFEDD7] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('profile')}
                      className="flex-1 py-3 px-4 text-xs font-medium tracking-wider uppercase text-[#B7AA98] bg-[#181411] hover:bg-[#241C15] border border-[#40372E] rounded transition-all"
                    >
                      Skip Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('profile')}
                      className="flex-1 py-3 px-4 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 5: PROFILE & REGISTRATION SUMMARY */}
              {/* ========================================================= */}
              {step === 'profile' && (
                <motion.div
                  key="profile-step"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-normal text-[#FFEDD7] tracking-display">
                      Confirm Profile
                    </h1>
                    <p className="text-xs sm:text-sm text-[#B7AA98] font-light leading-relaxed">
                      Add your name to complete clinical enrollment and initialize your account.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-[#B7AA98] uppercase tracking-wider">
                      Full Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#817568]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Sarah Rao / Patient Rahul"
                        className="w-full bg-[#181411] border border-[#40372E] focus:border-[#DC5000] rounded px-10 py-3 text-sm text-[#FFEDD7] placeholder-[#817568]/70 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 bg-[#181411] border border-[#40372E] rounded-lg space-y-2.5">
                    <p className="text-[11px] font-mono text-[#817568] uppercase tracking-wider">
                      Account Specifications
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#817568] block">Phone:</span>
                        <span className="text-[#FFEDD7] font-mono">{formattedPhone}</span>
                      </div>
                      <div>
                        <span className="text-[#817568] block">Selected Role:</span>
                        <span className="text-[#FFEDD7] font-medium capitalize">{selectedRole}</span>
                      </div>
                      <div>
                        <span className="text-[#817568] block">Location Source:</span>
                        <span className="text-[#FFEDD7] capitalize">{location.source || 'Not Provided'}</span>
                      </div>
                      <div>
                        <span className="text-[#817568] block">City/State:</span>
                        <span className="text-[#FFEDD7]">{location.city ? `${location.city}, ${location.state}` : '—'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalizeRegistration}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] active:scale-[0.99] rounded transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 6: COMPLETION CELEBRATION */}
              {/* ========================================================= */}
              {step === 'complete' && (
                <motion.div
                  key="complete-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-5 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#DC5000]/20 border border-[#DC5000] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#DC5000]" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-normal text-[#FFEDD7]">Authentication Verified</h2>
                    <p className="text-xs sm:text-sm text-[#B7AA98]">
                      Routing to your customized {selectedRole ? `${selectedRole} ` : ''}dashboard...
                    </p>
                  </div>
                  <div className="w-12 h-1 bg-[#DC5000] rounded-full animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
