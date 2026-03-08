import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  Activity, AlertTriangle, ShieldCheck, LayoutDashboard, History,
  Settings, Search, ChevronRight, Zap, Clock, MapPin, Wrench,
  Bot, Train, Bell, RefreshCw, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Wifi, Menu, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

interface Alert {
  id: number;
  message: string;
  timestamp: string;
}

const MOCK_SENSOR_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  vibration: Math.random() * 60 + 20,
  temperature: Math.random() * 40 + 50,
  wear: Math.random() * 30 + 10,
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

const Sidebar: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }> = ({
  activeTab, setActiveTab, collapsed, setCollapsed
}) => {
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
      className="flex flex-col border-r border-border bg-secondary/80 backdrop-blur-xl z-20 shrink-0 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3">
              <div className="bg-accent/20 border border-accent/30 p-2 rounded-xl">
                <ShieldCheck className="text-accent w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-text">KAVACH AI</span>
                <p className="text-[10px] text-text-muted">Rail Asset Guardian</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-card text-text-muted hover:text-text transition-all">
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${activeTab === id ? 'bg-accent/10 text-accent border border-accent/20' : 'hover:bg-card text-text-muted hover:text-text'}`}>
            <Icon size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-sm font-medium truncate">{label}</motion.span>
              )}
            </AnimatePresence>
            {activeTab === id && <motion.div layoutId="activeNav" className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-accent rounded-full" />}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-card text-text-muted hover:text-text transition-all`}>
          <Settings size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-medium">Settings</motion.span>
            )}
          </AnimatePresence>
        </button>
        {!collapsed && (
          <div className="mt-4 p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-medium text-success">All Systems Online</span>
            </div>
            <p className="text-[11px] text-text-muted">Last sync: Just now</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string; bg: string; delta?: string; positive?: boolean }> = ({
  label, value, icon: Icon, color, bg, delta, positive
}) => (
  <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}
    className="premium-card flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className={`${bg} ${color} p-3 rounded-xl`}>
        <Icon size={20} />
      </div>
      {delta && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${positive ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-text-muted font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-text">{value}</h3>
    </div>
  </motion.div>
);

const SeverityBadge: React.FC<{ level: string }> = ({ level }) => {
  const styles: Record<string, string> = {
    High: 'bg-danger/10 text-danger border-danger/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-success/10 text-success border-success/20',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${styles[level] || styles.Medium}`}>
      {level}
    </span>
  );
};

const AlertCard: React.FC<{ alert: Alert; selected: boolean; onClick: () => void }> = ({ alert, selected, onClick }) => {
  const severity = alert.message.includes('High') ? 'High' : alert.message.includes('Critical') ? 'High' : 'Medium';
  const segment = alert.message.split('Segment-')[1]?.split(',')[0] || '??';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border transition-all overflow-hidden ${selected ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border bg-card hover:border-border/80 hover:bg-card-hover'}`}
    >
      <div className="p-4 flex gap-4">
        <div className="bg-danger/10 text-danger p-2.5 h-fit rounded-xl mt-0.5">
          <AlertTriangle size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <SeverityBadge level={severity} />
            <span className="text-[10px] text-text-muted font-mono shrink-0">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm font-medium text-text leading-snug mb-3 line-clamp-2">
            {alert.message.replace('[', '').replace(']', '')}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] bg-secondary px-2 py-1 rounded-md text-text-muted flex items-center gap-1 border border-border">
              <MapPin size={9} /> Seg-{segment}
            </span>
            <span className="text-[10px] bg-secondary px-2 py-1 rounded-md text-text-muted flex items-center gap-1 border border-border">
              <Wrench size={9} /> Immediate Action
            </span>
          </div>
        </div>
        <ChevronRight size={14} className={`text-text-muted self-center shrink-0 transition-transform ${selected ? 'translate-x-1 text-accent' : ''}`} />
      </div>
      {selected && <div className="h-0.5 bg-gradient-to-r from-accent via-blue-400 to-transparent" />}
    </motion.div>
  );
};

const AdvisorPanel: React.FC<{ alert: Alert | null; advice: string; loading: boolean }> = ({ alert, advice, loading }) => (
  <div className="premium-card h-full flex flex-col min-h-[520px] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -z-10 rounded-full pointer-events-none" />
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-accent/10 p-2.5 rounded-xl border border-accent/20">
        <Bot size={20} className="text-accent" />
      </div>
      <div>
        <h2 className="text-base font-bold text-text">Intelligent Advisor</h2>
        <p className="text-xs text-text-muted">Powered by Gemini 1.5 Pro + IRPWM</p>
      </div>
    </div>

    {loading ? (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent" />
          <ShieldCheck className="text-accent w-6 h-6 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-base font-bold text-text mb-2">Deploying Reasoning Agents</h3>
        <p className="text-xs text-text-muted max-w-[220px] leading-relaxed">Consulting IRPWM manuals and cross-referencing 2026 Safety Circulars...</p>
        <div className="mt-6 space-y-2 w-full max-w-xs">
          {['Ingestion Agent', 'Research Agent', 'Planning Agent', 'Validation Agent'].map((agent, i) => (
            <motion.div key={agent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
              className="flex items-center gap-3 p-2 rounded-lg bg-secondary border border-border">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.4 }}
                className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-xs text-text-muted">{agent}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ) : advice ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/10">
          <CheckCircle2 size={16} className="text-success shrink-0" />
          <span className="text-xs font-semibold text-success">SOP Validated · Safety Compliant</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {advice.split('\n').filter(l => l.trim()).map((line, i) => (
            <p key={i} className="text-sm leading-relaxed text-text/90">{line}</p>
          ))}
        </div>
        <div className="pt-4 border-t border-border grid grid-cols-2 gap-3">
          <button className="bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2">
            <Wrench size={14} /> Work Order
          </button>
          <button className="bg-secondary hover:bg-card-hover border border-border text-text font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            <Train size={14} /> Dispatch
          </button>
        </div>
      </motion.div>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
        <div className="bg-secondary border border-border p-6 rounded-3xl mb-5">
          <Zap size={32} className="text-accent/60" />
        </div>
        <h3 className="text-base font-semibold text-text mb-2">Agentic Reasoning System</h3>
        <p className="text-sm max-w-[240px] leading-relaxed">
          {alert ? 'Processing...' : 'Select an anomaly from the feed to invoke the Kavach AI expert system.'}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 text-left w-full max-w-xs">
          {['Ingestion', 'Research', 'Planning', 'Validation'].map(a => (
            <div key={a} className="flex items-center gap-2 p-2 rounded-lg bg-secondary border border-border">
              <div className="w-1.5 h-1.5 bg-border rounded-full" />
              <span className="text-[11px] text-text-muted">{a} Agent</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const DashboardView: React.FC<{ alerts: Alert[]; loading: boolean; onRefresh: () => void }> = ({ alerts, loading, onRefresh }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [advice, setAdvice] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = async (alert: Alert) => {
    if (selectedAlert?.id === alert.id && advice) return;
    setSelectedAlert(alert);
    setAdvice('');
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_BASE}/analyze`, { message: alert.message });
      setAdvice(res.data.advice);
    } catch {
      setAdvice("Could not connect to the Reasoning Engine. Ensure the backend is running with a valid GOOGLE_API_KEY.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Active Monitors" value="1,242" icon={Activity} color="text-accent" bg="bg-accent/10" delta="+3.2%" positive />
        <StatCard label="Threats Detected" value={String(alerts.length)} icon={AlertTriangle} color="text-danger" bg="bg-danger/10" delta="+1" positive={false} />
        <StatCard label="System Uptime" value="99.9%" icon={Wifi} color="text-success" bg="bg-success/10" delta="+0.1%" positive />
        <StatCard label="Avg. Response" value="1.4s" icon={Clock} color="text-yellow-400" bg="bg-yellow-400/10" delta="-0.3s" positive />
      </div>

      {/* Sensor Chart */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-text">24-Hour Sensor Telemetry</h2>
            <p className="text-xs text-text-muted mt-0.5">Vibration · Temperature · Bearing Wear</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Live Feed</span>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MOCK_SENSOR_DATA}>
            <defs>
              <linearGradient id="gVib" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gWear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="hour" tick={{ fill: '#a1a1aa', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: 12 }} />
            <Area type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} fill="url(#gVib)" name="Vibration" />
            <Area type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} fill="url(#gTemp)" name="Temperature" />
            <Area type="monotone" dataKey="wear" stroke="#10b981" strokeWidth={2} fill="url(#gWear)" name="Wear" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Main Grid: Alerts + Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-danger" size={18} />
              <h2 className="text-base font-bold text-text">Live ML Anomalies</h2>
              {alerts.length > 0 && (
                <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{alerts.length}</span>
              )}
            </div>
            <button onClick={onRefresh}
              className={`p-2 rounded-lg hover:bg-card border border-border text-text-muted hover:text-text transition-all ${loading ? 'animate-spin' : ''}`}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence>
              {alerts.length > 0 ? alerts.map(a => (
                <AlertCard key={a.id} alert={a} selected={selectedAlert?.id === a.id} onClick={() => analyze(a)} />
              )) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border bg-secondary/20">
                  <Activity size={40} className="text-text-muted/20 mb-3" />
                  <p className="text-sm text-text-muted font-medium">Scanning for track anomalies...</p>
                  <p className="text-xs text-text-muted/60 mt-1">All systems nominal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI Advisor */}
        <AdvisorPanel alert={selectedAlert} advice={advice} loading={analyzing} />
      </div>

      {/* Zone Health + Segment Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Bar Chart */}
        <div className="premium-card">
          <h2 className="text-base font-bold text-text mb-1">Zone-wise Monitor Distribution</h2>
          <p className="text-xs text-text-muted mb-6">Active sensor counts by geographic zone</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ZONE_STATS} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="zone" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: 12 }} />
              <Bar dataKey="active" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Active Sensors" />
              <Bar dataKey="alerts" fill="#ef4444" radius={[6, 6, 0, 0]} name="Active Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Segment Health Table */}
        <div className="premium-card">
          <h2 className="text-base font-bold text-text mb-1">Segment Health Index</h2>
          <p className="text-xs text-text-muted mb-5">Real-time structural integrity scores</p>
          <div className="space-y-3">
            {MOCK_SEGMENT_HEALTH.map(s => (
              <div key={s.segment} className="flex items-center gap-4">
                <span className="text-xs font-mono text-text-muted w-14 shrink-0">{s.segment}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.health}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${s.health > 80 ? 'bg-success' : s.health > 60 ? 'bg-yellow-400' : 'bg-danger'}`}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-right text-text">{s.health}%</span>
                <span className={`text-[10px] font-semibold w-16 text-right ${s.status === 'Nominal' ? 'text-success' : s.status === 'Degraded' ? 'text-yellow-400' : 'text-danger'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    } catch {
      // Backend not running — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[400px] bg-accent/5 blur-[150px] -z-10 rounded-full" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-danger/5 blur-[120px] -z-10 rounded-full" />

        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-secondary/60 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input placeholder="Search assets, segments, zones..."
                className="bg-card border border-border rounded-xl pl-9 pr-4 py-2 w-72 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all text-sm text-text placeholder-text-muted" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-full text-xs font-semibold border border-success/20">
              <Zap size={12} fill="currentColor" />
              System Online
            </div>
            <button className="relative p-2 rounded-xl hover:bg-card border border-border text-text-muted hover:text-text transition-all">
              <Bell size={16} />
              {alerts.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full" />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center text-xs font-bold text-white">AK</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-text">Ankush Singh</p>
                <p className="text-[10px] text-text-muted">Senior Engineer</p>
              </div>
              <ChevronDown size={12} className="text-text-muted" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-text">Operations Dashboard</h1>
                    <p className="text-sm text-text-muted mt-0.5">Real-time Indian Railway asset health monitoring</p>
                  </div>
                  <DashboardView alerts={alerts} loading={loading} onRefresh={fetchAlerts} />
                </motion.div>
              )}
              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[60vh] text-center text-text-muted">
                  <History size={48} className="mb-4 opacity-20" />
                  <h2 className="text-lg font-semibold text-text">Historical Logs</h2>
                  <p className="text-sm mt-2">Connect to the backend to view historical anomaly logs.</p>
                </motion.div>
              )}
              {activeTab === 'zones' && (
                <motion.div key="zones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h1 className="text-xl font-bold text-text">Zone Monitor</h1>
                    <p className="text-sm text-text-muted mt-0.5">Geographic zone health and alert distribution</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {ZONE_STATS.map(z => (
                      <div key={z.zone} className="premium-card">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold">{z.zone} Zone</span>
                          <div className={`w-2.5 h-2.5 rounded-full ${z.status === 'green' ? 'bg-success' : z.status === 'yellow' ? 'bg-yellow-400' : 'bg-danger'} animate-pulse`} />
                        </div>
                        <p className="text-3xl font-bold">{z.active}</p>
                        <p className="text-xs text-text-muted mt-1">Active Sensors</p>
                        <div className={`mt-3 text-xs font-semibold ${z.alerts > 0 ? 'text-danger' : 'text-success'}`}>
                          {z.alerts > 0 ? `${z.alerts} active alert${z.alerts > 1 ? 's' : ''}` : 'All systems clear'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === 'alerts' && (
                <motion.div key="alerts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[60vh] text-center text-text-muted">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <h2 className="text-lg font-semibold text-text">Alert Center</h2>
                  <p className="text-sm mt-2">Real-time alert management with priority queuing.</p>
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
