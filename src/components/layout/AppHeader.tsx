import React, { useState, useEffect } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import {
  Smartphone,
  Tablet,
  Maximize2,
  ShieldCheck,
  RotateCcw,
  Wifi,
  BatteryMedium,
  Trash2,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const deviceMode = useCricketStore((state) => state.deviceMode);
  const setDeviceMode = useCricketStore((state) => state.setDeviceMode);
  const activeMatchId = useCricketStore((state) => state.activeMatchId);
  const matches = useCricketStore((state) => state.matches);
  const setActiveTab = useCricketStore((state) => state.setActiveTab);
  const adminMode = useCricketStore((state) => state.adminMode);
  const setAdminMode = useCricketStore((state) => state.setAdminMode);
  const resetToSampleData = useCricketStore((state) => state.resetToSampleData);
  const clearAllMockData = useCricketStore((state) => state.clearAllMockData);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const activeLiveMatch = matches.find((m) => m.id === activeMatchId && m.status === 'Live');

  // One-time cleanup of legacy mock storage from previous iterations
  useEffect(() => {
    try {
      if (localStorage.getItem('cricpro-android-storage-v1')) {
        localStorage.removeItem('cricpro-android-storage-v1');
      }
    } catch {
      // ignore
    }
  }, []);

  // Simulated Android status bar clock
  const [currentTime, setCurrentTime] = useState('23:18');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#2a2a2e] bg-[#121216] sticky top-0 z-40">
      {/* Android System Bar Simulation when in Phone or Tablet mockup mode */}
      {deviceMode !== 'fluid' && (
        <div className="bg-[#000000] px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-mono-num flex items-center justify-between text-[#909090] border-b border-[#2a2a2e] select-none">
          <div className="flex items-center gap-1.5 text-[#e0e0e0] font-semibold">
            <span>{currentTime}</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-[#00c85311] text-[#00c853] border border-[#00c85333]">5G</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-3.5 h-3.5 text-[#00c853]" />
            <span>94%</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center gap-y-2 gap-x-2 sm:gap-3">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0 min-w-0"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00c853] rounded-xl flex items-center justify-center shadow-lg shadow-[#00c85333] shrink-0">
            <span className="font-display font-black text-sm sm:text-lg text-black tracking-tight">CP</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-display font-bold text-sm sm:text-lg tracking-wider text-white flex items-center gap-1 whitespace-nowrap">
                CRIC<span className="text-[#00c853]">PRO</span>
              </h1>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#00c85311] text-[#00c853] border border-[#00c85333]">
                Android
              </span>
            </div>
            <p className="text-[11px] text-[#909090] hidden md:block">Tournament & Live Match Scoring Engine</p>
          </div>
        </div>

        {/* Live Match Alert Chip */}
        {activeLiveMatch && (
          <button
            onClick={() => setActiveTab('live')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#d5000022] text-[#ff5252] text-[10px] sm:text-xs font-bold rounded-full border border-[#d5000044] hover:bg-[#d5000033] transition shrink-0 order-3 sm:order-none"
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ff5252] animate-pulse" />
            <span>LIVE NOW</span>
          </button>
        )}

        {/* Action Controls & Device Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap ml-auto justify-end order-2 sm:order-none">
          {/* Admin Mode Toggle */}
          <button
            id="admin-mode-toggle"
            onClick={() => setAdminMode(!adminMode)}
            title="Toggle Admin Recalculate/Edit Mode"
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 ${
              adminMode
                ? 'bg-[#ffab0022] border-[#ffab0044] text-[#ffab00]'
                : 'bg-[#1a1d23] border-[#2a2a2e] text-[#909090] hover:text-[#e0e0e0] hover:bg-[#25282e]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin Mode</span>
          </button>

          {/* Device Mockup Switcher (Optimized for Android Phone & Tablet) */}
          <div className="flex items-center bg-[#1a1d23] border border-[#2a2a2e] rounded-lg p-0.5 shrink-0">
            <button
              id="device-mode-phone"
              onClick={() => setDeviceMode('phone')}
              title="Android Phone Viewport (390px)"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                deviceMode === 'phone'
                  ? 'bg-[#00c853] text-black font-bold shadow-sm'
                  : 'text-[#909090] hover:text-[#e0e0e0]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Phone</span>
            </button>

            <button
              id="device-mode-tablet"
              onClick={() => setDeviceMode('tablet')}
              title="Android Tablet Viewport (768px)"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                deviceMode === 'tablet'
                  ? 'bg-[#00c853] text-black font-bold shadow-sm'
                  : 'text-[#909090] hover:text-[#e0e0e0]'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Tablet</span>
            </button>

            <button
              id="device-mode-fluid"
              onClick={() => setDeviceMode('fluid')}
              title="Fluid Full Screen View"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition ${
                deviceMode === 'fluid'
                  ? 'bg-[#00c853] text-black font-bold shadow-sm'
                  : 'text-[#909090] hover:text-[#e0e0e0]'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Fluid</span>
            </button>
          </div>

          {/* Clear UI / Wipe Data Button */}
          <button
            onClick={() => setShowClearConfirm(true)}
            title="Clear UI: Remove all mock and test data"
            className="p-1.5 rounded-lg bg-[#1a1d23] border border-[#2a2a2e] text-[#909090] hover:text-[#ff5252] hover:bg-[#ff525218] transition flex items-center gap-1 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px] font-semibold">Clear Data</span>
          </button>

          {/* Admin only: Reset to sample demo data */}
          {adminMode && (
            <button
              onClick={resetToSampleData}
              title="Load demo tournaments, teams & sample match (Admin only)"
              className="p-1.5 rounded-lg bg-[#1a1d23] border border-[#ffab0044] text-[#ffab00] hover:bg-[#ffab0022] transition flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Load Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal to Clear Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#ff5252]">
              <div className="w-10 h-10 rounded-xl bg-[#ff525222] border border-[#ff525244] flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Clear All Data?</h3>
                <p className="text-xs text-[#909090]">Start with a fresh, clean UI</p>
              </div>
            </div>

            <p className="text-xs text-[#b0b0b0] leading-relaxed">
              This will remove all matches, tournaments, teams, and players, giving you a completely clean slate.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#909090] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllMockData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#ff5252] hover:bg-[#e04545] text-white text-xs font-bold shadow-md transition"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};