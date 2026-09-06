import React from 'react';
import { useCricketStore } from './store/cricketStore';
import { AppHeader } from './components/layout/AppHeader';
import { AppNavigation } from './components/layout/AppNavigation';
import { ToastContainer } from './components/ui/ToastContainer';
import { CricketDashboard } from './components/dashboard/CricketDashboard';
import { LiveMatchView } from './components/scoring/LiveMatchView';
import { TournamentManagementView } from './components/tournaments/TournamentManagementView';
import { TeamManagementView } from './components/teams/TeamManagementView';
import { PlayerManagementView } from './components/players/PlayerManagementView';
import { StatsDashboardView } from './components/stats/StatsDashboardView';

export default function App() {
  const activeTab = useCricketStore((state) => state.activeTab);
  const deviceMode = useCricketStore((state) => state.deviceMode);

  // Render current view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CricketDashboard />;
      case 'live':
        return <LiveMatchView />;
      case 'tournaments':
        return <TournamentManagementView />;
      case 'teams':
        return <TeamManagementView />;
      case 'players':
        return <PlayerManagementView />;
      case 'stats':
        return <StatsDashboardView />;
      default:
        return <CricketDashboard />;
    }
  };

  // Wrapper based on device mode
  if (deviceMode === 'phone') {
    return (
      <div className="h-screen max-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center sm:p-2 md:p-4 font-sans antialiased text-[#e0e0e0] overflow-hidden">
        <ToastContainer />
        {/* Simulated Android Phone Frame */}
        <div className="w-full sm:max-w-[420px] bg-[#000000] border-0 sm:border-8 sm:border-[#2a2a2e] rounded-none sm:rounded-[44px] shadow-2xl shadow-black overflow-hidden flex flex-col h-full sm:h-[860px] max-h-screen relative">
          {/* Front Camera Pinhole for Android */}
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black ring-1 ring-[#2a2a2e] z-50 pointer-events-none" />

          {/* App Header (Fixed at top) */}
          <AppHeader />

          {/* Body Content - only this area scrolls */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0f1115] relative">
            <main className="flex-1 overflow-y-auto p-3.5 pb-4">
              {renderActiveView()}
            </main>
          </div>

          {/* Bottom App Navigation for Phone (Fixed at bottom) */}
          <AppNavigation />

          {/* Android Gesture Navigation Pill Indicator */}
          <div className="hidden sm:flex items-center justify-center pb-1.5 pt-0.5 bg-[#000000] select-none pointer-events-none z-40 shrink-0">
            <div className="w-28 h-1 rounded-full bg-[#2a2a2e]" />
          </div>
        </div>
      </div>
    );
  }

  if (deviceMode === 'tablet') {
    return (
      <div className="h-screen max-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center sm:p-2 md:p-4 font-sans antialiased text-[#e0e0e0] overflow-hidden">
        <ToastContainer />
        {/* Simulated Android Tablet Frame */}
        <div className="w-full max-w-[860px] bg-[#000000] border-0 sm:border-8 sm:border-[#2a2a2e] rounded-none sm:rounded-[36px] shadow-2xl shadow-black overflow-hidden flex flex-col h-full sm:h-[800px] max-h-screen relative">
          {/* Tablet Front Camera */}
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black ring-1 ring-[#2a2a2e] z-50 pointer-events-none" />

          <AppHeader />

          {/* Layout with sidebar for Tablet */}
          <div className="flex-1 flex overflow-hidden bg-[#0f1115] relative">
            <AppNavigation />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-6">
              {renderActiveView()}
            </main>
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="hidden sm:flex items-center justify-center pb-2 pt-1 bg-[#000000] select-none pointer-events-none z-40 shrink-0">
            <div className="w-36 h-1 rounded-full bg-[#2a2a2e]" />
          </div>
        </div>
      </div>
    );
  }

  // Fluid Full Viewport Mode
  return (
    <div className="h-screen max-h-screen bg-[#0a0a0c] flex flex-col font-sans antialiased text-[#e0e0e0] overflow-hidden">
      <ToastContainer />
      <AppHeader />

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto relative">
        <AppNavigation />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 md:pb-6 bg-[#0a0a0c]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
