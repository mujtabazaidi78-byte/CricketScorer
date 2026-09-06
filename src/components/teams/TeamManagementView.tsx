import React, { useState } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { Team } from '../../types';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Users,
  AlertTriangle,
  X,
  History,
  Check,
} from 'lucide-react';

const COLOR_PRESETS = [
  '#0284c7', // Sky Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#eab308', // Yellow
];

export const TeamManagementView: React.FC = () => {
  const teams = useCricketStore((state) => state.teams);
  const players = useCricketStore((state) => state.players);
  const addTeam = useCricketStore((state) => state.addTeam);
  const updateTeam = useCricketStore((state) => state.updateTeam);
  const deleteTeam = useCricketStore((state) => state.deleteTeam);
  const setActiveTab = useCricketStore((state) => state.setActiveTab);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [logoColor, setLogoColor] = useState(COLOR_PRESETS[0]);
  const [formError, setFormError] = useState('');

  const activeTeams = teams.filter((t) => !t.isDeleted);
  const deletedTeams = teams.filter((t) => t.isDeleted);

  const handleOpenAdd = () => {
    setName('');
    setShortCode('');
    setHomeCity('');
    setLogoColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setShortCode(team.shortCode);
    setHomeCity(team.homeCity);
    setLogoColor(team.logoColor);
    setFormError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Team Name is required');
      return;
    }
    if (!shortCode.trim()) {
      setFormError('Short Code is required');
      return;
    }
    if (shortCode.length > 5) {
      setFormError('Short Code should be 3 to 5 letters (e.g. "KAR")');
      return;
    }

    if (editingTeam) {
      updateTeam(editingTeam.id, {
        name: name.trim(),
        shortCode: shortCode.trim().toUpperCase(),
        homeCity: homeCity.trim(),
        logoColor,
      });
      setEditingTeam(null);
    } else {
      addTeam({
        name: name.trim(),
        shortCode: shortCode.trim().toUpperCase(),
        homeCity: homeCity.trim(),
        logoColor,
      });
      setShowAddModal(false);
    }
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete.id);
      setTeamToDelete(null);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121418] p-4 rounded-2xl border border-[#2a2a2e] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00c853]" />
            <span>Team Management</span>
          </h2>
          <p className="text-xs text-[#909090] mt-0.5">
            Manage clubs, franchises, and regional squads. Deleting preserves historical match data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {deletedTeams.length > 0 && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
                showArchived
                  ? 'bg-[#1a1d23] border-[#3a3d46] text-white'
                  : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{showArchived ? 'Hide Inactive' : `Archived (${deletedTeams.length})`}</span>
            </button>
          )}

          <button
            id="btn-add-team"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black font-bold text-xs sm:text-sm shadow-md shadow-black/40 transition touch-active"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </button>
        </div>
      </div>

      {/* Active Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activeTeams.map((team) => {
          const squad = players.filter((p) => p.teamId === team.id && !p.isDeleted);
          return (
            <div
              key={team.id}
              id={`team-card-${team.id}`}
              className="bg-[#121418] rounded-2xl border border-[#2a2a2e] p-4 hover:border-[#3a3d46] transition flex flex-col justify-between relative overflow-hidden group shadow-sm"
            >
              {/* Color accent header */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.logoColor }}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg text-white shadow-inner"
                      style={{ backgroundColor: team.logoColor }}
                    >
                      {team.shortCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-[#00c853] transition">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#909090] mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#909090]" />
                          {team.homeCity || 'Cricket Ground'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(team)}
                      className="p-1.5 rounded-lg text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
                      title="Edit Team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTeamToDelete(team)}
                      className="p-1.5 rounded-lg text-[#ff5252] hover:text-white hover:bg-[#d5000033] transition"
                      title="Delete Team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Squad quick preview */}
                <div className="bg-[#0f1115] rounded-xl p-2.5 border border-[#2a2a2e] mb-3">
                  <div className="flex items-center justify-between text-xs text-[#909090] mb-1.5">
                    <span className="flex items-center gap-1 font-medium text-[#e0e0e0]">
                      <Users className="w-3.5 h-3.5 text-[#00c853]" />
                      Squad Members
                    </span>
                    <span className="font-mono-num text-[#00c853] font-semibold">{squad.length} Players</span>
                  </div>
                  {squad.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {squad.slice(0, 4).map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] bg-[#1a1d23] px-2 py-0.5 rounded text-[#e0e0e0] border border-[#2a2a2e]"
                        >
                          {p.name.split(' ')[0]}
                        </span>
                      ))}
                      {squad.length > 4 && (
                        <span className="text-[10px] text-[#909090] px-1 py-0.5">+{squad.length - 4} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#909090] italic">No players registered yet</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2a2e] flex items-center justify-between">
                <span className="text-[11px] text-[#909090] uppercase tracking-wider font-semibold">
                  Code: {team.shortCode}
                </span>
                <button
                  onClick={() => setActiveTab('players')}
                  className="text-xs text-[#00c853] hover:underline font-bold"
                >
                  Manage Squad →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeTeams.length === 0 && (
        <div className="text-center py-12 bg-[#121418] rounded-2xl border border-[#2a2a2e] p-6">
          <Shield className="w-12 h-12 text-[#909090] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold text-[#e0e0e0]">No Active Teams</h3>
          <p className="text-xs text-[#909090] mt-1 max-w-sm mx-auto">
            Click "Add Team" to register your local clubs or school cricket teams.
          </p>
        </div>
      )}

      {/* Archived / Deleted Teams Section (Rule compliance proof) */}
      {showArchived && deletedTeams.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#2a2a2e]">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[#ffab00]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#e0e0e0]">
              Archived & Historical Teams
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#ffab0022] text-[#ffab00] border border-[#ffab0044]">
              Match Stats Preserved
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deletedTeams.map((team) => (
              <div
                key={team.id}
                className="bg-[#0f1115] rounded-xl border border-[#2a2a2e] p-3.5 flex items-center justify-between opacity-70"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white"
                    style={{ backgroundColor: team.logoColor }}
                  >
                    {team.shortCode}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#e0e0e0]">{team.name} (Deleted)</h4>
                    <p className="text-[11px] text-[#909090]">{team.homeCity}</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#909090] font-mono-num">ID: {team.shortCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {(showAddModal || editingTeam) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-lg text-white">
                {editingTeam ? 'Edit Team Details' : 'Register New Team'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTeam(null);
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
                  Team Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Karachi Strikers"
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-sm text-white placeholder-[#606060] focus:outline-none focus:border-[#00c853]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                    Short Code (2-4 letters) *
                  </label>
                  <input
                    type="text"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                    placeholder="e.g., KAR"
                    maxLength={5}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-sm text-white uppercase placeholder-[#606060] font-display font-bold focus:outline-none focus:border-[#00c853]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                    Home City / Ground
                  </label>
                  <input
                    type="text"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    placeholder="e.g., Karachi"
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-sm text-white placeholder-[#606060] focus:outline-none focus:border-[#00c853]"
                  />
                </div>
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1.5">
                  Team Brand Color & Badge
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setLogoColor(color)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                        logoColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121418] scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {logoColor === color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    value={logoColor}
                    onChange={(e) => setLogoColor(e.target.value)}
                    className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-[#2a2a2e]"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Badge Preview */}
              <div className="bg-[#0f1115] rounded-xl p-3 border border-[#2a2a2e] flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white"
                  style={{ backgroundColor: logoColor }}
                >
                  {shortCode || 'TM'}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{name || 'Preview Team Name'}</span>
                  <span className="text-[11px] text-[#909090]">{homeCity || 'City Arena'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTeam(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs sm:text-sm font-bold shadow-md shadow-black/40 transition touch-active"
                >
                  {editingTeam ? 'Save Changes' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Adheres strictly to user rule) */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#d5000022] border border-[#d5000055] text-[#ff5252] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Delete Team Confirmation</h3>
              <p className="text-xs text-[#e0e0e0] mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{teamToDelete.name}</strong>?
              </p>
              <div className="mt-2.5 p-2.5 rounded-lg bg-[#0f1115] text-[11px] text-[#00c853] border border-[#00c85344]">
                ✓ <strong>Rule Guaranteed:</strong> Historical match records, scorecards, and player career stats will <strong>NOT</strong> be deleted. They will display as "{teamToDelete.name} (Deleted)".
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
              <button
                onClick={() => setTeamToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#909090] hover:text-white hover:bg-[#1a1d23] transition"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-team"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-md shadow-black/40 transition touch-active"
              >
                Yes, Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
