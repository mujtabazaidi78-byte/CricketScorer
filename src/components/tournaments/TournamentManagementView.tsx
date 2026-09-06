import React, { useState } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { Tournament, TournamentFormat } from '../../types';
import {
  Trophy,
  Plus,
  Calendar,
  Shield,
  PlayCircle,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  Award,
  Trash2,
  Minus,
} from 'lucide-react';

export const TournamentManagementView: React.FC = () => {
  const tournaments = useCricketStore((state) => state.tournaments);
  const teams = useCricketStore((state) => state.teams);
  const matches = useCricketStore((state) => state.matches);
  const createTournament = useCricketStore((state) => state.createTournament);
  const deleteTournament = useCricketStore((state) => state.deleteTournament);
  const setActiveTab = useCricketStore((state) => state.setActiveTab);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [format, setFormat] = useState<TournamentFormat>('T20');
  const [oversPerInnings, setOversPerInnings] = useState(20);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const activeTeams = teams.filter((t) => !t.isDeleted);

  const handleOpenCreate = () => {
    setName('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setFormat('T20');
    setOversPerInnings(20);
    setSelectedTeamIds(activeTeams.map((t) => t.id)); // Default all active
    setFormError('');
    setShowCreateModal(true);
  };

  const handleFormatChange = (fmt: TournamentFormat) => {
    setFormat(fmt);
    if (fmt === 'T20') setOversPerInnings(20);
    else if (fmt === 'ODI') setOversPerInnings(50);
    else if (fmt === 'Test') setOversPerInnings(90);
    else setOversPerInnings(10);
  };

  const toggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Tournament Name is required');
      return;
    }
    if (selectedTeamIds.length < 2) {
      setFormError('Select at least 2 teams for the tournament');
      return;
    }
    if (oversPerInnings < 1) {
      setFormError('Overs per innings must be at least 1');
      return;
    }

    createTournament({
      name: name.trim(),
      startDate,
      endDate,
      format,
      oversPerInnings,
      participatingTeamIds: selectedTeamIds,
    });

    setShowCreateModal(false);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121418] p-4 rounded-2xl border border-[#2a2a2e] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffab00]" />
            <span>Tournaments & Leagues</span>
          </h2>
          <p className="text-xs text-[#909090] mt-0.5">
            Configure championship series with automatic zero-stat player roster integration.
          </p>
        </div>

        <button
          id="btn-create-tournament"
          onClick={handleOpenCreate}
          disabled={activeTeams.length < 2}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] disabled:opacity-50 text-black font-bold text-xs sm:text-sm shadow-md shadow-black/40 transition touch-active"
        >
          <Plus className="w-4 h-4" />
          <span>New Tournament</span>
        </button>
      </div>

      {/* Tournaments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tournaments.map((tournament) => {
          const tournamentMatches = matches.filter((m) => m.tournamentId === tournament.id);
          const participatingTeams = teams.filter((t) =>
            tournament.participatingTeamIds.includes(t.id)
          );

          // Calculate points table for tournament
          const standings: Record<
            string,
            { played: number; won: number; lost: number; points: number }
          > = {};
          participatingTeams.forEach((t) => {
            standings[t.id] = { played: 0, won: 0, lost: 0, points: 0 };
          });

          tournamentMatches
            .filter((m) => m.status === 'Completed')
            .forEach((m) => {
              if (standings[m.teamAId]) standings[m.teamAId].played += 1;
              if (standings[m.teamBId]) standings[m.teamBId].played += 1;
              if (m.winningTeamId && standings[m.winningTeamId]) {
                standings[m.winningTeamId].won += 1;
                standings[m.winningTeamId].points += 2;
                const loserId = m.winningTeamId === m.teamAId ? m.teamBId : m.teamAId;
                if (standings[loserId]) standings[loserId].lost += 1;
              }
            });

          return (
            <div
              key={tournament.id}
              id={`tournament-card-${tournament.id}`}
              className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 hover:border-[#3a3d46] transition flex flex-col justify-between space-y-3 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#ffab0018] border border-[#ffab0033] flex items-center justify-center text-[#ffab00]">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">
                        {tournament.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#909090] mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#1a1d23] text-[#e0e0e0] font-semibold text-[10px] border border-[#2a2a2e]">
                          {tournament.format} ({tournament.oversPerInnings} Overs)
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#909090]" />
                          {tournament.startDate} to {tournament.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tournament.status === 'Ongoing'
                          ? 'bg-[#00c85318] border-[#00c85344] text-[#00c853]'
                          : tournament.status === 'Completed'
                          ? 'bg-[#b388ff18] border-[#b388ff44] text-[#b388ff]'
                          : 'bg-[#1a1d23] border-[#2a2a2e] text-[#909090]'
                      }`}
                    >
                      {tournament.status}
                    </span>
                    <button
                      onClick={() => setTournamentToDelete(tournament)}
                      title="Delete Tournament"
                      className="p-1.5 rounded-lg text-[#909090] hover:text-[#ff5252] hover:bg-[#d5000022] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Participating squads badges */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-[#909090] uppercase tracking-wider block mb-1.5">
                    Participating Teams ({participatingTeams.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {participatingTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center gap-1.5 bg-[#0f1115] px-2.5 py-1 rounded-lg border border-[#2a2a2e] text-xs text-[#e0e0e0]"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: team.logoColor }}
                        />
                        <span>{team.name}</span>
                        <span className="text-[10px] font-mono-num text-[#909090]">
                          ({team.shortCode})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Standings Table mini-view */}
                <div className="mt-3.5 bg-[#0f1115] rounded-xl p-2.5 border border-[#2a2a2e]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#909090] mb-1.5 flex justify-between">
                    <span>Points Table</span>
                    <span className="font-mono-num">Matches: {tournamentMatches.length}</span>
                  </div>
                  <table className="w-full text-xs font-mono-num">
                    <thead>
                      <tr className="text-[#909090] text-[10px] border-b border-[#2a2a2e]">
                        <th className="text-left py-1 font-semibold">Team</th>
                        <th className="text-center py-1 font-semibold">P</th>
                        <th className="text-center py-1 font-semibold">W</th>
                        <th className="text-center py-1 font-semibold">L</th>
                        <th className="text-right py-1 font-semibold text-[#00c853]">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a2e]/60">
                      {participatingTeams
                        .sort(
                          (a, b) =>
                            (standings[b.id]?.points || 0) - (standings[a.id]?.points || 0)
                        )
                        .map((team) => {
                          const s = standings[team.id] || {
                            played: 0,
                            won: 0,
                            lost: 0,
                            points: 0,
                          };
                          return (
                            <tr key={team.id} className="text-[#e0e0e0]">
                              <td className="py-1 font-sans flex items-center gap-1.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: team.logoColor }}
                                />
                                <span className="truncate max-w-[120px]">{team.name}</span>
                              </td>
                              <td className="text-center py-1 text-[#909090]">{s.played}</td>
                              <td className="text-center py-1 text-[#e0e0e0]">{s.won}</td>
                              <td className="text-center py-1 text-[#909090]">{s.lost}</td>
                              <td className="text-right py-1 font-bold text-[#00c853]">
                                {s.points}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-[#2a2a2e] flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('stats')}
                  className="text-xs text-[#909090] hover:text-white flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5 text-[#ffab00]" />
                  <span>Leaderboards</span>
                </button>

                <button
                  onClick={() => setActiveTab('live')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs font-bold shadow-sm transition touch-active"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Match</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12 bg-[#121418] rounded-2xl border border-[#2a2a2e] p-6">
          <Trophy className="w-12 h-12 text-[#909090] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[#e0e0e0]">No Tournaments Created</h3>
          <p className="text-xs text-[#909090] mt-1 max-w-sm mx-auto">
            Create your first tournament to organize fixtures and track dynamic tournament-wide player statistics.
          </p>
        </div>
      )}

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-lg text-white">Create New Tournament</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#909090] hover:text-white hover:bg-[#1a1d23]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-[#d5000022] border border-[#d5000055] text-[#ff8a80] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Karachi Super League 2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-sm text-white placeholder-[#606060] focus:outline-none focus:border-[#00c853]"
                  autoFocus
                />
              </div>

              {/* Tournament Format */}
              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                  Match Format & Overs *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['T20', 'ODI', 'Test', 'Custom'] as TournamentFormat[]).map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => handleFormatChange(fmt)}
                      className={`py-2 rounded-xl text-xs font-bold border text-center transition ${
                        format === fmt
                          ? 'bg-[#00c85322] border-[#00c853] text-[#00c853]'
                          : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#e0e0e0]">
                    Overs per Innings (1 - 100)
                  </label>
                  <span className="text-xs font-mono-num font-bold text-[#00c853]">
                    {oversPerInnings} {oversPerInnings === 1 ? 'Over' : 'Overs'} ({oversPerInnings * 6} balls)
                  </span>
                </div>

                <div className="flex items-center bg-[#0f1115] border border-[#2a2a2e] rounded-xl overflow-hidden focus-within:border-[#00c853]">
                  <button
                    type="button"
                    onClick={() => setOversPerInnings(Math.max(1, oversPerInnings - 1))}
                    className="px-3 py-2 text-[#909090] hover:text-white hover:bg-[#25282e]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    value={oversPerInnings}
                    onChange={(e) => setOversPerInnings(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={100}
                    className="w-full text-center bg-transparent py-2 text-sm text-white font-mono-num focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setOversPerInnings(Math.min(100, oversPerInnings + 1))}
                    className="px-3 py-2 text-[#909090] hover:text-white hover:bg-[#25282e]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {[2, 5, 8, 10, 15, 20, 50].map((ov) => (
                    <button
                      type="button"
                      key={ov}
                      onClick={() => setOversPerInnings(ov)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        oversPerInnings === ov
                          ? 'bg-[#00c85322] border-[#00c853] text-[#00c853]'
                          : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
                      }`}
                    >
                      {ov} ov
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              {/* Add Teams Checkbox List (Mandated requirement) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#e0e0e0]">
                    Participating Teams ({selectedTeamIds.length} selected) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTeamIds.length === activeTeams.length) setSelectedTeamIds([]);
                      else setSelectedTeamIds(activeTeams.map((t) => t.id));
                    }}
                    className="text-[11px] text-[#00c853] hover:text-[#00e676] font-medium"
                  >
                    {selectedTeamIds.length === activeTeams.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]">
                  {activeTeams.map((t) => {
                    const isChecked = selectedTeamIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTeam(t.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition select-none ${
                          isChecked ? 'bg-[#00c85318] border border-[#00c85344]' : 'hover:bg-[#1a1d23] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white"
                            style={{ backgroundColor: t.logoColor }}
                          >
                            {t.shortCode.substring(0, 2)}
                          </div>
                          <span className="text-xs font-medium text-white">{t.name}</span>
                        </div>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#00c853]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#909090]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Stats Integration Notice */}
              <div className="p-2.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-[11px] text-[#909090] leading-relaxed">
                ℹ️ <strong>Dynamic Stats Engine:</strong> Players from all checked teams will be automatically registered into the Tournament Stats view with zero starting values (0 runs, 0 wickets).
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs sm:text-sm font-bold shadow-md shadow-black/40 transition touch-active"
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tournament Confirmation Modal */}
      {tournamentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d5000022] border border-[#d5000044] text-[#ff5252] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Delete Tournament</h3>
                <p className="text-xs text-[#909090]">This action cannot be undone.</p>
              </div>
            </div>

            <div className="text-xs text-[#e0e0e0] leading-relaxed bg-[#0f1115] p-3.5 rounded-xl border border-[#2a2a2e] space-y-1.5">
              <p>
                Are you sure you want to delete <strong className="text-white font-bold">{tournamentToDelete.name}</strong>?
              </p>
              <p className="text-[#909090] text-[11px]">
                Format: {tournamentToDelete.format} ({tournamentToDelete.oversPerInnings} Overs) • {tournamentToDelete.participatingTeamIds.length} Teams
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTournamentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#25282e] hover:bg-[#32363e] text-[#e0e0e0] text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTournament(tournamentToDelete.id);
                  setTournamentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-black/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Tournament</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
