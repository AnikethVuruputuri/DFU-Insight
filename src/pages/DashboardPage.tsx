import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Camera,
  FileText,
  Users,
  TrendingUp,
  Clock,
  LogOut,
  Stethoscope,
  Heart,
  Shield,
  ChevronRight,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardPageProps {
  onNavigateAnalyze: () => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateAnalyze, onLogout }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'guidelines'>('overview');

  if (!user) return null;

  const roleConfig = {
    patient: {
      title: 'Patient Healing Journal',
      badge: 'Patient Portal',
      icon: Heart,
      color: '#DC5000',
      greeting: `Welcome, ${user.name || 'Patient'}`,
      subtitle: 'Monitor your ulcer recovery, offloading adherence, and AI risk staging.',
      stats: [
        { label: 'Current Staging', value: 'Wagner Grade 1', sub: 'Superficial Ulcer' },
        { label: 'Healing Velocity', value: '+18.4%', sub: 'Re-epithelialization vs Day 0' },
        { label: 'Next Dressing', value: 'Tomorrow, 10:00 AM', sub: 'Saline hydrogel change' },
      ],
      actions: [
        {
          label: 'Upload New Wound Image',
          desc: 'Photograph your ulcer today to evaluate bacterial infection and tissue margin changes.',
          icon: Camera,
          primary: true,
          handler: onNavigateAnalyze,
        },
        {
          label: 'Healing Progress Gallery',
          desc: 'Inspect longitudinal photograph comparisons and perimeter shrinkage charts.',
          icon: TrendingUp,
          primary: false,
          handler: () => setActiveTab('records'),
        },
        {
          label: 'Care & Offloading Protocols',
          desc: 'Guidelines on pressure relief footwear, diabetic glucose control, and red-flag symptoms.',
          icon: FileText,
          primary: false,
          handler: () => setActiveTab('guidelines'),
        },
      ],
    },
    doctor: {
      title: 'Clinical Diagnostic Console',
      badge: 'Clinician Workspace',
      icon: Stethoscope,
      color: '#0d9488',
      greeting: `Welcome, ${user.name || 'Doctor'}`,
      subtitle: 'Multi-patient diabetic foot ulcer assessment, dual-branch inference, and XAI attributions.',
      stats: [
        { label: 'Active Roster', value: '28 Patients', sub: 'Outpatient & Inpatient' },
        { label: 'Critical Alerts', value: '3 Flagged', sub: 'Wagner Grade 3+ Deep Fascia' },
        { label: 'Dual-Branch Agreement', value: '96.2%', sub: 'EfficientNetV2 + Swin' },
      ],
      actions: [
        {
          label: 'Launch Clinical Inference',
          desc: 'Run dual-branch AI classification (Infection / Ischaemia / Wagner 0-4) with full XAI suite.',
          icon: Camera,
          primary: true,
          handler: onNavigateAnalyze,
        },
        {
          label: 'Patient Triage Queue',
          desc: 'Review urgency-ranked diabetic ulcer cases with bacterial colonization probability.',
          icon: Users,
          primary: false,
          handler: () => setActiveTab('records'),
        },
        {
          label: 'Export Diagnostic Summary',
          desc: 'Generate clinical consensus reports formatted for surgical consultation or EHR upload.',
          icon: FileText,
          primary: false,
          handler: () => setActiveTab('guidelines'),
        },
      ],
    },
    nurse: {
      title: 'Point-of-Care Nursing Console',
      badge: 'Ward Protocol Console',
      icon: Shield,
      color: '#B7AA98',
      greeting: `Welcome, ${user.name || 'Nurse'}`,
      subtitle: 'Bedside wound monitoring, antiseptic dressing schedule, and surgical escalation alerts.',
      stats: [
        { label: 'Ward Bed Count', value: '14 Assigned', sub: 'Endocrine & Vascular Unit' },
        { label: 'Pending Dressings', value: '4 Due Today', sub: 'Silver alginate & hydrocolloid' },
        { label: 'Exudate Flags', value: '1 Purulent', sub: 'Escalated to On-Call Fellow' },
      ],
      actions: [
        {
          label: 'Point-of-Care Wound Capture',
          desc: 'Photograph bedside wound dressing change and log tissue granulations directly.',
          icon: Camera,
          primary: true,
          handler: onNavigateAnalyze,
        },
        {
          label: 'Dressing Change Schedule',
          desc: 'Manage bed-by-bed antiseptic protocols, offloading casts, and debridement times.',
          icon: Clock,
          primary: false,
          handler: () => setActiveTab('records'),
        },
        {
          label: 'Standard Wound Protocols',
          desc: 'Reference hospital aseptic technique guidelines and microbiological culture procedures.',
          icon: FileText,
          primary: false,
          handler: () => setActiveTab('guidelines'),
        },
      ],
    },
  };

  const currentRole = user.role.toLowerCase() as 'patient' | 'doctor' | 'nurse';
  const roleData = roleConfig[currentRole] || roleConfig.patient;
  const RoleIcon = roleData.icon;

  const mockCases = [
    {
      id: 'DFU-2026-081',
      patient: 'Ramesh K. (62M)',
      site: 'Right Hallux Plantar',
      grade: 'Wagner 2',
      pathology: 'Infection',
      confidence: '92.4%',
      status: 'High Priority',
      date: 'Today, 09:30 AM',
    },
    {
      id: 'DFU-2026-079',
      patient: 'Sunita V. (55F)',
      site: 'Left 1st Metatarsal',
      grade: 'Wagner 1',
      pathology: 'None',
      confidence: '88.1%',
      status: 'Stable',
      date: 'Yesterday',
    },
    {
      id: 'DFU-2026-072',
      patient: 'Harish M. (68M)',
      site: 'Left Lateral Heel',
      grade: 'Wagner 3',
      pathology: 'Both (Inf + Isch)',
      confidence: '95.6%',
      status: 'Surgical Consult',
      date: 'Oct 28',
    },
  ];

  return (
    <div className="w-full flex-1 bg-[#100904] text-[#FFEDD7] p-6 sm:p-10 lg:p-14 selection:bg-[#DC5000]/30 selection:text-[#FFEDD7]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ========================================================= */}
        {/* TOP HEADER: User Identity Bar */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[#40372E]/60">
          <div className="flex items-center gap-4 text-left">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${roleData.color}15`,
                borderColor: `${roleData.color}40`,
              }}
            >
              <RoleIcon className="w-7 h-7" style={{ color: roleData.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-normal text-[#FFEDD7] tracking-display">
                  {roleData.greeting}
                </h1>
                <span
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                  style={{
                    backgroundColor: `${roleData.color}25`,
                    color: roleData.color,
                  }}
                >
                  {roleData.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#B7AA98] font-light mt-1">
                {roleData.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateAnalyze}
              className="px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-white bg-[#DC5000] hover:bg-[#b84300] rounded transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
            <button
              onClick={async () => {
                await logout();
                onLogout();
              }}
              className="px-4 py-2.5 text-xs font-mono text-[#817568] hover:text-[#FFEDD7] bg-[#181411] hover:bg-[#241C15] border border-[#40372E] rounded transition-all flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* METADATA BAR: Phone, Location, Timestamp */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 bg-[#181411] border border-[#40372E]/70 rounded-lg">
            <span className="text-[11px] font-mono text-[#817568] uppercase tracking-wider block">
              Registered Phone
            </span>
            <span className="text-sm font-mono text-[#FFEDD7] mt-1 block">
              {user.phone}
            </span>
          </div>

          <div className="p-4 bg-[#181411] border border-[#40372E]/70 rounded-lg">
            <span className="text-[11px] font-mono text-[#817568] uppercase tracking-wider block">
              Clinical Location
            </span>
            <span className="text-sm text-[#FFEDD7] mt-1 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#DC5000] shrink-0" />
              <span>{user.city ? `${user.city}, ${user.state || ''}` : 'Location Not Set'}</span>
            </span>
          </div>

          <div className="p-4 bg-[#181411] border border-[#40372E]/70 rounded-lg">
            <span className="text-[11px] font-mono text-[#817568] uppercase tracking-wider block">
              Account Status
            </span>
            <span className="text-sm text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OTP Phone Verified</span>
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROLE STATS CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {roleData.stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 bg-[#181411] border border-[#40372E] rounded-lg relative overflow-hidden"
            >
              <span className="text-[11px] font-mono text-[#817568] uppercase tracking-wider block">
                {stat.label}
              </span>
              <span className="text-2xl font-normal text-[#FFEDD7] tracking-tight mt-1.5 block">
                {stat.value}
              </span>
              <span className="text-xs text-[#B7AA98] font-light mt-1 block">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* PRIMARY ACTION CARDS */}
        {/* ========================================================= */}
        <div className="space-y-4 text-left">
          <h2 className="text-sm font-mono text-[#B7AA98] uppercase tracking-wider">
            Clinical Tools & Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleData.actions.map((act, i) => {
              const ActionIcon = act.icon;
              return (
                <button
                  key={i}
                  onClick={act.handler}
                  className={`p-6 rounded-lg border text-left transition-all group flex flex-col justify-between ${
                    act.primary
                      ? 'bg-[#DC5000]/10 border-[#DC5000]/60 hover:bg-[#DC5000]/15 hover:border-[#DC5000]'
                      : 'bg-[#181411] border-[#40372E] hover:bg-[#241C15] hover:border-[#817568]'
                  }`}
                >
                  <div className="space-y-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        act.primary ? 'bg-[#DC5000]/20' : 'bg-[#241C15] group-hover:bg-[#40372E]/50'
                      }`}
                    >
                      <ActionIcon
                        className="w-5 h-5"
                        style={{ color: act.primary ? '#DC5000' : '#FFEDD7' }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-[#FFEDD7] group-hover:text-white transition-colors">
                        {act.label}
                      </h3>
                      <p className="text-xs text-[#817568] mt-1.5 leading-relaxed font-light">
                        {act.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between text-xs font-mono text-[#817568] group-hover:text-[#FFEDD7] transition-colors">
                    <span>{act.primary ? 'Launch Analyzer' : 'Inspect'}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CASE QUEUE / RECENT RECORDS TABLE */}
        {/* ========================================================= */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono text-[#B7AA98] uppercase tracking-wider">
              {currentRole === 'patient' ? 'Recent Wound Images' : 'Recent Clinical Staging Queue'}
            </h2>
            <button
              onClick={onNavigateAnalyze}
              className="text-xs font-mono text-[#DC5000] hover:text-[#b84300] flex items-center gap-1 transition-colors"
            >
              <span>Add Record</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto bg-[#181411] border border-[#40372E] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#100904] border-b border-[#40372E] text-[11px] font-mono text-[#817568] uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Case ID</th>
                  <th className="px-5 py-3.5 font-medium">Subject / Site</th>
                  <th className="px-5 py-3.5 font-medium">Wagner Severity</th>
                  <th className="px-5 py-3.5 font-medium">Pathology</th>
                  <th className="px-5 py-3.5 font-medium">AI Confidence</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#40372E]/40 text-[#B7AA98]">
                {mockCases.map((row) => (
                  <tr key={row.id} className="hover:bg-[#241C15]/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-[#FFEDD7]">{row.id}</td>
                    <td className="px-5 py-4">
                      <span className="text-[#FFEDD7] font-medium block">{row.patient}</span>
                      <span className="text-[11px] text-[#817568]">{row.site}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[#FFEDD7]">{row.grade}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          row.pathology.includes('Inf')
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                            : 'bg-[#241C15] text-[#B7AA98]'
                        }`}
                      >
                        {row.pathology}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[#FFEDD7]">{row.confidence}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] ${
                          row.status.includes('High') || row.status.includes('Surgical')
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={onNavigateAnalyze}
                        className="text-xs font-mono text-[#DC5000] hover:text-[#b84300] hover:underline"
                      >
                        View XAI →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
