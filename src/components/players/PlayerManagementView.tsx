import React, { useState } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { Player, PlayerRole, BattingStyle, BowlingStyle } from '../../types';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Award,
  Zap,
  Filter,
  BarChart2,
  History,
} from 'lucide-react';

const ROLES: PlayerRole[] = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];

const BATTING_STYLES: BattingStyle[] = ['Right-hand bat', 'Left-hand bat'];

const BOWLING_STYLES: BowlingStyle[] = [
  'Right-arm fast',
  'Left-arm fast',
  'Right-arm medium',
  'Left-arm medium',
  'Off-spin',
  'Leg-spin',
  'Left-arm orthodox',
];

export const PlayerManagementView: React.FC = () => {
  const players = useCricketStore((state) => state.players);
  const teams = useCricketStore((state) => state.teams);
  const addPlayer = useCricketStore((state) => state.addPlayer);
  const updatePlayer = useCricketStore((state) => state.updatePlayer);
  const deletePlayer = useCricketStore((state) => state.deletePlayer);
  const getPlayerStats = useCricketStore((state) => state.getPlayerStats);
  const setSelectedPlayerForModal = useCricketStore((state) => state.setSelectedPlayerForModal);
  const selectedPlayerForModal = useCricketStore((state) => state.selectedPlayerForModal);

  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  // Form states
  const [teamId, setTeamId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<PlayerRole>('Batsman');
  const [battingStyle, setBattingStyle] = useState<BattingStyle>('Right-hand bat');
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle>('Right-arm fast');
  const [formError, setFormError] = useState('');

  const activeTeams = teams.filter((t) => !t.isDeleted);

  const handleOpenAdd = () => {
    setName('');
    setTeamId(activeTeams[0]?.id || '');
    setRole('Batsman');
    setBattingStyle('Right-hand bat');
    setBowlingStyle('Right-arm fast');
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setTeamId(player.teamId);
    setRole(player.role);
    setBattingStyle(player.battingStyle);
    setBowlingStyle(player.bowlingStyle);
    setFormError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Player Name is required');
      return;
    }
    if (!teamId) {
      setFormError('Please select a team for this player');
      return;
    }

    if (editingPlayer) {
      updatePlayer(editingPlayer.id, {
        name: name.trim(),
        teamId,
        role,
        battingStyle,
        bowlingStyle,
      });
      setEditingPlayer(null);
    } else {
      addPlayer({
        name: name.trim(),
        teamId,
        role,
        battingStyle,
        bowlingStyle,
      });
      setShowAddModal(false);
    }
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deletePlayer(playerToDelete.id);
      setPlayerToDelete(null);
    }
  };

  // Filtered active players
  const filteredPlayers = players.filter((player) => {
    if (player.isDeleted) return false;
    if (selectedTeamFilter !== 'all' && player.teamId !== selectedTeamFilter) return false;
    if (selectedRoleFilter !== 'all' && player.role !== selectedRoleFilter) return false;
    if (searchQuery.trim() && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121418] p-4 rounded-2xl border border-[#2a2a2e] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00c853]" />
            <span>Player Management</span>
          </h2>
          <p className="text-xs text-[#909090] mt-0.5">
            Roster registration, batting/bowling techniques, and live automated career tracker.
          </p>
        </div>

        <button
          id="btn-add-player"
          onClick={handleOpenAdd}
          disabled={activeTeams.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] disabled:opacity-50 text-black font-bold text-xs sm:text-sm shadow-md shadow-black/40 transition touch-active"
        >
          <Plus className="w-4 h-4" />
          <span>Add Player</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121418] p-3 rounded-2xl border border-[#2a2a2e] flex flex-col md:flex-row items-stretch md:items-center gap-2.5 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search players by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white placeholder-[#606060] focus:outline-none focus:border-[#00c853]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#909090] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Team Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-[#e0e0e0] focus:outline-none focus:border-[#00c853]"
          >
            <option value="all">All Teams</option>
            {activeTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.shortCode})
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-[#e0e0e0] focus:outline-none focus:border-[#00c853]"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredPlayers.map((player) => {
          const team = teams.find((t) => t.id === player.teamId);
          const stats = getPlayerStats(player.id);

          return (
            <div
              key={player.id}
              id={`player-card-${player.id}`}
              className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 hover:border-[#3a3d46] transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white"
                      style={{ backgroundColor: team?.logoColor || '#334155' }}
                    >
                      {player.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-[#00c853] transition">
                        {player.name}
                      </h3>
                      <span className="text-[11px] text-[#909090] block font-medium">
                        {team ? (team.isDeleted ? `${team.name} (Deleted)` : team.name) : 'No Team'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedPlayerForModal(player)}
                      className="p-1.5 rounded-lg text-[#00c853] hover:bg-[#00c85322] transition"
                      title="View Stats Profile"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(player)}
                      className="p-1.5 rounded-lg text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
                      title="Edit Player"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPlayerToDelete(player)}
                      className="p-1.5 rounded-lg text-[#ff5252] hover:text-white hover:bg-[#d5000033] transition"
                      title="Delete Player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Role and style badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00c85318] text-[#00c853] border border-[#00c85333]">
                    {player.role}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1a1d23] text-[#e0e0e0] border border-[#2a2a2e]">
                    {player.battingStyle}
                  </span>
                  {player.role !== 'Wicketkeeper' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1a1d23] text-[#909090] border border-[#2a2a2e]">
                      {player.bowlingStyle}
                    </span>
                  )}
                </div>

                {/* Career stats mini-summary */}
                <div className="grid grid-cols-4 gap-1 bg-[#0f1115] p-2 rounded-xl border border-[#2a2a2e] text-center font-mono-num">
                  <div className="p-1">
                    <span className="text-[10px] text-[#909090] block">Matches</span>
                    <span className="text-xs font-bold text-[#e0e0e0]">{stats.batting.matches}</span>
                  </div>
                  <div className="p-1">
                    <span className="text-[10px] text-[#909090] block">Runs</span>
                    <span className="text-xs font-bold text-[#00c853]">{stats.batting.runs}</span>
                  </div>
                  <div className="p-1">
                    <span className="text-[10px] text-[#909090] block">Wkts</span>
                    <span className="text-xs font-bold text-[#ffab00]">{stats.bowling.wickets}</span>
                  </div>
                  <div className="p-1">
                    <span className="text-[10px] text-[#909090] block">Avg</span>
                    <span className="text-xs font-bold text-[#e0e0e0]">
                      {stats.batting.innings > 0 ? stats.batting.average : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-[#2a2a2e] flex items-center justify-between text-[11px] text-[#909090]">
                <span>HS: {stats.batting.highScore > 0 ? `${stats.batting.highScore}${stats.batting.isHighScoreNotOut ? '*' : ''}` : '-'}</span>
                <span>Best: {stats.bowling.bestBowlingFigures !== '0/0' ? stats.bowling.bestBowlingFigures : '-'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12 bg-[#121418] rounded-2xl border border-[#2a2a2e] p-6">
          <Users className="w-12 h-12 text-[#909090] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[#e0e0e0]">No Players Found</h3>
          <p className="text-xs text-[#909090] mt-1 max-w-sm mx-auto">
            {activeTeams.length === 0
              ? 'Please add a Team first before registering players.'
              : 'Try changing your filters or add a new player to the squad.'}
          </p>
        </div>
      )}

      {/* Add / Edit Player Modal */}
      {(showAddModal || editingPlayer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-lg text-white">
                {editingPlayer ? 'Edit Player' : 'Register New Player'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPlayer(null);
                }}
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

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                  Player Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Babar Azam"
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-sm text-white placeholder-[#606060] focus:outline-none focus:border-[#00c853]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                  Team Assignment *
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-sm text-white focus:outline-none focus:border-[#00c853]"
                >
                  {activeTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                  Primary Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                        role === r
                          ? 'bg-[#00c85322] border-[#00c853] text-[#00c853]'
                          : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                    Batting Style
                  </label>
                  <select
                    value={battingStyle}
                    onChange={(e) => setBattingStyle(e.target.value as BattingStyle)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                  >
                    {BATTING_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                    Bowling Style
                  </label>
                  <select
                    value={bowlingStyle}
                    onChange={(e) => setBowlingStyle(e.target.value as BowlingStyle)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                  >
                    {BOWLING_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlayer(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs sm:text-sm font-bold shadow-md shadow-black/40 transition touch-active"
                >
                  {editingPlayer ? 'Save Changes' : 'Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Player Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#d5000022] border border-[#d5000055] text-[#ff5252] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Remove Player Roster</h3>
              <p className="text-xs text-[#e0e0e0] mt-1 leading-relaxed">
                Remove <strong className="text-white">{playerToDelete.name}</strong> from the active squad?
              </p>
              <div className="mt-2.5 p-2.5 rounded-lg bg-[#0f1115] text-[11px] text-[#00c853] border border-[#00c85344]">
                ✓ <strong>Rule Guaranteed:</strong> Historical career runs, wickets, and match records will remain permanently saved in tournament archives.
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-player"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-md shadow-black/40 transition touch-active"
              >
                Yes, Remove Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Career Stats Profile Modal */}
      {selectedPlayerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {(() => {
              const p = selectedPlayerForModal;
              const t = teams.find((tm) => tm.id === p.teamId);
              const stats = getPlayerStats(p.id);

              return (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-[#2a2a2e]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-base text-white shadow-md"
                        style={{ backgroundColor: t?.logoColor || '#00c853' }}
                      >
                        {p.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-white">{p.name}</h3>
                        <p className="text-xs text-[#909090]">
                          {t?.name} • {p.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPlayerForModal(null)}
                      className="p-1 rounded-lg text-[#909090] hover:text-white hover:bg-[#1a1d23]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Batting Career */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00c853] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Batting Statistics</span>
                    </h4>
                    <div className="grid grid-cols-4 gap-2 bg-[#0f1115] p-3 rounded-xl border border-[#2a2a2e] font-mono-num text-center">
                      <div>
                        <span className="text-[10px] text-[#909090] block">Innings</span>
                        <span className="text-sm font-bold text-white">{stats.batting.innings}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Runs</span>
                        <span className="text-sm font-bold text-[#00c853]">{stats.batting.runs}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Avg</span>
                        <span className="text-sm font-bold text-white">{stats.batting.average}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Strike Rate</span>
                        <span className="text-sm font-bold text-[#00c853]">{stats.batting.strikeRate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">High Score</span>
                        <span className="text-sm font-bold text-white">
                          {stats.batting.highScore}
                          {stats.batting.isHighScoreNotOut ? '*' : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Fours (4s)</span>
                        <span className="text-sm font-bold text-[#e0e0e0]">{stats.batting.fours}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Sixes (6s)</span>
                        <span className="text-sm font-bold text-[#ffab00]">{stats.batting.sixes}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">50s / 100s</span>
                        <span className="text-sm font-bold text-white">
                          {stats.batting.fifties} / {stats.batting.hundreds}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bowling Career */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffab00] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Bowling Statistics</span>
                    </h4>
                    <div className="grid grid-cols-4 gap-2 bg-[#0f1115] p-3 rounded-xl border border-[#2a2a2e] font-mono-num text-center">
                      <div>
                        <span className="text-[10px] text-[#909090] block">Overs</span>
                        <span className="text-sm font-bold text-white">{stats.bowling.oversFormatted}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Maidens</span>
                        <span className="text-sm font-bold text-white">{stats.bowling.maidens}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Runs Conceded</span>
                        <span className="text-sm font-bold text-[#e0e0e0]">{stats.bowling.runsConceded}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Wickets</span>
                        <span className="text-sm font-bold text-[#b388ff]">{stats.bowling.wickets}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Economy</span>
                        <span className="text-sm font-bold text-white">{stats.bowling.economyRate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Bowl Avg</span>
                        <span className="text-sm font-bold text-white">{stats.bowling.average}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-[#909090] block">Best Figures</span>
                        <span className="text-sm font-bold text-[#b388ff]">{stats.bowling.bestBowlingFigures}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fielding stats */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#909090]">
                      Fielding Dismissals
                    </h4>
                    <div className="grid grid-cols-3 gap-2 bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e] text-center font-mono-num">
                      <div>
                        <span className="text-[10px] text-[#909090] block">Catches</span>
                        <span className="text-xs font-bold text-white">{stats.fielding.catches}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Run Outs</span>
                        <span className="text-xs font-bold text-white">{stats.fielding.runOuts}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#909090] block">Stumpings</span>
                        <span className="text-xs font-bold text-white">{stats.fielding.stumpings}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[#2a2a2e]">
                    <button
                      onClick={() => setSelectedPlayerForModal(null)}
                      className="px-4 py-2 rounded-xl bg-[#1a1d23] hover:bg-[#25282e] text-white text-xs font-semibold border border-[#2a2a2e] transition"
                    >
                      Close Profile
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
