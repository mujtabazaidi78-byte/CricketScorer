import React, { useState } from 'react';
import { useCricketStore } from '../../store/cricketStore';
import { CricketMatch, MatchInnings } from '../../types';
import {
  X,
  Trophy,
  Shield,
  Activity,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface ScorecardModalProps {
  matchId: string;
  onClose: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({ matchId, onClose }) => {
  const matches = useCricketStore((state) => state.matches);
  const teams = useCricketStore((state) => state.teams);
  const players = useCricketStore((state) => state.players);
  const deleteMatch = useCricketStore((state) => state.deleteMatch);

  const match = matches.find((m) => m.id === matchId);
  const [selectedInningsTab, setSelectedInningsTab] = useState<0 | 1>(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!match) return null;

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  const getTeamName = (id: string) => {
    const t = teams.find((item) => item.id === id);
    return t ? (t.isDeleted ? `${t.name} (Deleted)` : t.name) : 'Team';
  };

  const getPlayerName = (id: string) => {
    const p = players.find((item) => item.id === id);
    return p ? p.name : 'Unknown';
  };

  const currentInnings: MatchInnings = match.innings[selectedInningsTab];
  const battingTeam = teams.find((t) => t.id === currentInnings.battingTeamId);
  const bowlingTeam = teams.find((t) => t.id === currentInnings.bowlingTeamId);

  const oversFormatted = `${Math.floor(currentInnings.legalBallsBowled / 6)}.${currentInnings.legalBallsBowled % 6}`;
  const runRate =
    currentInnings.legalBallsBowled > 0
      ? ((currentInnings.totalRuns / currentInnings.legalBallsBowled) * 6).toFixed(2)
      : '0.00';

  const batsmenList = Object.values(currentInnings.batsmenRecords).sort(
    (a, b) => a.battingOrder - b.battingOrder
  );
  const bowlersList = Object.values(currentInnings.bowlersRecords);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-2xl rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-white">Full Match Scorecard</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  match.status === 'Live'
                    ? 'bg-[#d5000022] text-[#ff5252] border border-[#d5000055] animate-pulse'
                    : 'bg-[#00c85315] text-[#00c853] border border-[#00c85355]'
                }`}
              >
                {match.status}
              </span>
            </div>
            <p className="text-xs text-[#909090] mt-0.5">
              {getTeamName(match.teamAId)} vs {getTeamName(match.teamBId)} • {match.oversLimit} Overs Match
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#909090] hover:text-white hover:bg-[#25282e] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Result banner if finished */}
        {match.resultSummary && (
          <div className="p-3 rounded-xl bg-[#00c85315] border border-[#00c85344] text-[#00c853] text-xs font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 shrink-0 text-[#ffab00]" />
            <span>{match.resultSummary}</span>
          </div>
        )}

        {/* Toss Info */}
        <div className="text-[11px] text-[#909090] bg-[#0f1115] px-3 py-1.5 rounded-xl border border-[#2a2a2e]">
          🪙 Toss: <strong>{getTeamName(match.tossWinnerTeamId)}</strong> won the toss and elected to{' '}
          <strong>{match.tossDecision}</strong> first.
          {match.dlsApplied && (
            <span className="text-[#ffab00] ml-2 font-medium">
              🌧️ DLS target revised to {match.target} runs.
            </span>
          )}
        </div>

        {/* Innings Tabs */}
        <div className="flex gap-2 border-b border-[#2a2a2e] pb-2">
          <button
            onClick={() => setSelectedInningsTab(0)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              selectedInningsTab === 0
                ? 'bg-[#00c85315] text-[#00c853] border border-[#00c853]'
                : 'text-[#909090] hover:bg-[#0f1115]'
            }`}
          >
            <span>1st Innings: {getTeamName(match.innings[0].battingTeamId)}</span>
            <span className="font-mono-num font-bold">
              {match.innings[0].totalRuns}/{match.innings[0].wickets} (
              {Math.floor(match.innings[0].legalBallsBowled / 6)}.
              {match.innings[0].legalBallsBowled % 6})
            </span>
          </button>

          <button
            onClick={() => setSelectedInningsTab(1)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
              selectedInningsTab === 1
                ? 'bg-[#00c85315] text-[#00c853] border border-[#00c853]'
                : 'text-[#909090] hover:bg-[#0f1115]'
            }`}
          >
            <span>2nd Innings: {getTeamName(match.innings[1].battingTeamId)}</span>
            <span className="font-mono-num font-bold">
              {match.innings[1].totalRuns}/{match.innings[1].wickets} (
              {Math.floor(match.innings[1].legalBallsBowled / 6)}.
              {match.innings[1].legalBallsBowled % 6})
            </span>
          </button>
        </div>

        {/* Active Innings Score Banner */}
        <div className="flex items-center justify-between bg-[#0f1115] p-3 rounded-xl border border-[#2a2a2e]">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: battingTeam?.logoColor || '#00c853' }}
            />
            <h4 className="font-display font-bold text-sm text-white">{battingTeam?.name}</h4>
          </div>
          <div className="text-right font-mono-num">
            <span className="text-lg font-black text-[#00c853]">
              {currentInnings.totalRuns}/{currentInnings.wickets}
            </span>
            <span className="text-xs text-[#909090] ml-2">
              ({oversFormatted} / {currentInnings.oversLimit} ov) • CRR: {runRate}
            </span>
          </div>
        </div>

        {/* Batting Card Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#909090] mb-2">
            Batting Scorecard
          </h4>
          <div className="overflow-x-auto rounded-xl border border-[#2a2a2e] bg-[#0f1115]">
            <table className="w-full text-xs font-mono-num">
              <thead>
                <tr className="text-[#909090] text-[11px] border-b border-[#2a2a2e] bg-[#14161b] font-sans">
                  <th className="text-left py-2 px-3 font-semibold">Batter</th>
                  <th className="text-left py-2 px-2 font-semibold">Dismissal</th>
                  <th className="text-right py-2 px-2 font-semibold text-white">R</th>
                  <th className="text-right py-2 px-2 font-semibold">B</th>
                  <th className="text-right py-2 px-2 font-semibold">4s</th>
                  <th className="text-right py-2 px-2 font-semibold">6s</th>
                  <th className="text-right py-2 px-3 font-semibold text-[#00c853]">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2e]/60">
                {batsmenList.map((bat) => (
                  <tr key={bat.playerId} className="hover:bg-[#25282e] transition">
                    <td className="py-2.5 px-3 font-sans font-medium text-white">
                      {getPlayerName(bat.playerId)}
                      {!bat.isOut && <span className="text-[#00c853] ml-1 font-bold">*</span>}
                    </td>
                    <td className="py-2.5 px-2 font-sans text-[11px] text-[#909090]">
                      {bat.isOut ? (
                        bat.dismissal?.description || 'Out'
                      ) : (
                        <span className="text-[#00c853] font-semibold">not out</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-white text-sm">
                      {bat.runs}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#909090]">{bat.balls}</td>
                    <td className="py-2.5 px-2 text-right text-[#e0e0e0]">{bat.fours}</td>
                    <td className="py-2.5 px-2 text-right text-[#ffab00] font-semibold">
                      {bat.sixes}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#00c853] font-semibold">
                      {bat.strikeRate}
                    </td>
                  </tr>
                ))}
                {batsmenList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-[#909090] italic">
                      No batsmen records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extras & Totals Breakdown */}
        <div className="bg-[#0f1115] p-3 rounded-xl border border-[#2a2a2e] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="text-[#909090]">
            <strong className="text-[#e0e0e0]">Extras: </strong>
            <span className="font-mono-num font-bold text-white">{currentInnings.extras.total}</span>{' '}
            (b {currentInnings.extras.byes}, lb {currentInnings.extras.legByes}, w{' '}
            {currentInnings.extras.wides}, nb {currentInnings.extras.noBalls})
          </div>
          <div className="text-[#909090]">
            <strong className="text-[#e0e0e0]">Total: </strong>
            <span className="font-mono-num font-bold text-[#00c853] text-sm">
              {currentInnings.totalRuns}/{currentInnings.wickets}
            </span>{' '}
            ({oversFormatted} Overs, RR: {runRate})
          </div>
        </div>

        {/* Fall of Wickets */}
        {currentInnings.fallOfWickets.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#909090] mb-1.5">
              Fall of Wickets
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-mono-num bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]">
              {currentInnings.fallOfWickets.map((fow) => (
                <div
                  key={fow.wicketNumber}
                  className="bg-[#1a1d23] px-2.5 py-1 rounded-lg border border-[#2a2a2e] text-[#e0e0e0] flex items-center gap-1.5"
                >
                  <span className="font-bold text-[#00c853]">
                    {fow.teamScore}-{fow.wicketNumber}
                  </span>
                  <span className="text-[11px] text-[#909090]">({fow.batsmanName}, {fow.overs} ov)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bowling Card Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#909090] mb-2">
            Bowling Figures
          </h4>
          <div className="overflow-x-auto rounded-xl border border-[#2a2a2e] bg-[#0f1115]">
            <table className="w-full text-xs font-mono-num">
              <thead>
                <tr className="text-[#909090] text-[11px] border-b border-[#2a2a2e] bg-[#14161b] font-sans">
                  <th className="text-left py-2 px-3 font-semibold">Bowler</th>
                  <th className="text-right py-2 px-2 font-semibold">O</th>
                  <th className="text-right py-2 px-2 font-semibold">M</th>
                  <th className="text-right py-2 px-2 font-semibold">R</th>
                  <th className="text-right py-2 px-2 font-semibold text-[#ffab00]">W</th>
                  <th className="text-right py-2 px-2 font-semibold">Econ</th>
                  <th className="text-right py-2 px-3 font-semibold text-[#909090]">WD / NB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2e]/60">
                {bowlersList.map((bowl) => (
                  <tr key={bowl.playerId} className="hover:bg-[#25282e] transition">
                    <td className="py-2.5 px-3 font-sans font-medium text-white">
                      {getPlayerName(bowl.playerId)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#e0e0e0]">
                      {Math.floor(bowl.ballsBowled / 6)}.{bowl.ballsBowled % 6}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#909090]">{bowl.maidens}</td>
                    <td className="py-2.5 px-2 text-right text-[#e0e0e0]">{bowl.runsConceded}</td>
                    <td className="py-2.5 px-2 text-right font-black text-[#ffab00] text-sm">
                      {bowl.wickets}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#00c853] font-semibold">
                      {bowl.economyRate}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#909090] text-[11px]">
                      {bowl.wides} / {bowl.noBalls}
                    </td>
                  </tr>
                ))}
                {bowlersList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-[#909090] italic">
                      No bowlers bowled yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2e]">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 rounded-xl bg-[#1a1d23] hover:bg-[#d5000022] text-[#ff5252] text-xs font-semibold transition border border-[#2a2a2e] hover:border-[#d5000055] flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Match</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#25282e] hover:bg-[#32363e] text-white text-xs font-semibold transition border border-[#2a2a2e]"
          >
            Close Scorecard
          </button>
        </div>

        {/* Delete Match Confirmation Sub-modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d5000022] border border-[#d5000044] text-[#ff5252] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Delete Match Record?</h4>
                  <p className="text-[11px] text-[#909090]">This cannot be recovered.</p>
                </div>
              </div>

              <p className="text-xs text-[#e0e0e0] leading-relaxed bg-[#0f1115] p-3 rounded-xl border border-[#2a2a2e]">
                Are you sure you want to delete the match between <strong className="text-white">{getTeamName(match.teamAId)}</strong> and <strong className="text-white">{getTeamName(match.teamBId)}</strong>? All ball-by-ball records will be deleted and stats adjusted.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#25282e] hover:bg-[#32363e] text-[#e0e0e0] text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteMatch(match.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-black/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
