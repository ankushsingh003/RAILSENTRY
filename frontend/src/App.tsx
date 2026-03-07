import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  LayoutDashboard,
  History,
  Settings,
  Search,
  ChevronRight,
  Zap,
  Clock,
  MapPin,
  Wrench,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

interface Alert {
  id: number;
  message: string;
  timestamp: string;
}

const App: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/alerts`);
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const analyzeAlert = async (alert: Alert) => {
    setSelectedAlert(alert);
    setAdvice('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/analyze`, { message: alert.message });
      setAdvice(response.data.advice);
    } catch (error) {
      setAdvice("Error: Unable to connect to the Reasoning Engine. Ensure the backend is running and GOOGLE_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col glass z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-accent/20 p-2 rounded-lg">
            <ShieldCheck className="text-accent w-8 h-8" />
          </div>
          <span className="font-bold text-xl tracking-tight">KAVACH AI</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-accent/10 text-accent border border-accent/20' : 'hover:bg-card-hover text-text-muted'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-accent/10 text-accent border border-accent/20' : 'hover:bg-card-hover text-text-muted'}`}
          >
            <History size={20} />
            <span className="font-medium">Historical Logs</span>
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-card-hover text-text-muted transition-all">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-danger/5 blur-[100px] -z-10 rounded-full" />

        <header className="h-20 border-b border-border flex items-center justify-between px-8 glass z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                placeholder="Search assets..."
                className="bg-secondary border border-border rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-accent transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full text-xs font-semibold border border-success/20">
              <Zap size={14} fill="currentColor" />
              System Online
            </div>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">AK</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Active Monitors', value: '1,242', icon: Activity, color: 'text-accent', bg: 'bg-accent/10' },
                { label: 'Threats Detected', value: alerts.length.toString(), icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
                { label: 'Uptime', value: '99.9%', icon: Clock, color: 'text-success', bg: 'bg-success/10' },
              ].map((stat, i) => (
                <div key={i} className="premium-card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted mb-1 font-medium">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Alert Feed */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <AlertTriangle className="text-danger" size={24} />
                    Live ML Anomalies
                  </h2>
                  <span className="text-xs text-text-muted">Auto-refreshing every 5s</span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`premium-card cursor-pointer !p-0 overflow-hidden group ${selectedAlert?.id === alert.id ? 'border-accent ring-1 ring-accent/20' : ''}`}
                          onClick={() => analyzeAlert(alert)}
                        >
                          <div className="p-5 flex gap-4">
                            <div className="bg-danger/10 text-danger p-3 h-fit rounded-xl">
                              <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${alert.message.includes('High') ? 'text-danger' : 'text-warning'}`}>
                                  CRITICAL OVERRIDE
                                </span>
                                <span className="text-[10px] text-text-muted font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm font-medium leading-relaxed mb-3">
                                {alert.message.replace('[', '').replace(']', '')}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] bg-secondary px-2 py-1 rounded-md text-text-muted flex items-center gap-1">
                                  <MapPin size={8} /> Segment {alert.message.split('Segment-')[1]?.split(',')[0]}
                                </span>
                                <span className="text-[10px] bg-secondary px-2 py-1 rounded-md text-text-muted flex items-center gap-1">
                                  <Wrench size={8} /> Maintenance Required
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-text-muted self-center group-hover:translate-x-1 transition-transform" />
                          </div>
                          {selectedAlert?.id === alert.id && (
                            <motion.div
                              layoutId="active-indicator"
                              className="h-1 bg-accent w-full"
                            />
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-secondary/30 rounded-2xl border border-dashed border-border">
                        <Activity className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                        <p className="text-text-muted font-medium">Scanning for track anomalies...</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* AI Advice Panel */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bot className="text-accent" size={24} />
                    Intelligent Advisor
                  </h2>
                </div>

                <div className="premium-card min-h-[500px] flex flex-col relative overflow-hidden">
                  {/* Decorative background for the AI panel */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -z-10 rounded-full" />

                  {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-6"
                      >
                        <ShieldCheck className="text-accent w-12 h-12" />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2">Deploying Reasoning Agents</h3>
                      <p className="text-text-muted text-sm max-w-[280px]">Consulting Technical Manuals (IRPWM) and verifying safety protocols...</p>
                    </div>
                  ) : advice ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="bg-success/5 border-b border-success/10 p-4 mb-6 -mx-6 -mt-6">
                        <div className="flex items-center gap-2 text-success">
                          <ShieldCheck size={18} />
                          <span className="text-sm font-bold tracking-wide uppercase">Official Repair SOP Validated</span>
                        </div>
                      </div>

                      <div className="space-y-6 prose prose-invert max-w-none prose-sm">
                        {advice.split('\n').map((line, i) => (
                          <p key={i} className="text-sm leading-relaxed text-text">
                            {line}
                          </p>
                        ))}
                      </div>

                      <div className="mt-auto pt-6 flex items-center gap-4 border-t border-border">
                        <button className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-accent/20">
                          Generate Work Order
                        </button>
                        <button className="flex-1 bg-secondary hover:bg-card-hover border border-border text-text font-bold py-3 rounded-xl transition-all">
                          Dispatch Team
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-text-muted">
                      <div className="bg-secondary p-6 rounded-3xl mb-6">
                        <Zap size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-text mb-2">Agentic Reasoning System</h3>
                      <p className="text-sm max-w-[250px]">Select an anomaly alert to invoke the Kavach AI expert system for repairs & compliance.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
