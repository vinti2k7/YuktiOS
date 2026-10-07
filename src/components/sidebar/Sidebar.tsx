import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavTab } from '../Navigation';
import {
  LayoutDashboard,
  IndianRupee,
  Boxes,
  Users,
  Megaphone,
  Headphones,
  BarChart3,
  Bot,
  Zap,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Settings,
  Activity,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unresolvedAnomaliesCount: number;
  onOpenAskAI?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unresolvedAnomaliesCount,
  onOpenAskAI,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainNav = [
    { id: 'dashboard' as NavTab, label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'blueprint' as NavTab, label: 'AI Command Center', icon: Zap },
  ];

  const agentNav = [
    { id: 'finance' as NavTab, label: 'Finance Agent', icon: IndianRupee, tag: 'GST & Cash' },
    { id: 'inventory' as NavTab, label: 'Inventory Agent', icon: Boxes, tag: 'Demand' },
    { id: 'hr' as NavTab, label: 'HR Agent', icon: Users, tag: 'Payroll' },
    { id: 'marketing' as NavTab, label: 'Marketing Agent', icon: Megaphone, tag: 'RFM Copy' },
    { id: 'support' as NavTab, label: 'Support Agent', icon: Headphones, tag: 'RAG FAQ' },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics Agent',
      icon: BarChart3,
      badge: unresolvedAnomaliesCount > 0 ? `${unresolvedAnomaliesCount}` : undefined,
      tag: 'Roadmap',
    },
  ];

  const platformNav = [
    { id: 'automation', label: 'Automation', icon: SlidersHorizontal, tab: 'blueprint' as NavTab },
    { id: 'analytics_reports', label: 'Analytics & Reports', icon: Activity, tab: 'analytics' as NavTab },
    { id: 'help', label: 'Help & Knowledge', icon: HelpCircle, tab: 'help' as NavTab },
    { id: 'settings', label: 'Settings', icon: Settings, tab: 'dashboard' as NavTab },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 border-r border-slate-800 w-[260px] shrink-0 select-none overflow-hidden">
      
      {/* Fixed Top Brand Header */}
      <div className="p-4 border-b border-slate-800 shrink-0 bg-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white">
                  YuktiOS
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise AI System</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Navigation Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        
        {/* Core Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.label}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* AI Assistant Drawer Trigger */}
          {onOpenAskAI && (
            <button
              onClick={() => {
                onOpenAskAI();
                setIsMobileOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors mt-1"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Assistant</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                Ask
              </span>
            </button>
          )}
        </div>

        {/* AI AGENTS Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Domain Agents
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <div className="space-y-1">
            {agentNav.map((agent) => {
              const Icon = agent.icon;
              const isActive = activeTab === agent.id;
              return (
                <button
                  key={agent.label}
                  onClick={() => handleTabClick(agent.id)}
                  className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{agent.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {agent.badge ? (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {agent.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {agent.tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PLATFORM Section */}
        <div>
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Platform & Tools
            </span>
          </div>

          <div className="space-y-1">
            {platformNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.tab)}
                  className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Fixed Bottom Footer (System Health + User Profile) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0 space-y-2">
        
        {/* System Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              System Status
            </span>
            <span className="font-mono text-emerald-400 text-[10px]">
              92 / 100
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[92%] rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>6 Agents Operational</span>
          </p>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
            R
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate leading-tight">Rohan</h4>
            <p className="text-[10px] text-slate-400 truncate leading-tight">Business Owner</p>
          </div>
        </div>

      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed 100vh Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl shadow-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
