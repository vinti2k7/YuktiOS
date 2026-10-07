import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { 
  Sparkles, 
  ShoppingBag, 
  ShieldAlert,
  Calendar,
  Clock,
  UserCheck,
  HelpCircle,
  LogOut,
  LogIn
} from 'lucide-react';
import { PublicUserInfo } from '../types/authTypes';

interface HeaderProps {
  businessName: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenQuickSale: () => void;
  onOpenAskAI: () => void;
  unresolvedAnomaliesCount: number;
  currentUser?: PublicUserInfo | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  businessName,
  currentRole,
  onRoleChange,
  onOpenQuickSale,
  onOpenAskAI,
  unresolvedAnomaliesCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenHelp,
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateString(now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'owner', label: 'Owner View' },
    { value: 'finance_manager', label: 'Finance View' },
    { value: 'inventory_head', label: 'Inventory View' },
    { value: 'hr_admin', label: 'HR View' },
    { value: 'support_agent', label: 'Support View' },
  ];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Business Title & Status */}
        <div className="flex items-center gap-3 pl-8 lg:pl-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white tracking-tight">
                {currentUser?.businessName || businessName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="System Operational" />
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Operations • {dateString}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeString || 'Live'}</span>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-xs"
              id="role-selector"
              aria-label="Select role view"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-900 text-slate-200">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Help Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              id="btn-header-help"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Help & Documentation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Help</span>
            </button>
          )}

          {/* Quick POS Sale */}
          <button
            onClick={onOpenQuickSale}
            id="btn-quick-sale"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            title="Log Quick POS Transaction"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>POS Sale</span>
          </button>

          {/* Ask AI Trigger (Clean Solid Primary) */}
          <button
            onClick={onOpenAskAI}
            id="btn-ask-yuktios"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Ask Assistant</span>
          </button>

          {/* Anomaly Badge if any */}
          {unresolvedAnomaliesCount > 0 && (
            <div className="flex items-center gap-1 text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{unresolvedAnomaliesCount} alerts</span>
            </div>
          )}

          {/* User Auth */}
          {currentUser ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

