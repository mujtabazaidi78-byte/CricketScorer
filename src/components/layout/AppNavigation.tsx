import React from 'react';
import { useCricketStore } from '../../store/cricketStore';
import {
  LayoutDashboard,
  Radio,
  Trophy,
  Shield,
  Users,
  BarChart3,
} from 'lucide-react';

export const AppNavigation: React.FC = () => {
  const activeTab = useCricketStore((state) => state.activeTab);
  const setActiveTab = useCricketStore((state) => state.setActiveTab);
  const matches = useCricketStore((state) => state.matches);
  const activeMatchId = useCricketStore((state) => state.activeMatchId);
  const deviceMode = useCricketStore((state) => state.deviceMode);

  const isLiveActive = matches.some((m) => m.id === activeMatchId && m.status === 'Live');

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'live' as const,
      label: 'Live Match',
      icon: Radio,
      badge: isLiveActive ? 'LIVE' : undefined,
    },
    {
      id: 'tournaments' as const,
      label: 'Tournaments',
      icon: Trophy,
    },
    {
      id: 'teams' as const,
      label: 'Teams',
      icon: Shield,
    },
    {
      id: 'players' as const,
      label: 'Players',
      icon: Users,
    },
    {
      id: 'stats' as const,
      label: 'Stats & Rank',
      icon: BarChart3,
    },
  ];

  // If in Phone mockup mode, render only the bottom navigation bar, solidly pinned at bottom
  if (deviceMode === 'phone') {
    return (
      <nav className="sticky bottom-0 z-40 bg-[#000000] border-t border-[#2a2a2e] px-1 py-1.5 flex items-center justify-around select-none w-full shrink-0 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1 rounded-xl transition relative touch-active ${
                isActive ? 'text-[#00c853]' : 'text-[#909090] hover:text-[#e0e0e0]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00c853] stroke-[2.2]' : 'text-[#909090]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-[#ff5252] ring-2 ring-[#000000] animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-[#00c853]' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-[#00c853] absolute bottom-0 shadow-[0_0_6px_#00c853]" />
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {/* Desktop / Tablet Sidebar Navigation - permanently fixed/sticky on left */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 border-r border-[#2a2a2e] bg-[#000000] p-3 shrink-0 select-none sticky top-0 h-full overflow-y-auto z-40">
        <div className="text-xs font-bold tracking-widest text-[#909090] uppercase px-3 mb-3">
          Cricket Console
        </div>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#00c85311] text-[#00c853] border-l-2 border-[#00c853] font-bold'
                    : 'text-[#909090] hover:text-[#00c853] hover:bg-[#1a1d23] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00c853]' : 'text-[#909090]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-[#d5000022] text-[#ff5252] border border-[#d5000044] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Cricket Quick Fact / Status card */}
        <div className="mt-auto pt-4 border-t border-[#2a2a2e] text-xs text-[#909090] px-1">
          <div className="bg-[#1a1d23] rounded-xl p-3 border border-[#2a2a2e] space-y-1.5">
            <div className="flex items-center gap-2 text-[#e0e0e0] font-semibold text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00c853] shadow-[0_0_6px_#00c853]" />
              <span>Real-time Scoring</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#909090]">
              Automated bowling overs, dynamic strike rotation, and DLS calculations.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Touch-Friendly Android Bottom Navigation Bar - permanently fixed at viewport bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#000000]/95 backdrop-blur-md border-t border-[#2a2a2e] px-2 py-1.5 flex items-center justify-around select-none shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-xl transition relative touch-active ${
                isActive ? 'text-[#00c853]' : 'text-[#909090] hover:text-[#e0e0e0]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00c853] stroke-[2.2]' : 'text-[#909090]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-[#ff5252] ring-2 ring-[#000000] animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-[#00c853]' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-[#00c853] absolute bottom-0 shadow-[0_0_6px_#00c853]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
