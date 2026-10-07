import React from 'react';
import {
  LayoutDashboard,
  IndianRupee,
  Boxes,
  Users,
  Megaphone,
  Headphones,
  BarChart3,
  Bot,
  HelpCircle
} from 'lucide-react';

export type NavTab = 'dashboard' | 'finance' | 'inventory' | 'hr' | 'marketing' | 'support' | 'blueprint' | 'analytics' | 'help';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unresolvedAnomaliesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unresolvedAnomaliesCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<any>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Finance', icon: IndianRupee },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'hr', label: 'HR & Payroll', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'blueprint', label: 'AI Operations', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: unresolvedAnomaliesCount > 0 ? `${unresolvedAnomaliesCount}` : undefined },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <nav className="bg-slate-900/60 border-b border-slate-800/80 sticky top-[53px] z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto no-scrollbar space-x-1 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                id={`nav-tab-${tab.id}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-0.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

