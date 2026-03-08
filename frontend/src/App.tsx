import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  Activity, AlertTriangle, ShieldCheck, LayoutDashboard, History,
  Settings, Search, ChevronRight, Zap, Clock, MapPin, Wrench,
  Bot, Train, Bell, RefreshCw, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Wifi, Menu, ChevronDown, Shield, Radar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

interface Alert { id: number; message: string; timestamp: string; }

const MOCK_SENSOR = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  vibration: Math.floor(Math.random() * 60 + 20),
  temperature: Math.floor(Math.random() * 40 + 50),
  wear: Math.floor(Math.random() * 30 + 10),
}));

const SEGMENT_HEALTH = [
  { seg: 'SEG-01', val: 94, status: 'Nominal', color: '#10b981' },
  { seg: 'SEG-04', val: 67, status: 'Degraded', color: '#f59e0b' },
  { seg: 'SEG-07', val: 45, status: 'Critical', color: '#f43f5e' },
  { seg: 'SEG-12', val: 88, status: 'Nominal', color: '#10b981' },
  { seg: 'SEG-15', val: 72, status: 'Degraded', color: '#f59e0b' },
];

const ZONES = [
  { zone: 'Northern', active: 342, alerts: 2, c: '#f43f5e' },
  { zone: 'Western', active: 287, alerts: 0, c: '#10b981' },
  { zone: 'Eastern', active: 411, alerts: 5, c: '#f43f5e' },
  { zone: 'Southern', active: 198, alerts: 1, c: '#f59e0b' },
];

/* ── Pulse Dot ── */
const PulseDot = ({ color = '#10b981' }: { color?: string }) => (
  <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
    <span className="animate-ping" style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      backgroundColor: color, opacity: 0.5
    }} />
    <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
  </span>
);

/* ── Sidebar ── */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'Historical Logs', icon: History },
  { id: 'zones', label: 'Zone Monitor', icon: Train },
  { id: 'alerts', label: 'Alert Center', icon: Bell },
];

const Sidebar = ({ active, set, collapsed, toggle }: {
  active: string; set: (s: string) => void; collapsed: boolean; toggle: () => void;
}) => (
  <motion.div
    animate={{ width: collapsed ? 68 : 256 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    style={{
      flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: 'linear-gradient(180deg,#0b0b1a 0%,#080812 100%)',
      borderRight: '1px solid rgba(99,102,241,0.12)', position: 'relative', zIndex: 20,
    }}
  >
    {/* top accent line */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)'
    }} />

    {/* Logo */}
    <div style={{ padding: '18px 14px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo icon */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 12, filter: 'blur(8px)',
                background: 'rgba(99,102,241,0.4)',
              }} />
              <div style={{
                position: 'relative', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                borderRadius: 10, padding: '7px', display: 'flex', alignItems: 'center',
              }}>
                <Radar size={18} color="white" />
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', color: '#fff', lineHeight: 1.2 }}>
                RAILSENTRY
              </div>
              <div style={{ fontSize: 9, color: 'rgba(139,92,246,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                AI Guardian
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={toggle} style={{
        padding: 8, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer',
        color: '#475569', display: 'flex', alignItems: 'center',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}>
        <Menu size={16} />
      </button>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {NAV.map(({ id, label, icon: Icon }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => set(id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 12, cursor: 'pointer', position: 'relative',
            background: on ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.08))' : 'transparent',
            border: on ? '1px solid rgba(99,102,241,0.22)' : '1px solid transparent',
            color: on ? '#a5b4fc' : '#374151', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!on) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; } }}
            onMouseLeave={e => { if (!on) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; } }}
          >
            {on && <div style={{
              position: 'absolute', left: 0, top: '25%', bottom: '25%', width: 2,
              background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)', borderRadius: 99,
            }} />}
            <Icon size={16} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </nav>

    {/* Bottom */}
    <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
      <button style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151',
      }}>
        <Settings size={16} style={{ flexShrink: 0 }} />
        {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Settings</span>}
      </button>
      {!collapsed && (
        <div style={{
          marginTop: 10, padding: '10px 12px', borderRadius: 12,
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PulseDot />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>Systems Online</span>
          </div>
          <p style={{ fontSize: 10, color: '#1e293b', marginTop: 4, paddingLeft: 18 }}>Last sync: just now</p>
        </div>
      )}
    </div>
  </motion.div>
);

/* ── Stat Card ── */
const StatCard = ({ label, value, icon: Icon, accent, grad, delta, positive }: {
  label: string; value: string; icon: React.ElementType; accent: string; grad: string;
  delta?: string; positive?: boolean;
}) => (
  <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.2 }}
    className="animate-shimmer"
    style={{
      background: grad, border: `1px solid ${accent}20`, borderRadius: 16,
      padding: '18px 20px', position: 'relative', overflow: 'hidden', cursor: 'default',
    }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accent}70,transparent)` }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ padding: 10, borderRadius: 12, background: `${accent}15`, border: `1px solid ${accent}25` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      {delta && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700,
          padding: '3px 8px', borderRadius: 99,
          background: positive ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
          color: positive ? '#10b981' : '#f43f5e',
        }}>
          {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {delta}
        </span>
      )}
    </div>
    <p style={{ fontSize: 11, color: '#475569', fontWeight: 500, marginBottom: 4 }}>{label}</p>
    <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{value}</h3>
  </motion.div>
);

/* ── Alert Card ── */
const AlertCard = ({ alert, selected, onClick }: { alert: Alert; selected: boolean; onClick: () => void }) => {
  const sev = alert.message.includes('High') || alert.message.includes('Critical') ? 'High' : 'Medium';
  const seg = alert.message.split('Segment-')[1]?.split(',')[0] || '??';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{
        cursor: 'pointer', borderRadius: 14, overflow: 'hidden', transition: 'all 0.25s',
        background: selected ? 'linear-gradient(135deg,rgba(244,63,94,0.08),rgba(99,102,241,0.05))' : 'rgba(255,255,255,0.025)',
        border: selected ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: selected ? '0 0 24px rgba(244,63,94,0.08)' : 'none',
      }}>
      <div style={{ padding: '14px 16px', display: 'flex', gap: 12 }}>
        <div style={{
          padding: '9px', borderRadius: 10, flexShrink: 0, alignSelf: 'flex-start', marginTop: 2,
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
        }}>
          <AlertTriangle size={14} color="#f43f5e" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 99,
              background: sev === 'High' ? 'rgba(244,63,94,0.12)' : 'rgba(245,158,11,0.12)',
              border: sev === 'High' ? '1px solid rgba(244,63,94,0.25)' : '1px solid rgba(245,158,11,0.25)',
              color: sev === 'High' ? '#f43f5e' : '#f59e0b',
            }}>{sev}</span>
            <span style={{ fontSize: 10, color: '#1e293b', fontFamily: 'monospace' }}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, lineHeight: 1.5, marginBottom: 10 }}>
            {alert.message.replace(/[[\]]/g, '')}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {([[MapPin, `Seg-${seg}`], [Wrench, 'Immediate']] as [React.ElementType, string][]).map(([I, lbl]) => (
              <span key={lbl} style={{
                fontSize: 10, display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 8,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                color: '#334155',
              }}>
                <I size={9} />{lbl}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight size={13} style={{ color: selected ? '#f43f5e' : '#1e293b', alignSelf: 'center', flexShrink: 0 }} />
      </div>
      {selected && (
        <div style={{ height: 1, background: 'linear-gradient(90deg,#f43f5e,#6366f1,transparent)' }} />
      )}
    </motion.div>
  );
};

/* ── AI Advisor ── */
const Advisor = ({ alert, advice, loading }: { alert: Alert | null; advice: string; loading: boolean }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', minHeight: 500, borderRadius: 16, overflow: 'hidden',
    background: 'linear-gradient(160deg,#0c0c1e 0%,#090914 100%)',
    border: '1px solid rgba(99,102,241,0.15)', position: 'relative',
  }}>
    {/* Corner glows */}
    <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)' }} />
    <div style={{ position: 'absolute', bottom: -60, left: -60, width: 150, height: 150, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)' }} />

    {/* Header */}
    <div style={{
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: '1px solid rgba(99,102,241,0.1)',
      background: 'rgba(99,102,241,0.04)',
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 10, filter: 'blur(6px)', background: 'rgba(99,102,241,0.3)' }} />
        <div style={{ position: 'relative', padding: 9, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Bot size={16} color="#a5b4fc" />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Intelligent Advisor</div>
        <div style={{ fontSize: 10, color: 'rgba(139,92,246,0.6)' }}>Gemini 1.5 Pro · IRPWM Knowledge Base</div>
      </div>
    </div>

    {/* Body */}
    <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <div className="spin-slow" style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid rgba(99,102,241,0.15)',
              borderTopColor: '#6366f1',
            }} />
            <ShieldCheck size={20} color="#6366f1" style={{ position: 'absolute', inset: 0, margin: 'auto' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Deploying Agent Pipeline</div>
            <p style={{ fontSize: 11, color: '#475569', maxWidth: 200, lineHeight: 1.6 }}>
              Consulting IRPWM manuals & cross-referencing 2026 Safety Circulars...
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 240, marginTop: 8 }}>
            {['Ingestion Agent', 'Research Agent', 'Planning Agent', 'Validation Agent'].map((a, i) => (
              <motion.div key={a}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>{a}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : advice ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>SOP Validated · Safety Compliant · IRPWM §2026</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {advice.split('\n').filter(l => l.trim()).map((line, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.7, color: '#64748b' }}>{line}</p>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button style={{
              padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#fff',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}>
              <Wrench size={13} /> Work Order
            </button>
            <button style={{
              padding: '12px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#94a3b8',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Train size={13} /> Dispatch
            </button>
          </div>
        </motion.div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
          <div className="animate-float" style={{ position: 'relative', width: 60, height: 60 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16, opacity: 0.15,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            }} />
            <div className="animate-ping" style={{
              position: 'absolute', inset: 0, borderRadius: 16, opacity: 0.1,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            }} />
            <div style={{
              position: 'relative', width: '100%', height: '100%', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
              <Zap size={26} color="#818cf8" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Agentic Reasoning System</div>
            <p style={{ fontSize: 12, color: '#334155', maxWidth: 200, lineHeight: 1.6 }}>
              {alert ? 'Processing...' : 'Select an anomaly alert to invoke the RailSentry AI expert system'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 220 }}>
            {['Ingestion', 'Research', 'Planning', 'Validation'].map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e293b' }} />
                <span style={{ fontSize: 10, color: '#1e293b' }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

/* ── Dashboard ── */
const Dashboard = ({ alerts, loading, refresh }: { alerts: Alert[]; loading: boolean; refresh: () => void }) => {
  const [sel, setSel] = useState<Alert | null>(null);
  const [advice, setAdvice] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = async (a: Alert) => {
    if (sel?.id === a.id && advice) return;
    setSel(a); setAdvice(''); setAnalyzing(true);
    try {
      const r = await axios.post(`${API_BASE}/analyze`, { message: a.message });
      setAdvice(r.data.advice);
    } catch {
      setAdvice('Could not connect to backend. Run: python backend/main.py');
    } finally { setAnalyzing(false); }
  };

  const TOOLTIP_STYLE = { background: '#0f0f1e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, fontSize: 11, color: '#e2e8f0' };
  const GRID_STROKE = 'rgba(255,255,255,0.04)';
  const TICK = { fill: '#1e293b', fontSize: 10 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard label="Active Monitors" value="1,242" icon={Activity} accent="#6366f1" grad="linear-gradient(135deg,#0e0e28,#090916)" delta="+3.2%" positive />
        <StatCard label="Threats Detected" value={String(alerts.length)} icon={AlertTriangle} accent="#f43f5e" grad="linear-gradient(135deg,#1a0a10,#100810)" delta="+1" />
        <StatCard label="System Uptime" value="99.9%" icon={Wifi} accent="#10b981" grad="linear-gradient(135deg,#071a12,#040d09)" delta="+0.1%" positive />
        <StatCard label="Avg. Response" value="1.4s" icon={Clock} accent="#f59e0b" grad="linear-gradient(135deg,#1a1007,#100c05)" delta="-0.3s" positive />
      </div>

      {/* Sensor Chart */}
      <div className="premium-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>24-Hour Sensor Telemetry</div>
            <div style={{ fontSize: 11, color: '#334155' }}>Vibration · Axle Temperature · Bearing Wear</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['#6366f1', 'Vibration'], ['#f43f5e', 'Temp'], ['#10b981', 'Wear']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MOCK_SENSOR}>
            <defs>
              {[['v', '#6366f1'], ['t', '#f43f5e'], ['w', '#10b981']].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
            <XAxis dataKey="hour" tick={TICK} tickLine={false} axisLine={false} interval={3} />
            <YAxis tick={TICK} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="vibration" stroke="#6366f1" strokeWidth={2} fill="url(#v)" name="Vibration" />
            <Area type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2} fill="url(#t)" name="Temperature" />
            <Area type="monotone" dataKey="wear" stroke="#10b981" strokeWidth={2} fill="url(#w)" name="Wear" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts + Advisor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 6, borderRadius: 8, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <AlertTriangle size={14} color="#f43f5e" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Live ML Anomalies</span>
              {alerts.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e' }}>
                  {alerts.length}
                </span>
              )}
            </div>
            <button onClick={refresh} className={loading ? 'spin-slow' : ''}
              style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: '#475569' }}>
              <RefreshCw size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 540, overflowY: 'auto' }}>
            <AnimatePresence>
              {alerts.length > 0 ? alerts.map(a => (
                <AlertCard key={a.id} alert={a} selected={sel?.id === a.id} onClick={() => analyze(a)} />
              )) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <Activity size={36} color="rgba(255,255,255,0.05)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Scanning for anomalies...</p>
                  <p style={{ fontSize: 11, color: '#1e293b', marginTop: 4 }}>All systems nominal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Advisor alert={sel} advice={advice} loading={analyzing} />
      </div>

      {/* Zone Chart + Segment Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="premium-card">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Zone Monitor Distribution</div>
          <div style={{ fontSize: 11, color: '#334155', marginBottom: 18 }}>Active sensors vs active alerts per zone</div>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={ZONES} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
              <XAxis dataKey="zone" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="active" fill="#6366f1" radius={[5, 5, 0, 0]} name="Active Sensors" />
              <Bar dataKey="alerts" fill="#f43f5e" radius={[5, 5, 0, 0]} name="Active Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="premium-card">
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Segment Health Index</div>
          <div style={{ fontSize: 11, color: '#334155', marginBottom: 20 }}>Structural integrity scores — real-time</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {SEGMENT_HEALTH.map(s => (
              <div key={s.seg} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#334155', width: 52, flexShrink: 0 }}>{s.seg}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${s.val}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${s.color}99,${s.color})`, boxShadow: `0 0 8px ${s.color}60` }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', width: 30, textAlign: 'right' }}>{s.val}%</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: s.color, width: 58, textAlign: 'right' }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── App Root ── */
export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_BASE}/alerts`);
      setAlerts(r.data.alerts);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); const iv = setInterval(fetch, 5000); return () => clearInterval(iv); }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080810', position: 'relative' }}>
      {/* Ambient BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: -100, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.07),transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -200, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,63,94,0.04),transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.04),transparent 70%)' }} />
      </div>

      <Sidebar active={tab} set={setTab} collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          height: 60, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99,102,241,0.08)',
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#1e293b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input placeholder="Search assets, segments, zones..."
              style={{
                paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                width: 280, fontSize: 13, borderRadius: 12, outline: 'none',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#e2e8f0',
              }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <PulseDot />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>System Online</span>
            </div>
            <button style={{
              position: 'relative', padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: '#475569',
            }}>
              <Bell size={15} />
              {alerts.length > 0 && (
                <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 8px rgba(244,63,94,0.6)' }} />
              )}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: '0 0 14px rgba(99,102,241,0.35)' }}>
                AK
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Ankush Singh</div>
                <div style={{ fontSize: 10, color: '#1e293b' }}>Senior Engineer</div>
              </div>
              <ChevronDown size={11} color="#1e293b" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <AnimatePresence mode="wait">
            {tab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Shield size={16} color="#6366f1" />
                    <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Operations Dashboard</h1>
                  </div>
                  <p style={{ fontSize: 11, color: '#1e293b', paddingLeft: 24 }}>Real-time Indian Railway asset health monitoring · AI-powered anomaly detection</p>
                </div>
                <Dashboard alerts={alerts} loading={loading} refresh={fetch} />
              </motion.div>
            )}
            {tab === 'history' && (
              <motion.div key="hist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <History size={42} color="rgba(99,102,241,0.15)" style={{ marginBottom: 14 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Historical Logs</div>
                <p style={{ fontSize: 13, color: '#334155' }}>Connect to the backend to view historical anomaly data.</p>
              </motion.div>
            )}
            {tab === 'zones' && (
              <motion.div key="zones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Zone Monitor</h1>
                  <p style={{ fontSize: 11, color: '#1e293b' }}>Geographic zone health and sensor distribution</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                  {ZONES.map(z => (
                    <div key={z.zone} className="premium-card" style={{ border: `1px solid ${z.c}15` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{z.zone}</span>
                        <PulseDot color={z.c} />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{z.active}</div>
                      <p style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>Active Sensors</p>
                      <p style={{ fontSize: 11, fontWeight: 600, marginTop: 12, color: z.c }}>
                        {z.alerts > 0 ? `⚠ ${z.alerts} alert${z.alerts > 1 ? 's' : ''}` : '✓ All Clear'}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {tab === 'alerts' && (
              <motion.div key="alrts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <Bell size={42} color="rgba(244,63,94,0.15)" style={{ marginBottom: 14 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Alert Center</div>
                <p style={{ fontSize: 13, color: '#334155' }}>Priority-queued alert management — coming soon.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
