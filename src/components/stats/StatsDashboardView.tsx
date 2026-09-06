import React, { useState } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { PlayerStats } from '../../types';
import {
  BarChart3,
  Trophy,
  Flame,
  Award,
  ArrowUpDown,
  Edit2,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  X,
  Zap,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Info,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const StatsDashboardView: React.FC = () => {
  const getAllPlayersStats = useCricketStore((state) => state.getAllPlayersStats);
  const tournaments = useCricketStore((state) => state.tournaments);
  const adminMode = useCricketStore((state) => state.adminMode);
  const setAdminMode = useCricketStore((state) => state.setAdminMode);
  const adminOverridePlayerStats = useCricketStore((state) => state.adminOverridePlayerStats);
  const recalculateAllStats = useCricketStore((state) => state.recalculateAllStats);
  const setSelectedPlayerForModal = useCricketStore((state) => state.setSelectedPlayerForModal);
  const players = useCricketStore((state) => state.players);
  const clearAllStats = useCricketStore((state) => state.clearAllStats);
  const clearTournamentStats = useCricketStore((state) => state.clearTournamentStats);
  const resetPlayerStats = useCricketStore((state) => state.resetPlayerStats);

  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting');
  const [tournamentFilter, setTournamentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting
  const [battingSortField, setBattingSortField] = useState<'runs' | 'highScore' | 'average' | 'strikeRate'>('runs');
  const [bowlingSortField, setBowlingSortField] = useState<'wickets' | 'economyRate' | 'average'>('wickets');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Admin edit modal
  const [editingStat, setEditingStat] = useState<PlayerStats | null>(null);
  const [editRuns, setEditRuns] = useState(0);
  const [editWickets, setEditWickets] = useState(0);
  const [editFours, setEditFours] = useState(0);
  const [editSixes, setEditSixes] = useState(0);

  // Deletion modals
  const [showDeleteStatsModal, setShowDeleteStatsModal] = useState(false);
  const [playerToReset, setPlayerToReset] = useState<PlayerStats | null>(null);

  // Glossary accordion
  const [showGlossary, setShowGlossary] = useState(true);

  const allStats = getAllPlayersStats(tournamentFilter === 'all' ? undefined : tournamentFilter);

  // Filter by search
  const filteredStats = allStats.filter((stat) => {
    if (searchQuery.trim() && !stat.playerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Sorted batting list
  const sortedBatting = [...filteredStats].sort((a, b) => {
    let diff = 0;
    if (battingSortField === 'runs') diff = b.batting.runs - a.batting.runs;
    else if (battingSortField === 'highScore') diff = b.batting.highScore - a.batting.highScore;
    else if (battingSortField === 'average') diff = b.batting.average - a.batting.average;
    else if (battingSortField === 'strikeRate') diff = b.batting.strikeRate - a.batting.strikeRate;
    return sortOrder === 'desc' ? diff : -diff;
  });

  // Sorted bowling list
  const sortedBowling = [...filteredStats].sort((a, b) => {
    let diff = 0;
    if (bowlingSortField === 'wickets') diff = b.bowling.wickets - a.bowling.wickets;
    else if (bowlingSortField === 'economyRate') diff = a.bowling.economyRate - b.bowling.economyRate; // lower economy is better
    else if (bowlingSortField === 'average') diff = a.bowling.average - b.bowling.average;
    return sortOrder === 'desc' ? diff : -diff;
  });

  const toggleBatSort = (field: 'runs' | 'highScore' | 'average' | 'strikeRate') => {
    if (battingSortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setBattingSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleBowlSort = (field: 'wickets' | 'economyRate' | 'average') => {
    if (bowlingSortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setBowlingSortField(field);
      setSortOrder('desc');
    }
  };

  const handleOpenAdminEdit = (stat: PlayerStats) => {
    setEditingStat(stat);
    setEditRuns(stat.batting.runs);
    setEditWickets(stat.bowling.wickets);
    setEditFours(stat.batting.fours);
    setEditSixes(stat.batting.sixes);
  };

  const handleSaveAdminEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStat) return;
    adminOverridePlayerStats(editingStat.playerId, {
      runs: editRuns,
      wickets: editWickets,
      fours: editFours,
      sixes: editSixes,
    });
    setEditingStat(null);
  };

  const handleClearAll = () => {
    clearAllStats();
    setShowDeleteStatsModal(false);
  };

  const handleClearTournament = () => {
    if (tournamentFilter !== 'all') {
      clearTournamentStats(tournamentFilter);
    }
    setShowDeleteStatsModal(false);
  };

  // Top run scorer & top wicket taker
  const topRunScorer = [...allStats].sort((a, b) => b.batting.runs - a.batting.runs)[0];
  const topWicketTaker = [...allStats].sort((a, b) => b.bowling.wickets - a.bowling.wickets)[0];

  const selectedTournamentObj = tournaments.find((t) => t.id === tournamentFilter);

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121418] p-4 rounded-2xl border border-[#2a2a2e] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#00c853]" />
            <h2 className="text-xl font-bold font-display text-white">
              Statistics & Leaderboards
            </h2>
          </div>
          <p className="text-xs text-[#909090] mt-0.5">
            Automated ball-by-ball aggregation. Tournament rankings and individual career records.
          </p>
        </div>

        {/* Toolbar: Delete Stats, Recalculate, and Admin Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Delete / Reset Stats Button */}
          <button
            onClick={() => setShowDeleteStatsModal(true)}
            title="Delete or reset cricket statistics"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#0f1115] border border-[#d5000044] text-[#ff5252] hover:bg-[#d5000022] flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete / Reset Stats</span>
          </button>

          {adminMode && (
            <button
              onClick={recalculateAllStats}
              title="Rescan and re-aggregate all ball timelines"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#0f1115] border border-[#ffab0044] text-[#ffab00] hover:bg-[#1a1d23] flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rescan Data</span>
            </button>
          )}

          <button
            onClick={() => setAdminMode(!adminMode)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              adminMode
                ? 'bg-[#ffab0022] border-[#ffab00] text-[#ffab00]'
                : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{adminMode ? 'Admin Mode (Active)' : 'Admin Mode'}</span>
          </button>
        </div>
      </div>

      {/* Admin Mode notice if toggled */}
      {adminMode && (
        <div className="bg-[#ffab0018] border border-[#ffab0033] p-3 rounded-2xl flex items-center justify-between text-xs text-[#ffab00]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#ffab00] shrink-0" />
            <span>
              <strong>Admin Mode Enabled:</strong> You can edit numbers directly or reset individual player stats using the action buttons in the tables below.
            </span>
          </div>
        </div>
      )}

      {/* Leaders Spotlight Cards (Top Run Scorer & Top Wicket Taker) - Clearly Labeled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Orange Cap: Top Run Scorer */}
        <div className="bg-gradient-to-br from-[#ffab0018] via-[#121418] to-[#0a0a0c] p-4 rounded-2xl border border-[#ffab0033] shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ffab0022] text-[#ffab00] flex items-center justify-center font-display font-black text-2xl border border-[#ffab0044] shrink-0">
                🏏
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#ffab00] block">
                  Leading Run Scorer (Orange Cap)
                </span>
                <h3 className="font-display font-bold text-base text-white">
                  {topRunScorer?.playerName || 'No data recorded'}
                </h3>
                <span className="text-xs text-[#909090] font-medium">
                  Team: {topRunScorer?.teamName || '—'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#909090] block">
                Total Runs
              </span>
              <span className="font-display font-black text-2xl text-[#ffab00] font-mono-num">
                {topRunScorer?.batting.runs || 0}
              </span>
            </div>
          </div>

          {/* Detailed Stat Badges with Explicit Labels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2a2a2e]/60 text-xs">
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Batting Average</span>
              <span className="font-mono-num font-bold text-white text-xs">
                {topRunScorer?.batting.average || 0}
              </span>
            </div>
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Strike Rate</span>
              <span className="font-mono-num font-bold text-[#00c853] text-xs">
                {topRunScorer?.batting.strikeRate || 0}
              </span>
            </div>
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Innings Batted</span>
              <span className="font-mono-num font-bold text-white text-xs">
                {topRunScorer?.batting.innings || 0}
              </span>
            </div>
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Boundaries (4s/6s)</span>
              <span className="font-mono-num font-bold text-[#ffab00] text-xs">
                {topRunScorer?.batting.fours || 0} / {topRunScorer?.batting.sixes || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Purple Cap: Top Wicket Taker */}
        <div className="bg-gradient-to-br from-[#b388ff18] via-[#121418] to-[#0a0a0c] p-4 rounded-2xl border border-[#b388ff33] shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#b388ff22] text-[#b388ff] flex items-center justify-center font-display font-black text-2xl border border-[#b388ff44] shrink-0">
                ⚡
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#b388ff] block">
                  Leading Wicket Taker (Purple Cap)
                </span>
                <h3 className="font-display font-bold text-base text-white">
                  {topWicketTaker?.playerName || 'No data recorded'}
                </h3>
                <span className="text-xs text-[#909090] font-medium">
                  Team: {topWicketTaker?.teamName || '—'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#909090] block">
                Total Wickets
              </span>
              <span className="font-display font-black text-2xl text-[#b388ff] font-mono-num">
                {topWicketTaker?.bowling.wickets || 0}
              </span>
            </div>
          </div>

          {/* Detailed Stat Badges with Explicit Labels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#2a2a2e]/60 text-xs">
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Economy Rate</span>
              <span className="font-mono-num font-bold text-[#00c853] text-xs">
                {topWicketTaker?.bowling.economyRate || 0} RPO
              </span>
            </div>
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Best Bowling (BBI)</span>
              <span className="font-mono-num font-bold text-white text-xs">
                {topWicketTaker?.bowling.bestBowlingFigures !== '0/0' ? topWicketTaker?.bowling.bestBowlingFigures : '—'}
              </span>
            </div>
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Overs Bowled</span>
              <span className="font-mono-num font-bold text-white text-xs">
                {topWicketTaker?.bowling.oversFormatted || '0.0'} Ov
              </span>
            </div>
            <div className="bg-[#0f1115]/80 p-2 rounded-xl border border-[#2a2a2e]">
              <span className="text-[10px] text-[#909090] block">Bowling Average</span>
              <span className="font-mono-num font-bold text-[#b388ff] text-xs">
                {topWicketTaker?.bowling.average || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Selectors with Explicit Labels */}
      <div className="bg-[#121418] p-3.5 rounded-2xl border border-[#2a2a2e] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0f1115] p-1 rounded-xl border border-[#2a2a2e]">
          <button
            onClick={() => setActiveTab('batting')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'batting'
                ? 'bg-[#00c853] text-black shadow-sm'
                : 'text-[#909090] hover:text-white'
            }`}
          >
            <span>Batting Statistics</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${activeTab === 'batting' ? 'bg-black/20 text-black' : 'bg-[#2a2a2e] text-[#909090]'}`}>
              {sortedBatting.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bowling')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'bowling'
                ? 'bg-[#00c853] text-black shadow-sm'
                : 'text-[#909090] hover:text-white'
            }`}
          >
            <span>Bowling Statistics</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${activeTab === 'bowling' ? 'bg-black/20 text-black' : 'bg-[#2a2a2e] text-[#909090]'}`}>
              {sortedBowling.length}
            </span>
          </button>
        </div>

        {/* Filter Controls with Labels */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tournament filter dropdown with explicit label */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="tournament-select" className="text-xs font-semibold text-[#909090] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#00c853]" />
              <span>Tournament:</span>
            </label>
            <select
              id="tournament-select"
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-[#e0e0e0] focus:outline-none focus:border-[#00c853]"
            >
              <option value="all">All Tournaments & Career</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search box with explicit icon and label */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#909090] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              aria-label="Search by player name"
              placeholder="Search player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white placeholder-[#606060] focus:outline-none focus:border-[#00c853]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#909090] hover:text-white"
                title="Clear search query"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Player Count Tag */}
          <span className="text-[11px] font-medium text-[#909090] px-2.5 py-1 rounded-xl bg-[#0f1115] border border-[#2a2a2e]">
            {filteredStats.length} Players
          </span>
        </div>
      </div>

      {/* Batting Stats Table */}
      {activeTab === 'batting' && (
        <div className="overflow-x-auto rounded-2xl border border-[#2a2a2e] bg-[#121418] shadow-sm">
          <table className="w-full text-xs font-mono-num">
            <thead>
              <tr className="text-[#909090] text-[11px] border-b border-[#2a2a2e] bg-[#0f1115] font-sans">
                <th className="text-left py-3 px-3 font-semibold" title="Rank based on total runs">
                  # Rank
                </th>
                <th className="text-left py-3 px-3 font-semibold" title="Player Name">
                  Player Name
                </th>
                <th className="text-left py-3 px-2.5 font-semibold" title="Associated Team">
                  Team
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Matches Played (Mat)">
                  Mat
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Innings Batted (Inn)">
                  Inn
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Times Remained Not Out (NO)">
                  NO
                </th>
                <th
                  className="text-right py-3 px-2.5 font-semibold cursor-pointer hover:text-[#00c853] text-white"
                  onClick={() => toggleBatSort('runs')}
                  title="Total Runs Scored (Click to sort)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Runs</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right py-3 px-2 font-semibold" title="Balls Faced (BF)">
                  BF
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold cursor-pointer hover:text-[#00c853]"
                  onClick={() => toggleBatSort('highScore')}
                  title="Highest Score in an Innings (* indicates not out)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>HS</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold cursor-pointer hover:text-[#00c853]"
                  onClick={() => toggleBatSort('average')}
                  title="Batting Average = Runs ÷ Dismissals"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold cursor-pointer hover:text-[#00c853] text-[#00c853]"
                  onClick={() => toggleBatSort('strikeRate')}
                  title="Strike Rate = (Runs ÷ Balls) × 100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SR</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Fifties (50 to 99 runs)">
                  50s
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Centuries (100+ runs)">
                  100s
                </th>
                <th className="text-center py-3 px-2.5 font-semibold" title="Boundaries Hit (4s / 6s)">
                  4s / 6s
                </th>
                {adminMode && (
                  <th className="text-center py-3 px-3 font-semibold text-[#ffab00]" title="Administrative Corrections">
                    Admin Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2e]/60">
              {sortedBatting.length === 0 ? (
                <tr>
                  <td colSpan={adminMode ? 15 : 14} className="py-8 text-center text-[#909090] font-sans">
                    No batting statistics recorded yet for this tournament filter.
                  </td>
                </tr>
              ) : (
                sortedBatting.map((stat, rank) => {
                  const playerObj = players.find((p) => p.id === stat.playerId);
                  return (
                    <tr
                      key={stat.playerId}
                      className="hover:bg-[#1a1d23] transition group cursor-pointer"
                      onClick={() => playerObj && setSelectedPlayerForModal(playerObj)}
                    >
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        <span className="w-5 text-[#909090] text-[11px] font-mono-num font-bold">
                          {rank + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        <span className="group-hover:text-[#00c853] transition font-semibold">
                          {stat.playerName}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-sans text-[#909090] text-[11px]">
                        {stat.teamName}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#909090]">{stat.batting.matches}</td>
                      <td className="py-2.5 px-2 text-center text-[#909090]">{stat.batting.innings}</td>
                      <td className="py-2.5 px-2 text-center text-[#909090]">{stat.batting.notOuts}</td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-white text-sm">
                        {stat.batting.runs}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#909090]">{stat.batting.balls}</td>
                      <td className="py-2.5 px-2 text-right text-[#e0e0e0]">
                        {stat.batting.highScore}
                        {stat.batting.isHighScoreNotOut ? '*' : ''}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#e0e0e0]">
                        {stat.batting.innings > 0 ? stat.batting.average : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#00c853] font-semibold">
                        {stat.batting.strikeRate}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#e0e0e0]">{stat.batting.fifties}</td>
                      <td className="py-2.5 px-2 text-center text-[#ffab00] font-bold">{stat.batting.hundreds}</td>
                      <td className="py-2.5 px-2.5 text-center text-[#909090]">
                        {stat.batting.fours} / {stat.batting.sixes}
                      </td>
                      {adminMode && (
                        <td
                          className="py-2.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenAdminEdit(stat)}
                              className="p-1.5 rounded-lg bg-[#ffab0022] text-[#ffab00] hover:bg-[#ffab0033] transition"
                              title="Edit Player Stats"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPlayerToReset(stat)}
                              className="p-1.5 rounded-lg bg-[#d5000022] text-[#ff5252] hover:bg-[#d5000033] transition"
                              title="Reset this player's stats to zero"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bowling Stats Table */}
      {activeTab === 'bowling' && (
        <div className="overflow-x-auto rounded-2xl border border-[#2a2a2e] bg-[#121418] shadow-sm">
          <table className="w-full text-xs font-mono-num">
            <thead>
              <tr className="text-[#909090] text-[11px] border-b border-[#2a2a2e] bg-[#0f1115] font-sans">
                <th className="text-left py-3 px-3 font-semibold" title="Rank based on wickets">
                  # Rank
                </th>
                <th className="text-left py-3 px-3 font-semibold" title="Player Name">
                  Player Name
                </th>
                <th className="text-left py-3 px-2.5 font-semibold" title="Associated Team">
                  Team
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Matches Played (Mat)">
                  Mat
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Innings Bowled (Inn)">
                  Inn
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Overs Bowled (Ov)">
                  Ov
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Maiden Overs (Mdn)">
                  Mdn
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Runs Conceded (RC)">
                  RC
                </th>
                <th
                  className="text-right py-3 px-2.5 font-semibold cursor-pointer hover:text-[#ffab00] text-[#ffab00]"
                  onClick={() => toggleBowlSort('wickets')}
                  title="Total Wickets Taken (Click to sort)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Wkts</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold cursor-pointer hover:text-[#00c853]"
                  onClick={() => toggleBowlSort('economyRate')}
                  title="Economy Rate = Runs Conceded per Over (Click to sort)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Econ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-2 font-semibold cursor-pointer hover:text-[#00c853]"
                  onClick={() => toggleBowlSort('average')}
                  title="Bowling Average = Runs Conceded ÷ Wickets"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right py-3 px-2.5 font-semibold" title="Best Bowling in an Innings (BBI)">
                  BBI
                </th>
                <th className="text-center py-3 px-2 font-semibold" title="Five-Wicket Hauls (5W)">
                  5W
                </th>
                {adminMode && (
                  <th className="text-center py-3 px-3 font-semibold text-[#ffab00]" title="Administrative Corrections">
                    Admin Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2e]/60">
              {sortedBowling.length === 0 ? (
                <tr>
                  <td colSpan={adminMode ? 14 : 13} className="py-8 text-center text-[#909090] font-sans">
                    No bowling statistics recorded yet for this tournament filter.
                  </td>
                </tr>
              ) : (
                sortedBowling.map((stat, rank) => {
                  const playerObj = players.find((p) => p.id === stat.playerId);
                  return (
                    <tr
                      key={stat.playerId}
                      className="hover:bg-[#1a1d23] transition group cursor-pointer"
                      onClick={() => playerObj && setSelectedPlayerForModal(playerObj)}
                    >
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        <span className="w-5 text-[#909090] text-[11px] font-mono-num font-bold">
                          {rank + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-white">
                        <span className="group-hover:text-[#00c853] transition font-semibold">
                          {stat.playerName}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-sans text-[#909090] text-[11px]">
                        {stat.teamName}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#909090]">{stat.bowling.matches}</td>
                      <td className="py-2.5 px-2 text-center text-[#909090]">{stat.bowling.innings}</td>
                      <td className="py-2.5 px-2 text-center text-[#e0e0e0]">
                        {stat.bowling.oversFormatted}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#909090]">{stat.bowling.maidens}</td>
                      <td className="py-2.5 px-2 text-center text-[#e0e0e0]">
                        {stat.bowling.runsConceded}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-black text-[#ffab00] text-sm">
                        {stat.bowling.wickets}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#00c853] font-semibold">
                        {stat.bowling.economyRate}
                      </td>
                      <td className="py-2.5 px-2 text-right text-[#e0e0e0]">
                        {stat.bowling.wickets > 0 ? stat.bowling.average : '-'}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-[#e0e0e0]">
                        {stat.bowling.bestBowlingFigures !== '0/0' ? stat.bowling.bestBowlingFigures : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#ffab00] font-bold">
                        {stat.bowling.fiveWickets}
                      </td>
                      {adminMode && (
                        <td
                          className="py-2.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenAdminEdit(stat)}
                              className="p-1.5 rounded-lg bg-[#ffab0022] text-[#ffab00] hover:bg-[#ffab0033] transition"
                              title="Edit Player Stats"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPlayerToReset(stat)}
                              className="p-1.5 rounded-lg bg-[#d5000022] text-[#ff5252] hover:bg-[#d5000033] transition"
                              title="Reset this player's stats to zero"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cricket Statistics Glossary & Column Legend */}
      <div className="bg-[#121418] border border-[#2a2a2e] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setShowGlossary(!showGlossary)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1a1d23] transition"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#00c853]" />
            <h4 className="font-display font-bold text-sm text-white">
              Statistics Terminology & Column Explanations
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#909090]">
            <span>{showGlossary ? 'Hide Legend' : 'Show All Definitions'}</span>
            {showGlossary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showGlossary && (
          <div className="p-4 pt-0 border-t border-[#2a2a2e]/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-[#909090]">
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Mat (Matches)</span>
              <span>Total official matches in which the player was named in the playing XI.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Inn (Innings)</span>
              <span>Number of innings in which the player actually batted or bowled.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">NO (Not Outs)</span>
              <span>Number of completed batting innings where the batsman was not dismissed.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Runs / BF</span>
              <span>Total runs accumulated and Balls Faced (BF) by the batsman.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">HS (Highest Score)</span>
              <span>Highest individual score made in a single innings. Asterisk (*) denotes not out.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Avg (Batting Average)</span>
              <span>Calculated as Total Runs ÷ Number of Dismissals (Innings minus Not Outs).</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">SR (Strike Rate)</span>
              <span>Runs scored per 100 legal balls faced: (Runs ÷ Balls) × 100.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">50s / 100s</span>
              <span>Number of half-centuries (scores of 50-99) and centuries (scores of 100+).</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">4s / 6s (Boundaries)</span>
              <span>Individual count of four-run boundaries and six-run hits over the ropes.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Ov (Overs Bowled)</span>
              <span>Total completed overs and fractional balls bowled (e.g. 3.4 overs).</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Mdn (Maiden Overs)</span>
              <span>Number of full overs bowled where zero runs were conceded.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">RC (Runs Conceded) & Wkts</span>
              <span>Total bowling runs given away and total wickets captured.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">Econ (Economy Rate)</span>
              <span>Average runs conceded per over: Total Runs Conceded ÷ Overs Bowled.</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">BBI (Best Bowling)</span>
              <span>Best single-match figures: Wickets taken for runs conceded (e.g. 4/18).</span>
            </div>
            <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]/50">
              <span className="font-bold text-white block mb-0.5">5W (Five-Wicket Hauls)</span>
              <span>Number of matches where the bowler claimed 5 or more wickets in an innings.</span>
            </div>
          </div>
        )}
      </div>

      {/* Delete / Reset Stats Confirmation Modal */}
      {showDeleteStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#d5000044] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
              <div className="flex items-center gap-2 text-[#ff5252]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-display font-bold text-base text-white">
                  Delete / Reset Statistics
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteStatsModal(false)}
                className="text-[#909090] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#909090] leading-relaxed">
              Choose the scope of statistics you wish to wipe. This action will reset accumulated runs, wickets, averages, and leaderboards.
            </p>

            <div className="space-y-3">
              {/* Option A: Clear stats for currently selected tournament */}
              {tournamentFilter !== 'all' && selectedTournamentObj && (
                <div className="bg-[#1a1d23] border border-[#2a2a2e] p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Reset "{selectedTournamentObj.name}" Stats
                      </h4>
                      <p className="text-[11px] text-[#909090]">
                        Deletes match timelines & stats for this tournament only.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearTournament}
                    className="w-full py-2 px-3 rounded-xl bg-[#d5000022] hover:bg-[#d5000044] text-[#ff5252] border border-[#d5000066] text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Tournament Stats Only</span>
                  </button>
                </div>
              )}

              {/* Option B: Clear All Career & Match Stats */}
              <div className="bg-[#1a1d23] border border-[#d5000033] p-3.5 rounded-xl space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#ff5252]">
                    Reset All Cricket Statistics (Global)
                  </h4>
                  <p className="text-[11px] text-[#909090]">
                    Zeroes out all player batting & bowling figures across all tournaments and career logs.
                  </p>
                </div>
                <button
                  onClick={handleClearAll}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold transition shadow-md shadow-black/50 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm Delete All Stats</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#2a2a2e]">
              <button
                onClick={() => setShowDeleteStatsModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#909090] hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Player Reset Modal */}
      {playerToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#d5000044] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#ff5252]">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="font-display font-bold text-base text-white">
                Reset Player Stats
              </h3>
            </div>

            <p className="text-xs text-[#e0e0e0] leading-relaxed">
              Are you sure you want to reset all batting and bowling statistics for <strong className="text-white font-bold">{playerToReset.playerName}</strong> ({playerToReset.teamName}) to zero?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
              <button
                onClick={() => setPlayerToReset(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-[#909090] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetPlayerStats(playerToReset.playerId);
                  setPlayerToReset(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold transition shadow-md shadow-black/50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Zero</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Stat Edit Modal */}
      {editingStat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#ffab0044] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-base text-[#ffab00] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Stats Correction</span>
              </h3>
              <button
                onClick={() => setEditingStat(null)}
                className="text-[#909090] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#e0e0e0]">
              Correcting figures for <strong className="text-white">{editingStat.playerName}</strong> ({editingStat.teamName})
            </p>

            <form onSubmit={handleSaveAdminEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">Career Runs</label>
                  <input
                    type="number"
                    value={editRuns}
                    onChange={(e) => setEditRuns(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">Career Wickets</label>
                  <input
                    type="number"
                    value={editWickets}
                    onChange={(e) => setEditWickets(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">Fours (4s)</label>
                  <input
                    type="number"
                    value={editFours}
                    onChange={(e) => setEditFours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">Sixes (6s)</label>
                  <input
                    type="number"
                    value={editSixes}
                    onChange={(e) => setEditSixes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => {
                    resetPlayerStats(editingStat.playerId);
                    setEditingStat(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#d5000022] hover:bg-[#d5000033] text-[#ff5252] text-xs font-semibold border border-[#d5000044] transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Zero Out Stats</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStat(null)}
                    className="px-3.5 py-1.5 rounded-xl text-xs text-[#909090] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#ffab00] hover:bg-[#ffd54f] text-black text-xs font-bold shadow-md shadow-black/40"
                  >
                    Save Override
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
