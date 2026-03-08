import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  Activity, AlertTriangle, ShieldCheck, LayoutDashboard, History,
  Settings, Search, ChevronRight, Zap, Clock, MapPin, Wrench,
  Bot, Train, Bell, RefreshCw, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Wifi, Menu, ChevronDown, Cpu, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

interface Alert { id: number; message: string; timestamp: string; }

const MOCK_SENSOR_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  vibration: Math.floor(Math.random() * 60 + 20),
  temperature: Math.floor(Math.random() * 40 + 50),
  wear: Math.floor(Math.random() * 30 + 10),
}));

const MOCK_SEGMENT_HEALTH = [
  { segment: 'SEG-01', health: 94, status: 'Nominal' },
  { segment: 'SEG-04', health: 67, status: 'Degraded' },
  { segment: 'SEG-07', health: 45, status: 'Critical' },
  { segment: 'SEG-12', health: 88, status: 'Nominal' },
  { segment: 'SEG-15', health: 72, status: 'Degraded' },
];

const ZONE_STATS = [
  { zone: 'Northern', active: 342, alerts: 2, status: 'green' },
  { zone: 'Western', active: 287, alerts: 0, status: 'green' },
  { zone: 'Eastern', active: 411, alerts: 5, status: 'red' },
  { zone: 'Southern', active: 198, alerts: 1, status: 'yellow' },
];

/* ─── Reusable : Avatar / Status ──────────────────────────────────── */
const PulseDot: React.FC<{ color?: string }> = ({ color = '#10b981' }) => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
      style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
  </span>
);

/* ─── Sidebar ─────────────────────────────────────────────────────── */
const Sidebar: React.FC<{
  activeTab: string; setActiveTab: (t: string) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
}> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Historical Logs', icon: History },
    { id: 'zones', label: 'Zone Monitor', icon: Train },
    { id: 'alerts', label: 'Alert Center', icon: Bell },
  ];
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        background: 'linear-gradient(180deg,#0f0f1e 0%,#090912 100%)',
        borderRight: '1px solid rgba(99,102,241,0.12)'
      }}
      className="relative flex flex-col z-20 shrink-0 overflow-hidden"
    >
      {/* inner top glow stripe */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,#6366f150,transparent)' }} />

      {/* Logo row */}
      <div className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl blur-md bg-indigo-500/40" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="font-bold text-sm tracking-widest text-white">KAVACH AI</span>
                <p className="text-[10px] text-indigo-400/70 tracking-wider uppercase">Rail Guardian</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
          <Menu size={17} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative overflow-hidden"
              style={active ? {
                background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
              } : { color: '#3f4466' }}>
              {active && (
                <motion.div layoutId="activeNav"
                  className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full"
                  style={{ background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)' }} />
              )}
              <Icon size={17} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="text-sm font-medium">{label}</motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all mt-4">
          <Settings size={17} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-medium">Settings</motion.span>
            )}
          </AnimatePresence>
        </button>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-2 p-3 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="flex items-center gap-2">
              <PulseDot />
              <span className="text-[11px] font-semibold text-emerald-400">All Systems Online</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 pl-4">Last sync: Just now</p>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

/* ─── Stat Card ───────────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: string; icon: React.ElementType;
  gradient: string; accent: string; delta?: string; positive?: boolean;
}> = ({ label, value, icon: Icon, gradient, accent, delta, positive }) => (
  <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.25 }}
    className="relative rounded-2xl p-5 overflow-hidden cursor-default"
    style={{ background: gradient, border: `1px solid ${accent}25` }}>
    {/* Shimmer overlay */}
    <div className="animate-shimmer absolute inset-0 rounded-2xl pointer-events-none" />
    {/* Top glow */}
    <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />

    <div className="relative flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl" style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}>
        <Icon size={19} style={{ color: accent }} />
      </div>
      {delta && (
        <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full"
          style={{
            background: positive ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
            color: positive ? '#10b981' : '#f43f5e',
          }}>
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {delta}
        </span>
      )}
    </div>
    <p className="text-xs text-slate-500 font-medium mb-1 relative">{label}</p>
    <h3 className="text-2xl font-bold text-white relative">{value}</h3>
  </motion.div>
);

/* ─── Severity Badge ──────────────────────────────────────────────── */
const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    High: { bg: 'rgba(244,63,94,0.12)', text: '#f43f5e', border: 'rgba(244,63,94,0.25)' },
    Medium: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    Low: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', border: 'rgba(16,185,129,0.25)' },
  };
  const s = map[level] || map.Medium;
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {level}
    </span>
  );
};

/* ─── Alert Card ──────────────────────────────────────────────────── */
const AlertCard: React.FC<{ alert: Alert; selected: boolean; onClick: () => void }> = ({
  alert, selected, onClick
}) => {
  const severity = alert.message.includes('High') || alert.message.includes('Critical') ? 'High' : 'Medium';
  const segment = alert.message.split('Segment-')[1]?.split(',')[0] || '??';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl transition-all overflow-hidden"
      style={selected ? {
        background: 'linear-gradient(135deg,rgba(244,63,94,0.08),rgba(99,102,241,0.05))',
        border: '1px solid rgba(244,63,94,0.3)',
        boxShadow: '0 0 24px rgba(244,63,94,0.1)',
      } : {
        background: 'linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
      <div className="p-4 flex gap-3.5">
        <div className="rounded-xl p-2.5 h-fit mt-0.5 shrink-0"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          <AlertTriangle size={15} style={{ color: '#f43f5e' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <SeverityBadge level={severity} />
            <span className="text-[10px] text-slate-600 font-mono">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-snug mb-2.5 line-clamp-2">
            {alert.message.replace(/[[\]]/g, '')}
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: MapPin, label: `Seg-${segment}` },
              { icon: Wrench, label: 'Immediate' },
            ].map(({ icon: I, label }) => (
              <span key={label} className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}>
                <I size={9} />{label}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-600 self-center shrink-0 transition-transform"
          style={selected ? { color: '#f43f5e', transform: 'translateX(3px)' } : {}} />
      </div>
      {selected && (
        <div className="h-px" style={{ background: 'linear-gradient(90deg,#f43f5e,#6366f1,transparent)' }} />
      )}
    </motion.div>
  );
};

/* ─── AI Advisor ──────────────────────────────────────────────────── */
const AdvisorPanel: React.FC<{ alert: Alert | null; advice: string; loading: boolean }> = ({
  alert, advice, loading
}) => (
  <div className="h-full flex flex-col min-h-[520px] rounded-2xl overflow-hidden relative"
    style={{
      background: 'linear-gradient(135deg,#0d0d1f,#0a0a18)',
      border: '1px solid rgba(99,102,241,0.15)',
    }}>
    {/* Glow corner */}
    <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full"
      style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)' }} />
    <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full"
      style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)' }} />

    {/* Header */}
    <div className="relative px-5 py-4 flex items-center gap-3"
      style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.04)' }}>
      <div className="relative">
        <div className="absolute inset-0 rounded-xl blur-md bg-indigo-500/30" />
        <div className="relative bg-gradient-to-br from-indigo-500/20 to-violet-600/20 p-2.5 rounded-xl border border-indigo-500/20">
          <Bot size={18} style={{ color: '#a5b4fc' }} />
        </div>
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">Intelligent Advisor</h2>
        <p className="text-[10px] text-indigo-400/60">Powered by Gemini 1.5 Pro · IRPWM Knowledge Base</p>
      </div>
    </div>

    {/* Body */}
    <div className="relative flex-1 p-5 flex flex-col">
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-2"
              style={{ borderColor: 'rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }} />
            <ShieldCheck size={22} className="absolute inset-0 m-auto" style={{ color: '#6366f1' }} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Deploying Agent Pipeline</h3>
          <p className="text-xs text-slate-600 max-w-[200px] leading-relaxed mb-6">
            Consulting IRPWM manuals & cross-referencing 2026 Safety Circulars...
          </p>
          <div className="space-y-2 w-full max-w-[240px]">
            {['Ingestion Agent', 'Research Agent', 'Planning Agent', 'Validation Agent'].map((agent, i) => (
              <motion.div key={agent}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.35 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
                <span className="text-xs text-slate-400">{agent}</span>
                <Cpu size={10} className="ml-auto text-indigo-500/40" />
              </motion.div>
            ))}
          </div>
        </div>
      ) : advice ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
            <span className="text-xs font-semibold text-emerald-400">SOP Validated · Safety Compliant · IRPWM §2026</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {advice.split('\n').filter(l => l.trim()).map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-400">{line}</p>
            ))}
          </div>
          <div className="pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button className="relative flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 24px rgba(99,102,241,0.3)' }}>
              <Wrench size={13} /> Work Order
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-300 transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Train size={13} /> Dispatch
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-5 animate-float">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
              <div className="relative w-full h-full rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Zap size={28} style={{ color: '#818cf8' }} />
              </div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1.5">Agentic Reasoning System</h3>
          <p className="text-xs text-slate-600 max-w-[200px] leading-relaxed">
            {alert ? 'Processing...' : 'Select an anomaly to invoke the Kavach AI expert system'}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 w-full max-w-[240px]">
            {['Ingestion', 'Research', 'Planning', 'Validation'].map(a => (
              <div key={a} className="flex items-center gap-2 px-2 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-900" />
                <span className="text-[10px] text-slate-600">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

/* ─── Main Dashboard View ─────────────────────────────────────────── */
const DashboardView: React.FC<{ alerts: Alert[]; loading: boolean; onRefresh: () => void }> = ({
  alerts, loading, onRefresh
}) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [advice, setAdvice] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = async (alert: Alert) => {
    if (selectedAlert?.id === alert.id && advice) return;
    setSelectedAlert(alert); setAdvice(''); setAnalyzing(true);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, { message: alert.message });
      setAdvice(res.data.advice);
    } catch {
      setAdvice('Could not reach the Reasoning Engine. Ensure the backend is running with a valid GOOGLE_API_KEY.');
    } finally { setAnalyzing(false); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Monitors" value="1,242" icon={Activity}
          gradient="linear-gradient(135deg,#0e0e28,#0a0a1e)"
          accent="#6366f1" delta="+3.2%" positive />
        <StatCard label="Threats Detected" value={String(alerts.length)} icon={AlertTriangle}
          gradient="linear-gradient(135deg,#1a0a10,#120810)"
          accent="#f43f5e" delta="+1" positive={false} />
        <StatCard label="System Uptime" value="99.9%" icon={Wifi}
          gradient="linear-gradient(135deg,#071a12,#050f0c)"
          accent="#10b981" delta="+0.1%" positive />
        <StatCard label="Avg. Response" value="1.4s" icon={Clock}
          gradient="linear-gradient(135deg,#1a1007,#100c05)"
          accent="#f59e0b" delta="-0.3s" positive />
      </div>

      {/* Sensor Chart */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d0d1f,#0a0a15)', border: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.06),transparent)' }} />
        <div className="relative flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">24-Hour Sensor Telemetry</h2>
            <p className="text-xs text-slate-600 mt-0.5">Vibration · Axle Temperature · Bearing Wear</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-600">
            {[['#6366f1', 'Vibration'], ['#f43f5e', 'Temp'], ['#10b981', 'Wear']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={MOCK_SENSOR_DATA}>
            <defs>
              {[['vib', '#6366f1'], ['temp', '#f43f5e'], ['wear', '#10b981']].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: 11, color: '#e2e8f0' }}
              labelStyle={{ color: '#6366f1' }} />
            <Area type="monotone" dataKey="vibration" stroke="#6366f1" strokeWidth={2} fill="url(#vib)" name="Vibration" />
            <Area type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2} fill="url(#temp)" name="Temperature" />
            <Area type="monotone" dataKey="wear" stroke="#10b981" strokeWidth={2} fill="url(#wear)" name="Wear" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts + Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alert Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <AlertTriangle size={15} style={{ color: '#f43f5e' }} />
              </div>
              <span className="text-sm font-bold text-white">Live ML Anomalies</span>
              {alerts.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-rose-400"
                  style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)' }}>
                  {alerts.length}
                </span>
              )}
            </div>
            <button onClick={onRefresh}
              className={`p-2 rounded-xl text-slate-600 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            <AnimatePresence>
              {alerts.length > 0 ? alerts.map(a => (
                <AlertCard key={a.id} alert={a} selected={selectedAlert?.id === a.id} onClick={() => analyze(a)} />
              )) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                  <Activity size={36} className="mb-3" style={{ color: 'rgba(255,255,255,0.05)' }} />
                  <p className="text-sm text-slate-600 font-medium">Scanning for track anomalies...</p>
                  <p className="text-xs text-slate-700 mt-1">All systems nominal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AdvisorPanel alert={selectedAlert} advice={advice} loading={analyzing} />
      </div>

      {/* Zone Chart + Segment Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg,#0d0d1f,#0a0a15)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-sm font-bold text-white mb-0.5">Zone Monitor Distribution</h2>
          <p className="text-xs text-slate-600 mb-5">Active sensors vs. alerts per zone</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={ZONE_STATS} barSize={20} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="zone" tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: 11, color: '#e2e8f0' }} />
              <Bar dataKey="active" fill="#6366f1" radius={[5, 5, 0, 0]} name="Active Sensors" />
              <Bar dataKey="alerts" fill="#f43f5e" radius={[5, 5, 0, 0]} name="Active Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Health */}
        <div className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg,#0d0d1f,#0a0a15)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-sm font-bold text-white mb-0.5">Segment Health Index</h2>
          <p className="text-xs text-slate-600 mb-5">Structural integrity scores — real-time</p>
          <div className="space-y-4">
            {MOCK_SEGMENT_HEALTH.map(s => {
              const color = s.health > 80 ? '#10b981' : s.health > 60 ? '#f59e0b' : '#f43f5e';
              return (
                <div key={s.segment} className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-600 w-14 shrink-0">{s.segment}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${s.health}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg,${color}aa,${color})`, boxShadow: `0 0 8px ${color}50` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-8 text-right text-white">{s.health}%</span>
                  <span className="text-[10px] font-semibold w-16 text-right" style={{ color }}>
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Root ────────────────────────────────────────────────────────── */
const App: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/alerts`);
      setAlerts(res.data.alerts);
    } catch { /* show empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAlerts();
    const iv = setInterval(fetchAlerts, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080810' }}>
      {/* Ambient background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-80 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)' }} />
        <div className="absolute -bottom-80 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(244,63,94,0.04),transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.03),transparent 70%)' }} />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-[62px] flex items-center justify-between px-6 shrink-0"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#2d3150' }} />
            <input placeholder="Search assets, segments, zones..."
              className="pl-9 pr-4 py-2 w-72 text-sm rounded-xl focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#e2e8f0',
                caretColor: '#6366f1',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* System Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <PulseDot />
              System Online
            </div>

            {/* Bell */}
            <button className="relative p-2 rounded-xl text-slate-600 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Bell size={15} />
              {alerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: '#f43f5e', boxShadow: '0 0 6px rgba(244,63,94,0.6)' }} />
              )}
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}>
                AK
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Ankush Singh</p>
                <p className="text-[10px] text-slate-600">Senior Engineer</p>
              </div>
              <ChevronDown size={12} className="text-slate-600" />
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} style={{ color: '#6366f1' }} />
                      <h1 className="text-lg font-bold text-white">Operations Dashboard</h1>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">Real-time Indian Railway asset health monitoring · AI-powered anomaly detection</p>
                  </div>
                  <DashboardView alerts={alerts} loading={loading} onRefresh={fetchAlerts} />
                </motion.div>
              )}
              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <History size={44} className="mb-4" style={{ color: 'rgba(99,102,241,0.15)' }} />
                  <h2 className="text-base font-semibold text-white">Historical Logs</h2>
                  <p className="text-sm text-slate-600 mt-2">Connect to the backend to view historical anomaly data.</p>
                </motion.div>
              )}
              {activeTab === 'zones' && (
                <motion.div key="zones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h1 className="text-lg font-bold text-white">Zone Monitor</h1>
                    <p className="text-xs text-slate-600 mt-0.5">Geographic zone health and alert distribution</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ZONE_STATS.map(z => {
                      const c = z.status === 'green' ? '#10b981' : z.status === 'yellow' ? '#f59e0b' : '#f43f5e';
                      return (
                        <div key={z.zone} className="rounded-2xl p-5"
                          style={{ background: 'linear-gradient(135deg,#0d0d1f,#0a0a15)', border: `1px solid ${c}15` }}>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-white">{z.zone}</span>
                            <PulseDot color={c} />
                          </div>
                          <p className="text-3xl font-bold text-white">{z.active}</p>
                          <p className="text-xs text-slate-600 mt-1">Active Sensors</p>
                          <p className="text-xs font-semibold mt-3" style={{ color: c }}>
                            {z.alerts > 0 ? `⚠ ${z.alerts} alert${z.alerts > 1 ? 's' : ''}` : '✓ All Clear'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              {activeTab === 'alerts' && (
                <motion.div key="alerts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <Bell size={44} className="mb-4" style={{ color: 'rgba(244,63,94,0.15)' }} />
                  <h2 className="text-base font-semibold text-white">Alert Center</h2>
                  <p className="text-sm text-slate-600 mt-2">Priority-queued alert management — coming soon.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
