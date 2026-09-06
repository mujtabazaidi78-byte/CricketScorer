import React, { useState } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { CricketMatch } from '../../types';
import {
  Trophy,
  Radio,
  Shield,
  Users,
  PlayCircle,
  Award,
  Calendar,
  ChevronRight,
  Flame,
  ArrowUpRight,
  FileText,
  Activity,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ScorecardModal } from '../scoring/ScorecardModal';

export const CricketDashboard: React.FC = () => {
  const matches = useCricketStore((state) => state.matches);
  const activeMatchId = useCricketStore((state) => state.activeMatchId);
  const tournaments = useCricketStore((state) => state.tournaments);
  const teams = useCricketStore((state) => state.teams);
  const players = useCricketStore((state) => state.players);
  const setActiveTab = useCricketStore((state) => state.setActiveTab);
  const getAllPlayersStats = useCricketStore((state) => state.getAllPlayersStats);
  const deleteMatch = useCricketStore((state) => state.deleteMatch);

  const [inspectScorecardMatchId, setInspectScorecardMatchId] = useState<string | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<CricketMatch | null>(null);

  const activeTeams = teams.filter((t) => !t.isDeleted);
  const activePlayers = players.filter((p) => !p.isDeleted);
  const liveMatch = matches.find((m) => m.id === activeMatchId && m.status === 'Live');
  const completedMatches = matches.filter((m) => m.status === 'Completed');

  const allStats = getAllPlayersStats();
  const topRunScorer = [...allStats].sort((a, b) => b.batting.runs - a.batting.runs)[0];
  const topWicketTaker = [...allStats].sort((a, b) => b.bowling.wickets - a.bowling.wickets)[0];

  const getTeamName = (id: string) => {
    const t = teams.find((item) => item.id === id);
    return t ? (t.isDeleted ? `${t.name} (Deleted)` : t.name) : 'Team';
  };

  const getTeamColor = (id: string) => {
    const t = teams.find((item) => item.id === id);
    return t?.logoColor || '#10b981';
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Live Match Alert / Hero Card if there's an ongoing match */}
      {liveMatch ? (
        <div
          onClick={() => setActiveTab('live')}
          className="cursor-pointer bg-[#1a1d23] border border-[#d50000]/40 p-4 sm:p-5 rounded-2xl shadow-xl hover:border-[#d50000]/60 transition group relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5252] animate-ping" />
                <span className="text-[11px] uppercase font-black tracking-widest text-[#ff5252] bg-[#d5000022] px-2 py-0.5 rounded border border-[#d5000044]">
                  Live Match in Progress
                </span>
                <span className="text-xs text-[#909090] font-medium">
                  {liveMatch.oversLimit} Overs Format
                </span>
              </div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#ff8a80] transition">
                {getTeamName(liveMatch.teamAId)} vs {getTeamName(liveMatch.teamBId)}
              </h2>
              <p className="text-xs text-[#e0e0e0] mt-1">
                {liveMatch.currentInningsIndex === 0 ? '1st Innings' : '2nd Innings Target Chase'}:{' '}
                <strong className="text-[#00c853] font-mono-num font-bold">
                  {liveMatch.innings[liveMatch.currentInningsIndex].totalRuns}/
                  {liveMatch.innings[liveMatch.currentInningsIndex].wickets}
                </strong>{' '}
                (
                {Math.floor(liveMatch.innings[liveMatch.currentInningsIndex].legalBallsBowled / 6)}.
                {liveMatch.innings[liveMatch.currentInningsIndex].legalBallsBowled % 6} ov)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white font-bold text-xs sm:text-sm shadow-md shadow-black/50 flex items-center gap-1.5 transition">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Resume Live Scoring →</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Welcome Quick Start banner */
        <div className="bg-[#121418] border border-[#2a2a2e] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-[#00c853] text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>Cricket Tournament Hub</span>
            </div>
            <h2 className="font-display font-bold text-lg text-white">
              CricPro Match Console
            </h2>
            <p className="text-xs text-[#909090] mt-0.5">
              Live scoring, automated career stats, and DLS calculations for local tournaments.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('live')}
            className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-black/40 transition touch-active shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch Match</span>
          </button>
        </div>
      )}

      {/* Hero Numbers Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('tournaments')}
          className="bg-[#121418] p-3.5 rounded-2xl border border-[#2a2a2e] hover:border-[#3a3d46] cursor-pointer transition flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-[#909090] font-semibold uppercase tracking-wider block">
              Tournaments
            </span>
            <span className="font-display font-black text-2xl text-white font-mono-num">
              {tournaments.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#ffab0018] text-[#ffab00] flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('teams')}
          className="bg-[#121418] p-3.5 rounded-2xl border border-[#2a2a2e] hover:border-[#3a3d46] cursor-pointer transition flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-[#909090] font-semibold uppercase tracking-wider block">
              Active Teams
            </span>
            <span className="font-display font-black text-2xl text-[#00c853] font-mono-num">
              {activeTeams.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#00c85318] text-[#00c853] flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('players')}
          className="bg-[#121418] p-3.5 rounded-2xl border border-[#2a2a2e] hover:border-[#3a3d46] cursor-pointer transition flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-[#909090] font-semibold uppercase tracking-wider block">
              Registered Players
            </span>
            <span className="font-display font-black text-2xl text-[#29b6f6] font-mono-num">
              {activePlayers.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#29b6f618] text-[#29b6f6] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('stats')}
          className="bg-[#121418] p-3.5 rounded-2xl border border-[#2a2a2e] hover:border-[#3a3d46] cursor-pointer transition flex items-center justify-between shadow-sm"
        >
          <div>
            <span className="text-[11px] text-[#909090] font-semibold uppercase tracking-wider block">
              Matches Played
            </span>
            <span className="font-display font-black text-2xl text-[#b388ff] font-mono-num">
              {matches.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#b388ff18] text-[#b388ff] flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Content: Recent Matches & Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Matches & Tournaments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Matches */}
          <div className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00c853]" />
                <span>Recent Matches</span>
              </h3>
              <button
                onClick={() => setActiveTab('live')}
                className="text-xs text-[#00c853] hover:underline font-bold"
              >
                Start New +
              </button>
            </div>

            <div className="space-y-2.5">
              {matches.slice(0, 4).map((match) => {
                const isLive = match.status === 'Live';
                const teamA = teams.find((t) => t.id === match.teamAId);
                const teamB = teams.find((t) => t.id === match.teamBId);

                return (
                  <div
                    key={match.id}
                    className="p-3 rounded-xl bg-[#0f1115] border border-[#2a2a2e] hover:border-[#3a3d46] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isLive
                              ? 'bg-[#d5000022] text-[#ff5252] border border-[#d5000055] animate-pulse'
                              : 'bg-[#1a1d23] text-[#909090] border border-[#2a2a2e]'
                          }`}
                        >
                          {match.status}
                        </span>
                        <span className="text-[11px] text-[#909090]">
                          {match.oversLimit} Overs • {match.createdAt ? new Date(match.createdAt).toLocaleDateString() : 'Match Day'}
                        </span>
                      </div>

                      {/* Team Scores line */}
                      <div className="flex items-center gap-4 text-xs font-mono-num font-medium text-[#e0e0e0]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: teamA?.logoColor || '#00c853' }}
                          />
                          <span className="font-sans font-semibold text-white">
                            {teamA?.name || 'Team A'}
                          </span>
                          <span className="font-bold text-[#00c853] ml-1">
                            {match.innings[0].totalRuns}/{match.innings[0].wickets}
                          </span>
                          <span className="text-[10px] text-[#909090]">
                            (
                            {Math.floor(match.innings[0].legalBallsBowled / 6)}.
                            {match.innings[0].legalBallsBowled % 6} ov)
                          </span>
                        </div>

                        <span className="text-[#909090]">vs</span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: teamB?.logoColor || '#29b6f6' }}
                          />
                          <span className="font-sans font-semibold text-white">
                            {teamB?.name || 'Team B'}
                          </span>
                          <span className="font-bold text-[#00c853] ml-1">
                            {match.innings[1].totalRuns}/{match.innings[1].wickets}
                          </span>
                          <span className="text-[10px] text-[#909090]">
                            (
                            {Math.floor(match.innings[1].legalBallsBowled / 6)}.
                            {match.innings[1].legalBallsBowled % 6} ov)
                          </span>
                        </div>
                      </div>

                      {match.resultSummary && (
                        <p className="text-[11px] text-[#00c853] font-medium">
                          {match.resultSummary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setInspectScorecardMatchId(match.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#1a1d23] hover:bg-[#25282e] text-[#e0e0e0] text-xs font-medium border border-[#2a2a2e] flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#00c853]" />
                        <span>Scorecard</span>
                      </button>
                      <button
                        onClick={() => setMatchToDelete(match)}
                        title="Delete Match"
                        className="p-1.5 rounded-lg bg-[#1a1d23] hover:bg-[#d5000022] text-[#909090] hover:text-[#ff5252] border border-[#2a2a2e] hover:border-[#d5000055] transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {matches.length === 0 && (
                <div className="text-center py-6 text-xs text-[#909090] bg-[#0f1115] rounded-xl border border-[#2a2a2e] space-y-1">
                  <p className="font-semibold text-[#e0e0e0]">No match records found</p>
                  <p>Matches you score will be listed here with ball-by-ball analysis and delete options.</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Tournament Snapshot */}
          <div className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#ffab00]" />
                <span>Featured Tournaments</span>
              </h3>
              <button
                onClick={() => setActiveTab('tournaments')}
                className="text-xs text-[#ffab00] hover:underline font-bold"
              >
                All Tournaments →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tournaments.slice(0, 2).map((tourney) => (
                <div
                  key={tourney.id}
                  onClick={() => setActiveTab('tournaments')}
                  className="p-3 rounded-xl bg-[#0f1115] border border-[#2a2a2e] cursor-pointer hover:border-[#3a3d46] transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#00c853] uppercase tracking-wider">
                      {tourney.format} League ({tourney.oversPerInnings} Overs)
                    </span>
                    <h4 className="font-bold text-sm text-white mt-0.5">{tourney.name}</h4>
                    <p className="text-[11px] text-[#909090] mt-1">
                      {tourney.participatingTeamIds.length} Teams Registered
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#2a2a2e] flex items-center justify-between text-[11px] text-[#909090]">
                    <span>{tourney.startDate}</span>
                    <span className="text-[#00c853] font-bold">View Standings →</span>
                  </div>
                </div>
              ))}

              {tournaments.length === 0 && (
                <div className="text-center py-6 text-xs text-[#909090] bg-[#0f1115] rounded-xl border border-[#2a2a2e] space-y-1 sm:col-span-2">
                  <p className="font-semibold text-[#e0e0e0]">No tournaments created yet</p>
                  <p>Create leagues or cups in Tournaments Hub to track points and rankings.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Performers (Orange & Purple Cap) and Quick Actions */}
        <div className="space-y-4">
          {/* Top Performers Card */}
          <div className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ffab00]" />
                <span>Tournament Honors</span>
              </h3>
              <button
                onClick={() => setActiveTab('stats')}
                className="text-xs text-[#00c853] hover:underline font-bold"
              >
                Rankings →
              </button>
            </div>

            {/* Leading Batsman */}
            <div className="p-3 rounded-xl bg-[#0f1115] border border-[#2a2a2e] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#ffab00] tracking-wider">
                  Top Run Scorer
                </span>
                <span className="font-mono-num font-bold text-[#ffab00] text-sm">
                  {topRunScorer?.batting.runs || 0} Runs
                </span>
              </div>
              <h4 className="font-bold text-xs text-white">{topRunScorer?.playerName || 'N/A'}</h4>
              <p className="text-[10px] text-[#909090]">
                {topRunScorer?.teamName} • Avg: {topRunScorer?.batting.average} • SR:{' '}
                {topRunScorer?.batting.strikeRate}
              </p>
            </div>

            {/* Leading Bowler */}
            <div className="p-3 rounded-xl bg-[#0f1115] border border-[#2a2a2e] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#b388ff] tracking-wider">
                  Top Wicket Taker
                </span>
                <span className="font-mono-num font-bold text-[#b388ff] text-sm">
                  {topWicketTaker?.bowling.wickets || 0} Wickets
                </span>
              </div>
              <h4 className="font-bold text-xs text-white">{topWicketTaker?.playerName || 'N/A'}</h4>
              <p className="text-[10px] text-[#909090]">
                {topWicketTaker?.teamName} • Econ: {topWicketTaker?.bowling.economyRate}
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 space-y-2 shadow-sm">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#909090] mb-2">
              Quick Shortcuts
            </h3>
            <button
              onClick={() => setActiveTab('teams')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0f1115] hover:bg-[#1a1d23] border border-[#2a2a2e] text-xs font-medium text-[#e0e0e0] flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#00c853]" />
                <span>Add / Manage Teams</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#909090]" />
            </button>

            <button
              onClick={() => setActiveTab('players')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0f1115] hover:bg-[#1a1d23] border border-[#2a2a2e] text-xs font-medium text-[#e0e0e0] flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#29b6f6]" />
                <span>Player Rosters & Profiles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#909090]" />
            </button>

            <button
              onClick={() => setActiveTab('tournaments')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0f1115] hover:bg-[#1a1d23] border border-[#2a2a2e] text-xs font-medium text-[#e0e0e0] flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[#ffab00]" />
                <span>Create New Tournament</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#909090]" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Scorecard Modal */}
      {inspectScorecardMatchId && (
        <ScorecardModal
          matchId={inspectScorecardMatchId}
          onClose={() => setInspectScorecardMatchId(null)}
        />
      )}

      {/* Delete Match Confirmation Modal */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d5000022] border border-[#d5000044] text-[#ff5252] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Delete Match Record</h3>
                <p className="text-xs text-[#909090]">This match will be permanently deleted.</p>
              </div>
            </div>

            <div className="text-xs text-[#e0e0e0] leading-relaxed bg-[#0f1115] p-3.5 rounded-xl border border-[#2a2a2e] space-y-1.5">
              <p>
                Are you sure you want to delete the match between{' '}
                <strong className="text-white">{getTeamName(matchToDelete.teamAId)}</strong> and{' '}
                <strong className="text-white">{getTeamName(matchToDelete.teamBId)}</strong>?
              </p>
              <p className="text-[#909090] text-[11px]">
                {matchToDelete.oversLimit} Overs Format • Status: {matchToDelete.status} • All scoring events and contributions to tournament rankings will be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#25282e] hover:bg-[#32363e] text-[#e0e0e0] text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMatch(matchToDelete.id);
                  setMatchToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-black/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Match</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
