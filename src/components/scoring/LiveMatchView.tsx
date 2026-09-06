import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useCricketStore } from '../../store/cricketStore';
import {
  DismissalType,
  ExtraType,
  BallWicket,
  CricketMatch,
} from '../../types';
import {
  Radio,
  Play,
  RotateCcw,
  CloudRain,
  Calculator,
  UserCheck,
  RefreshCw,
  Trophy,
  AlertCircle,
  Flame,
  ArrowRightLeft,
  FileText,
  Clock,
  Shield,
  Zap,
  Sliders,
  Plus,
  Minus,
  X,
} from 'lucide-react';
import { ScorecardModal } from './ScorecardModal';

export const LiveMatchView: React.FC = () => {
  const matches = useCricketStore((state) => state.matches);
  const activeMatchId = useCricketStore((state) => state.activeMatchId);
  const setActiveMatchId = useCricketStore((state) => state.setActiveMatchId);
  const teams = useCricketStore((state) => state.teams);
  const players = useCricketStore((state) => state.players);
  const tournaments = useCricketStore((state) => state.tournaments);
  const startNewMatch = useCricketStore((state) => state.startNewMatch);
  const recordBall = useCricketStore((state) => state.recordBall);
  const rotateStrike = useCricketStore((state) => state.rotateStrike);
  const setBowler = useCricketStore((state) => state.setBowler);
  const setNextBatsman = useCricketStore((state) => state.setNextBatsman);
  const undoLastBall = useCricketStore((state) => state.undoLastBall);
  const endInnings = useCricketStore((state) => state.endInnings);
  const startSecondInnings = useCricketStore((state) => state.startSecondInnings);
  const toggleRainDelay = useCricketStore((state) => state.toggleRainDelay);
  const applyDLS = useCricketStore((state) => state.applyDLS);
  const updateMatchOversLimit = useCricketStore((state) => state.updateMatchOversLimit);
  const addToast = useCricketStore((state) => state.addToast);
  const setActiveTab = useCricketStore((state) => state.setActiveTab);
  const createQuickMatchTeams = useCricketStore((state) => state.createQuickMatchTeams);

  const activeTeams = teams.filter((t) => !t.isDeleted);

  // Active match reference
  const currentMatch = matches.find((m) => m.id === activeMatchId);

  // Modals state
  const [showStartWizard, setShowStartWizard] = useState(!currentMatch || currentMatch.status === 'Completed');
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showChangeBowlerModal, setShowChangeBowlerModal] = useState(false);
  const [showNextBatsmanModal, setShowNextBatsmanModal] = useState(false);
  const [showDLSModal, setShowDLSModal] = useState(false);
  const [showSecondInningsModal, setShowSecondInningsModal] = useState(false);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [showAdjustOversModal, setShowAdjustOversModal] = useState(false);

  // Start match wizard state
  const [wizardTournamentId, setWizardTournamentId] = useState(tournaments[0]?.id || '');
  const [wizardTeamA, setWizardTeamA] = useState(activeTeams[0]?.id || '');
  const [wizardTeamB, setWizardTeamB] = useState(activeTeams[1]?.id || '');
  const [wizardOvers, setWizardOvers] = useState(
    tournaments[0]?.oversPerInnings || 5
  );
  const [wizardTossWinner, setWizardTossWinner] = useState(activeTeams[0]?.id || '');
  const [wizardTossDecision, setWizardTossDecision] = useState<'Bat' | 'Bowl'>('Bat');
  const [wizardStriker, setWizardStriker] = useState('');
  const [wizardNonStriker, setWizardNonStriker] = useState('');
  const [wizardBowler, setWizardBowler] = useState('');

  // Live match custom overs adjustment state
  const [adjustedOvers, setAdjustedOvers] = useState(currentMatch?.oversLimit || 20);
  const [customAdjustedTarget, setCustomAdjustedTarget] = useState<number | ''>('');

  // Wicket modal state
  const [wicketBatsmanId, setWicketBatsmanId] = useState('');
  const [wicketType, setWicketType] = useState<DismissalType>('Bowled');
  const [wicketFielderId, setWicketFielderId] = useState('');
  const [incomingBatsmanId, setIncomingBatsmanId] = useState('');

  // Next batsman standalone modal state
  const [nextBatPosition, setNextBatPosition] = useState<'striker' | 'nonStriker'>('striker');
  const [selectedNextBatId, setSelectedNextBatId] = useState('');

  // Change Bowler modal state
  const [selectedNewBowlerId, setSelectedNewBowlerId] = useState('');

  // DLS modal state
  const [dlsRevisedOvers, setDlsRevisedOvers] = useState(5);
  const [dlsTargetReduction, setDlsTargetReduction] = useState(0);

  // 2nd innings launch state
  const [secStriker, setSecStriker] = useState('');
  const [secNonStriker, setSecNonStriker] = useState('');
  const [secBowler, setSecBowler] = useState('');

  // Helper names
  const getTeam = (id: string) => teams.find((t) => t.id === id);
  const getPlayer = (id: string) => players.find((p) => p.id === id);

  // When wizard teams change, update potential players
  const battingTeamIdForWizard =
    wizardTossWinner === wizardTeamA
      ? wizardTossDecision === 'Bat' ? wizardTeamA : wizardTeamB
      : wizardTossDecision === 'Bat' ? wizardTeamB : wizardTeamA;
  const bowlingTeamIdForWizard = battingTeamIdForWizard === wizardTeamA ? wizardTeamB : wizardTeamA;

  const wizardBattingSquad = players.filter((p) => p.teamId === battingTeamIdForWizard && !p.isDeleted);
  const wizardBowlingSquad = players.filter((p) => p.teamId === bowlingTeamIdForWizard && !p.isDeleted);

  const handleLaunchMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardTeamA || !wizardTeamB || wizardTeamA === wizardTeamB) {
      addToast({ type: 'error', title: 'Invalid Teams', description: 'Please select two different teams.' });
      return;
    }
    const striker = wizardStriker || wizardBattingSquad[0]?.id;
    const nonStriker = wizardNonStriker || wizardBattingSquad[1]?.id;
    const bowler = wizardBowler || wizardBowlingSquad[0]?.id;

    if (!striker || !nonStriker || striker === nonStriker) {
      addToast({ type: 'error', title: 'Invalid Batsmen', description: 'Please select two distinct opening batsmen.' });
      return;
    }
    if (!bowler) {
      addToast({ type: 'error', title: 'Invalid Bowler', description: 'Please select an opening bowler.' });
      return;
    }

    startNewMatch({
      tournamentId: wizardTournamentId || 'friendly-series',
      teamAId: wizardTeamA,
      teamBId: wizardTeamB,
      oversLimit: wizardOvers,
      tossWinnerTeamId: wizardTossWinner || wizardTeamA,
      tossDecision: wizardTossDecision,
      strikerId: striker,
      nonStrikerId: nonStriker,
      openingBowlerId: bowler,
    });

    setShowStartWizard(false);
  };

  // If no match active
  if (!currentMatch || showStartWizard) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-20 md:pb-6">
        <div className="bg-[#1a1d23] border border-[#2a2a2e] p-5 rounded-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#00c85311] text-[#00c853] border border-[#00c85333] flex items-center justify-center">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Start New Match</h3>
                <p className="text-xs text-[#909090]">Setup fixtures, custom overs, and initialize live touch scoring</p>
              </div>
            </div>
            {currentMatch && (
              <button
                onClick={() => setShowStartWizard(false)}
                className="text-xs text-[#909090] hover:text-white px-3 py-1.5 rounded-lg bg-[#25282e] border border-[#2a2a2e]"
              >
                Back to Match
              </button>
            )}
          </div>

          {activeTeams.length < 2 ? (
            <div className="text-center py-8 px-3 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00c85318] border border-[#00c85333] text-[#00c853] flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Teams Registered Yet</h4>
                <p className="text-xs text-[#909090] mt-1 max-w-sm mx-auto leading-relaxed">
                  To score a match, you need at least 2 teams with player squads. You can register your own custom clubs in the Teams Hub or create quick teams below.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('teams')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black font-bold text-xs shadow-md transition"
                >
                  + Add Teams in Teams Hub
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const { teamAId, teamBId } = createQuickMatchTeams();
                    setWizardTeamA(teamAId);
                    setWizardTeamB(teamBId);
                    setWizardTossWinner(teamAId);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0f1115] hover:bg-[#1a1d23] border border-[#2a2a2e] text-[#e0e0e0] font-semibold text-xs transition"
                >
                  Generate Quick Teams (11v11)
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLaunchMatch} className="space-y-4">
              {/* Tournament select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#909090] uppercase tracking-wider">
                    Select Tournament
                  </label>
                  {tournaments.find((t) => t.id === wizardTournamentId) ? (
                    <span className="text-[11px] text-[#00c853] font-medium">
                      {tournaments.find((t) => t.id === wizardTournamentId)?.format} Format (
                      {tournaments.find((t) => t.id === wizardTournamentId)?.oversPerInnings} ov)
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#909090] font-medium">
                      Custom Match
                    </span>
                  )}
                </div>
                <select
                  value={wizardTournamentId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setWizardTournamentId(tId);
                    const selectedTour = tournaments.find((t) => t.id === tId);
                    if (selectedTour && selectedTour.oversPerInnings) {
                      setWizardOvers(selectedTour.oversPerInnings);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                >
                  <option value="">Friendly / Bilateral Series (No Tournament)</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.format} • {t.oversPerInnings} Overs)
                    </option>
                  ))}
                </select>
              </div>

            {/* Teams and Overs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Team A (Home)</label>
                <select
                  value={wizardTeamA}
                  onChange={(e) => {
                    setWizardTeamA(e.target.value);
                    if (wizardTossWinner === wizardTeamA) setWizardTossWinner(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                >
                  {activeTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Team B (Away)</label>
                <select
                  value={wizardTeamB}
                  onChange={(e) => setWizardTeamB(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                >
                  {activeTeams
                    .filter((t) => t.id !== wizardTeamA)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortCode})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Overs Limit & Custom Overs Setup */}
            <div className="space-y-2.5 bg-[#0f1115] p-3.5 rounded-xl border border-[#2a2a2e]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#e0e0e0] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00c853]" />
                  <span>Overs Limit per Innings</span>
                </label>
                <span className="text-xs font-mono-num font-bold text-[#00c853] bg-[#00c85315] border border-[#00c85333] px-2.5 py-0.5 rounded-lg">
                  {wizardOvers} {wizardOvers === 1 ? 'Over' : 'Overs'} ({wizardOvers * 6} balls)
                </span>
              </div>

              {/* Tournament default match quick apply */}
              {tournaments.find((t) => t.id === wizardTournamentId) && (
                <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#1a1d23] border border-[#2a2a2e] text-[11px]">
                  <span className="text-[#909090]">
                    Tournament default:{' '}
                    <strong className="text-white">
                      {tournaments.find((t) => t.id === wizardTournamentId)?.oversPerInnings} Overs
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const tOvers = tournaments.find((t) => t.id === wizardTournamentId)?.oversPerInnings || 20;
                      setWizardOvers(tOvers);
                    }}
                    className="text-[#00c853] hover:underline font-semibold"
                  >
                    Reset to Default
                  </button>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[2, 4, 6, 8, 10, 15, 20, 50].map((ov) => (
                  <button
                    type="button"
                    key={ov}
                    onClick={() => setWizardOvers(ov)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      wizardOvers === ov
                        ? 'bg-[#00c85322] border-[#00c853] text-[#00c853]'
                        : 'bg-[#1a1d23] border-[#2a2a2e] text-[#909090] hover:text-white hover:bg-[#25282e]'
                    }`}
                  >
                    {ov} ov
                  </button>
                ))}
              </div>

              {/* Custom Overs Direct Input & Stepper */}
              <div className="pt-2 border-t border-[#2a2a2e]/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#909090]">
                    Custom Overs (Type any value from 1 to 100):
                  </span>
                  <span className="text-[10px] text-[#00c853] font-medium">
                    {wizardOvers <= 4
                      ? '⚡ Super Over / Box Cricket'
                      : wizardOvers <= 8
                      ? '🏏 Tape-ball Quick Match'
                      : wizardOvers <= 12
                      ? '🔥 T10 League Format'
                      : wizardOvers <= 20
                      ? '⭐ T20 Standard'
                      : wizardOvers <= 50
                      ? '🏆 One Day (ODI)'
                      : '⏳ Custom Long Format'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#1a1d23] border border-[#2a2a2e] rounded-xl overflow-hidden focus-within:border-[#00c853] flex-1">
                    <button
                      type="button"
                      onClick={() => setWizardOvers((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-2 text-[#909090] hover:text-white hover:bg-[#25282e] transition"
                      title="Decrease 1 Over"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={wizardOvers}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setWizardOvers(Math.max(1, Math.min(100, val)));
                        } else {
                          setWizardOvers(1);
                        }
                      }}
                      className="w-full text-center bg-transparent py-2 text-sm font-bold font-mono-num text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setWizardOvers((prev) => Math.min(100, prev + 1))}
                      className="px-3 py-2 text-[#909090] hover:text-white hover:bg-[#25282e] transition"
                      title="Increase 1 Over"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick delta buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setWizardOvers((prev) => Math.max(1, prev - 5))}
                      className="px-2.5 py-2 rounded-xl bg-[#1a1d23] border border-[#2a2a2e] text-[11px] font-bold text-[#909090] hover:text-white hover:bg-[#25282e]"
                      title="Subtract 5 overs"
                    >
                      -5 ov
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardOvers((prev) => Math.min(100, prev + 5))}
                      className="px-2.5 py-2 rounded-xl bg-[#1a1d23] border border-[#2a2a2e] text-[11px] font-bold text-[#909090] hover:text-white hover:bg-[#25282e]"
                      title="Add 5 overs"
                    >
                      +5 ov
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#808080] mt-1.5 px-0.5">
                  <span>Deliveries: <strong className="text-[#e0e0e0] font-mono-num">{wizardOvers * 6} legal balls</strong></span>
                  <span>Max per Bowler: <strong className="text-[#e0e0e0] font-mono-num">{Math.ceil(wizardOvers / 5)} ov ({Math.ceil(wizardOvers / 5) * 6} balls)</strong></span>
                </div>
              </div>
            </div>

            {/* Toss */}
            <div className="bg-[#0f1115] p-3 rounded-xl border border-[#2a2a2e] space-y-2.5">
              <label className="block text-xs font-bold text-[#00c853] uppercase tracking-wider">🪙 Toss Selection</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={wizardTossWinner}
                  onChange={(e) => setWizardTossWinner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a1d23] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                >
                  <option value={wizardTeamA}>{getTeam(wizardTeamA)?.name || 'Team A'}</option>
                  <option value={wizardTeamB}>{getTeam(wizardTeamB)?.name || 'Team B'}</option>
                </select>
                <select
                  value={wizardTossDecision}
                  onChange={(e) => setWizardTossDecision(e.target.value as 'Bat' | 'Bowl')}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a1d23] border border-[#2a2a2e] text-xs text-white focus:outline-none focus:border-[#00c853]"
                >
                  <option value="Bat">Elected to Bat</option>
                  <option value="Bowl">Elected to Bowl</option>
                </select>
              </div>
            </div>

            {/* Opening Lineup */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#909090] uppercase tracking-wider">Opening Batsmen & Bowler</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-[#909090] block mb-1">Striker (Batter 1)</span>
                  <select
                    value={wizardStriker || wizardBattingSquad[0]?.id || ''}
                    onChange={(e) => setWizardStriker(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white"
                  >
                    {wizardBattingSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-[#909090] block mb-1">Non-Striker (Batter 2)</span>
                  <select
                    value={wizardNonStriker || wizardBattingSquad[1]?.id || ''}
                    onChange={(e) => setWizardNonStriker(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white"
                  >
                    {wizardBattingSquad
                      .filter((p) => p.id !== (wizardStriker || wizardBattingSquad[0]?.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-[#909090] block mb-1">Opening Bowler</span>
                  <select
                    value={wizardBowler || wizardBowlingSquad[0]?.id || ''}
                    onChange={(e) => setWizardBowler(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white"
                  >
                    {wizardBowlingSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black font-bold text-sm shadow-lg shadow-[#00c85333] transition touch-active flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Match Scoring</span>
            </button>
          </form>
          )}
        </div>
      </div>
    );
  }

  // Active match data
  const inningsIndex = currentMatch.currentInningsIndex;
  const currentInnings = currentMatch.innings[inningsIndex];
  const battingTeam = getTeam(currentInnings.battingTeamId);
  const bowlingTeam = getTeam(currentInnings.bowlingTeamId);

  const striker = currentMatch.strikerId ? getPlayer(currentMatch.strikerId) : null;
  const nonStriker = currentMatch.nonStrikerId ? getPlayer(currentMatch.nonStrikerId) : null;
  const currentBowler = currentMatch.currentBowlerId ? getPlayer(currentMatch.currentBowlerId) : null;

  const strikerStats = striker ? currentInnings.batsmenRecords[striker.id] : null;
  const nonStrikerStats = nonStriker ? currentInnings.batsmenRecords[nonStriker.id] : null;
  const bowlerStats = currentBowler ? currentInnings.bowlersRecords[currentBowler.id] : null;

  // Run rates & metrics
  const ballsBowled = currentInnings.legalBallsBowled;
  const oversWhole = Math.floor(ballsBowled / 6);
  const ballsRemainder = ballsBowled % 6;
  const oversFormatted = `${oversWhole}.${ballsRemainder}`;
  const totalBallsInInnings = currentInnings.oversLimit * 6;
  const ballsRemaining = Math.max(0, totalBallsInInnings - ballsBowled);

  const crr = ballsBowled > 0 ? Number(((currentInnings.totalRuns / ballsBowled) * 6).toFixed(2)) : 0;
  const projectedScore = Math.round(crr * currentInnings.oversLimit);

  // 2nd innings targets
  let rrr = 0;
  let runsNeeded = 0;
  if (inningsIndex === 1 && currentMatch.target) {
    runsNeeded = Math.max(0, currentMatch.target - currentInnings.totalRuns);
    rrr = ballsRemaining > 0 ? Number(((runsNeeded / ballsRemaining) * 6).toFixed(2)) : 0;
  }

  // Recent balls in current over
  const currentOverObj = currentInnings.overs[currentInnings.overs.length - 1];
  const currentOverBalls = currentOverObj ? currentOverObj.balls : [];

  // Squad for incoming batsmen and next bowlers
  const battingSquad = players.filter((p) => p.teamId === currentInnings.battingTeamId && !p.isDeleted);
  const bowlingSquad = players.filter((p) => p.teamId === currentInnings.bowlingTeamId && !p.isDeleted);

  // Available batsmen who haven't batted or been dismissed
  const alreadyBattedIds = Object.keys(currentInnings.batsmenRecords);
  const availableBatsmen = battingSquad.filter((p) => !alreadyBattedIds.includes(p.id));

  // Bowler selection excluding previous bowler (Rule: No consecutive overs)
  const availableBowlers = bowlingSquad.filter((p) => p.id !== currentMatch.previousBowlerId);

  // Score buttons handlers
  const handleScoreRuns = (runs: number) => {
    if (!striker || !nonStriker) {
      setShowNextBatsmanModal(true);
      return;
    }
    if (!currentBowler) {
      setShowChangeBowlerModal(true);
      return;
    }
    recordBall({
      runsScored: runs,
      extraType: 'None',
    });
  };

  const handleScoreExtra = (type: ExtraType, runs: number = 0) => {
    if (!striker || !nonStriker) {
      setShowNextBatsmanModal(true);
      return;
    }
    if (!currentBowler) {
      setShowChangeBowlerModal(true);
      return;
    }
    recordBall({
      runsScored: type === 'Bye' || type === 'LegBye' ? 0 : 0,
      extraType: type,
      extraRuns: runs,
    });
  };

  const handleOpenWicketModal = () => {
    if (!striker || !nonStriker) {
      setShowNextBatsmanModal(true);
      return;
    }
    if (!currentBowler) {
      setShowChangeBowlerModal(true);
      return;
    }
    setWicketBatsmanId(striker.id);
    setWicketType('Bowled');
    setWicketFielderId('');
    setIncomingBatsmanId(availableBatsmen[0]?.id || '');
    setShowWicketModal(true);
  };

  const handleConfirmWicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wicketBatsmanId) return;

    const outPlayer = getPlayer(wicketBatsmanId);
    const bowler = currentBowler;
    const fielder = wicketFielderId ? getPlayer(wicketFielderId) : null;

    let desc = '';
    if (wicketType === 'Bowled') desc = `b ${bowler?.name || 'Bowler'}`;
    else if (wicketType === 'Caught') desc = `c ${fielder?.name || 'Fielder'} b ${bowler?.name || 'Bowler'}`;
    else if (wicketType === 'LBW') desc = `lbw b ${bowler?.name || 'Bowler'}`;
    else if (wicketType === 'Run Out') desc = `run out (${fielder?.name || 'Fielder'})`;
    else if (wicketType === 'Stumped') desc = `st ${fielder?.name || 'Wicketkeeper'} b ${bowler?.name || 'Bowler'}`;
    else if (wicketType === 'Hit Wicket') desc = `hit wicket b ${bowler?.name || 'Bowler'}`;
    else desc = 'out';

    const wicketData: BallWicket = {
      batsmanId: wicketBatsmanId,
      bowlerId: currentBowler ? currentBowler.id : '',
      dismissalType: wicketType,
      fielderId: wicketFielderId || undefined,
      description: desc,
    };

    recordBall({
      runsScored: 0,
      extraType: 'None',
      wicket: wicketData,
    });

    setShowWicketModal(false);

    // If there is an incoming batsman selected and not all out, auto assign
    if (incomingBatsmanId && currentInnings.wickets < 9) {
      const pos = wicketBatsmanId === currentMatch.strikerId ? 'striker' : 'nonStriker';
      setNextBatsman(incomingBatsmanId, pos);
    }
  };

  const handleConfirmChangeBowler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewBowlerId) return;
    const success = setBowler(selectedNewBowlerId);
    if (success) {
      setShowChangeBowlerModal(false);
      setSelectedNewBowlerId('');
    }
  };

  const handleConfirmNextBatsman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNextBatId) return;
    setNextBatsman(selectedNextBatId, nextBatPosition);
    setShowNextBatsmanModal(false);
    setSelectedNextBatId('');
  };

  const handleApplyDLSForm = (e: React.FormEvent) => {
    e.preventDefault();
    applyDLS(dlsRevisedOvers, dlsTargetReduction);
    setShowDLSModal(false);
  };

  const handleConfirmSecondInnings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secStriker || !secNonStriker || secStriker === secNonStriker || !secBowler) {
      addToast({ type: 'error', title: 'Lineup Incomplete', description: 'Select 2 batters and 1 bowler.' });
      return;
    }
    startSecondInnings(secStriker, secNonStriker, secBowler);
    setShowSecondInningsModal(false);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6 max-w-4xl mx-auto">
      {/* Top Banner: Status & Quick Controls */}
      <div className="bg-[#121216] border border-[#2a2a2e] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5252] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d50000]"></span>
          </span>
          <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
            {currentMatch.status === 'Rain Delay' ? 'PAUSED (RAIN)' : `${inningsIndex === 0 ? '1st' : '2nd'} Innings`}
          </span>
          <span className="text-xs text-[#909090]">
            • {battingTeam?.name} <span className="text-[#909090] mx-1">vs</span> {bowlingTeam?.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Rain Delay Button (Requirement 4) */}
          <button
            onClick={() => toggleRainDelay()}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition ${
              currentMatch.status === 'Rain Delay'
                ? 'bg-[#ffab0022] border-[#ffab0044] text-[#ffab00]'
                : 'bg-[#1a1d23] border-[#2a2a2e] text-[#909090] hover:text-white hover:bg-[#25282e]'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>{currentMatch.status === 'Rain Delay' ? 'Resume Match' : 'Rain Delay'}</span>
          </button>

          {/* DLS Calculator (Requirement 4) */}
          {inningsIndex === 1 && (
            <button
              onClick={() => {
                setDlsRevisedOvers(currentInnings.oversLimit);
                setShowDLSModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#1a1d23] border border-[#2a2a2e] text-[#909090] hover:text-white hover:bg-[#25282e] flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>DLS Calc</span>
            </button>
          )}

          {/* Custom Overs Adjuster for Live / Ongoing Match */}
          {currentMatch.status !== 'Completed' && (
            <button
              onClick={() => {
                setAdjustedOvers(currentMatch.oversLimit);
                setCustomAdjustedTarget(currentMatch.target || '');
                setShowAdjustOversModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#1a1d23] border border-[#2a2a2e] text-[#909090] hover:text-white hover:bg-[#25282e] flex items-center gap-1.5 transition"
              title="Adjust or curtail match overs in real time"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00c853]" />
              <span>Adjust Overs</span>
            </button>
          )}

          {/* Undo Ball */}
          <button
            onClick={undoLastBall}
            title="Undo last delivery"
            className="p-1.5 rounded-xl bg-[#1a1d23] border border-[#2a2a2e] text-[#909090] hover:text-white hover:bg-[#25282e] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Full Scorecard View Button */}
          <button
            onClick={() => setShowScorecardModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1a1d23] border border-[#2a2a2e] text-[#e0e0e0] hover:bg-[#25282e] flex items-center gap-1 shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scorecard</span>
          </button>

          {/* End Innings Button */}
          {currentMatch.status === 'Live' && (
            <button
              onClick={endInnings}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00c853] hover:bg-[#00b54b] text-black shadow-md shadow-[#00c85333] transition"
            >
              End Innings
            </button>
          )}

          {/* New match trigger */}
          <button
            onClick={() => setShowStartWizard(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#1a1d23] border border-[#2a2a2e] text-[#909090] hover:text-white hover:bg-[#25282e]"
          >
            New Match
          </button>
        </div>
      </div>

      {/* Free Hit Notification Banner */}
      {currentMatch.isFreeHitNext && (
        <div className="bg-[#ffab0015] border border-[#ffab0044] p-2.5 rounded-2xl flex items-center gap-2 text-[#ffab00] text-xs font-bold animate-pulse">
          <Flame className="w-4 h-4 text-[#ffab00]" />
          <span>FREE HIT BALL NEXT! Batter cannot be dismissed Bowled, Caught, or LBW!</span>
        </div>
      )}

      {/* Completed Match Banner */}
      {currentMatch.status === 'Completed' && (
        <div className="bg-[#1a1d23] border border-[#00c85344] p-5 rounded-2xl text-center space-y-2">
          <div className="inline-flex p-2 rounded-full bg-[#00c85322] text-[#00c853] mb-1">
            <Trophy className="w-6 h-6 text-[#ffab00]" />
          </div>
          <h3 className="text-base font-bold text-white">Match Finished!</h3>
          <p className="text-[#00c853] font-semibold text-sm">{currentMatch.resultSummary}</p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setShowScorecardModal(true)}
              className="px-4 py-2 rounded-xl bg-[#00c853] text-black font-bold text-xs hover:bg-[#00b54b]"
            >
              View Full Scorecard
            </button>
            <button
              onClick={() => setShowStartWizard(true)}
              className="px-4 py-2 rounded-xl bg-[#25282e] border border-[#2a2a2e] text-white text-xs font-semibold"
            >
              Start Another Match
            </button>
          </div>
        </div>
      )}

      {/* Innings Break Prompt */}
      {currentMatch.status === 'Innings Break' && (
        <div className="bg-[#1a1d23] border border-[#2a2a2e] p-5 rounded-2xl text-center space-y-3">
          <h3 className="font-display font-bold text-base text-white">Innings Break</h3>
          <p className="text-xs text-[#e0e0e0]">
            {getTeam(currentMatch.innings[0].battingTeamId)?.name} scored{' '}
            <strong className="text-[#00c853] font-mono-num">
              {currentMatch.innings[0].totalRuns}/{currentMatch.innings[0].wickets}
            </strong>{' '}
            in {currentMatch.oversLimit} overs.
          </p>
          <p className="text-sm font-bold text-white">
            Target for {getTeam(currentMatch.innings[1].battingTeamId)?.name}:{' '}
            <span className="text-[#00c853] font-mono-num text-lg">{currentMatch.target} runs</span>
          </p>
          <button
            onClick={() => {
              const inn2BattingSquad = players.filter(
                (p) => p.teamId === currentMatch.innings[1].battingTeamId && !p.isDeleted
              );
              const inn2BowlingSquad = players.filter(
                (p) => p.teamId === currentMatch.innings[1].bowlingTeamId && !p.isDeleted
              );
              setSecStriker(inn2BattingSquad[0]?.id || '');
              setSecNonStriker(inn2BattingSquad[1]?.id || '');
              setSecBowler(inn2BowlingSquad[0]?.id || '');
              setShowSecondInningsModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs font-bold shadow-lg shadow-[#00c85333]"
          >
            Commence 2nd Innings →
          </button>
        </div>
      )}

      {/* Main Scoring Dashboard */}
      <div className="bg-[#0f1115] border border-[#2a2a2e] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Big Score Card */}
        <div className="bg-[#1a1d23] rounded-2xl p-5 border border-[#2a2a2e] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00c85308] rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-lg text-white shadow-md shrink-0"
              style={{ backgroundColor: battingTeam?.logoColor || '#00c853' }}
            >
              {battingTeam?.shortCode || 'BAT'}
            </div>
            <div>
              <div className="text-[#909090] text-xs font-medium uppercase tracking-wider mb-0.5">Current Score</div>
              <h3 className="font-display font-bold text-base text-white">{battingTeam?.name}</h3>
              <div className="flex items-center gap-3 text-xs text-[#909090] mt-1 font-mono-num flex-wrap">
                <span>CRR: <strong className="text-white font-bold">{crr}</strong></span>
                {inningsIndex === 1 && currentMatch.target && (
                  <span>• RRR: <strong className="text-[#ffab00] font-bold">{rrr}</strong></span>
                )}
                <span>• Proj: <strong className="text-white font-bold">{projectedScore}</strong></span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-left sm:text-right">
            <div className="flex items-baseline sm:justify-end gap-2 font-mono-num">
              <span className="font-display font-black text-3xl sm:text-4xl text-white">
                {currentInnings.totalRuns}/{currentInnings.wickets}
              </span>
              <span className="text-sm sm:text-base text-[#909090] font-light">
                ({oversFormatted} / {currentInnings.oversLimit} ov)
              </span>
            </div>
            {inningsIndex === 1 && currentMatch.target && (
              <p className="text-xs text-[#ffab00] font-semibold mt-1 font-mono-num">
                Need {runsNeeded} runs from {ballsRemaining} balls
              </p>
            )}
          </div>
        </div>

        {/* Current Batters & Bowler Live Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Batters Card */}
          <div className="bg-[#1a1d23] p-4 rounded-xl border border-[#2a2a2e] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#909090] pb-1 border-b border-[#2a2a2e] font-semibold uppercase tracking-wider">
              <span>Batters at Crease</span>
              <button
                onClick={rotateStrike}
                className="flex items-center gap-1 text-[11px] text-[#00c853] hover:text-[#00e676] font-medium"
                title="Swap Striker & Non-Striker"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Rotate Strike</span>
              </button>
            </div>

            {/* Striker */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#00c85308] border border-[#00c85333]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00c853] animate-ping" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{striker?.name || 'Select Striker'}</span>
                    <span className="text-[10px] bg-[#00c85322] text-[#00c853] border border-[#00c85344] px-1.5 py-0.2 rounded font-bold">
                      STRIKE
                    </span>
                  </div>
                  <span className="text-[10px] text-[#909090]">{striker?.battingStyle}</span>
                </div>
              </div>
              <div className="text-right font-mono-num">
                <span className="text-sm font-black text-[#00c853]">{strikerStats?.runs || 0}</span>
                <span className="text-xs text-[#909090]"> ({strikerStats?.balls || 0}b)</span>
                <div className="text-[10px] text-[#909090]">
                  4s: {strikerStats?.fours || 0} • 6s: {strikerStats?.sixes || 0} • SR: {strikerStats?.strikeRate || 0}
                </div>
              </div>
            </div>

            {/* Non-Striker */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121216] border border-[#2a2a2e]">
              <div>
                <span className="text-xs font-medium text-[#e0e0e0]">{nonStriker?.name || 'Select Non-Striker'}</span>
                <span className="text-[10px] text-[#909090] block">{nonStriker?.battingStyle}</span>
              </div>
              <div className="text-right font-mono-num">
                <span className="text-sm font-bold text-white">{nonStrikerStats?.runs || 0}</span>
                <span className="text-xs text-[#909090]"> ({nonStrikerStats?.balls || 0}b)</span>
                <div className="text-[10px] text-[#909090]">
                  4s: {nonStrikerStats?.fours || 0} • 6s: {nonStrikerStats?.sixes || 0} • SR: {nonStrikerStats?.strikeRate || 0}
                </div>
              </div>
            </div>

            {/* Current Partnership */}
            <div className="flex items-center justify-between text-[11px] text-[#909090] pt-1 font-mono-num">
              <span>Partnership:</span>
              <span className="font-bold text-[#e0e0e0]">
                {currentInnings.currentPartnership.runs} runs ({currentInnings.currentPartnership.balls} balls)
              </span>
            </div>
          </div>

          {/* Current Bowler Card */}
          <div className="bg-[#1a1d23] p-4 rounded-xl border border-[#2a2a2e] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#909090] pb-1 border-b border-[#2a2a2e] font-semibold uppercase tracking-wider">
                <span>Current Bowler</span>
                <button
                  onClick={() => setShowChangeBowlerModal(true)}
                  className="text-[11px] text-[#ffab00] hover:text-[#ffc107] font-medium"
                >
                  Change Bowler
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121216] border border-[#2a2a2e] mt-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{currentBowler?.name || 'No Bowler Assigned'}</span>
                  </div>
                  <span className="text-[10px] text-[#909090]">{currentBowler?.bowlingStyle}</span>
                </div>
                <div className="text-right font-mono-num">
                  <span className="text-sm font-bold text-[#ff5252]">
                    {bowlerStats?.wickets || 0}/{bowlerStats?.runsConceded || 0}
                  </span>
                  <span className="text-xs text-[#909090]">
                    {' '}
                    ({Math.floor((bowlerStats?.ballsBowled || 0) / 6)}.{(bowlerStats?.ballsBowled || 0) % 6} ov)
                  </span>
                  <div className="text-[10px] text-[#909090]">
                    Econ: {bowlerStats?.economyRate || 0} • M: {bowlerStats?.maidens || 0}
                  </div>
                </div>
              </div>

              {/* Prev bowler info to guide consecutive overs rule */}
              {currentMatch.previousBowlerId && (
                <div className="text-[10px] text-[#909090] mt-1.5">
                  Last over bowled by: {getPlayer(currentMatch.previousBowlerId)?.name} (Resting)
                </div>
              )}
            </div>

            {/* Current Over Balls Timeline */}
            <div>
              <span className="text-[10px] text-[#909090] font-semibold uppercase tracking-wider block mb-1.5">
                This Over:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {currentOverBalls.map((b, idx) => {
                  let badge = `${b.runsScored}`;
                  let styleClass = 'bg-[#1a1d23] text-[#e0e0e0] border-[#2a2a2e]';

                  if (b.wicket) {
                    badge = 'W';
                    styleClass = 'bg-[#d50000] text-white border-[#d50000] font-black';
                  } else if (b.isBoundary6) {
                    badge = '6';
                    styleClass = 'bg-[#00c853] text-black border-[#00c853] font-black ring-2 ring-[#00c853]';
                  } else if (b.isBoundary4) {
                    badge = '4';
                    styleClass = 'bg-[#00c853] text-black border-[#00c853] font-black';
                  } else if (b.extraType === 'Wide') {
                    badge = `${b.totalRuns}wd`;
                    styleClass = 'bg-[#ffab0022] border-[#ffab00] text-[#ffab00] font-bold';
                  } else if (b.extraType === 'NoBall') {
                    badge = `${b.totalRuns}nb`;
                    styleClass = 'bg-[#d5000033] border-[#d50000] text-[#ff5252] font-bold';
                  } else if (b.runsScored === 0) {
                    badge = '•';
                    styleClass = 'bg-[#121216] text-[#909090] border-[#2a2a2e] font-black';
                  }

                  return (
                    <span
                      key={idx}
                      className={`w-8 h-8 rounded-full border text-xs font-mono-num flex items-center justify-center shrink-0 shadow-sm ${styleClass}`}
                    >
                      {badge}
                    </span>
                  );
                })}
                {currentOverBalls.length === 0 && (
                  <span className="text-xs text-[#909090] italic">Over commencing...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Big Touch Scoring Keypad (Requirement 4) */}
        <div className="space-y-3 pt-2 border-t border-[#2a2a2e]">
          <span className="text-xs font-bold text-[#909090] uppercase tracking-widest block">
            Record Delivery (Touch-Friendly)
          </span>

          {/* Runs Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
              <button
                key={runs}
                id={`btn-score-${runs}`}
                onClick={() => handleScoreRuns(runs)}
                className={`py-3.5 sm:py-4 rounded-xl font-display font-black text-xl shadow-md transition touch-active ${
                  runs === 4
                    ? 'bg-[#1db95422] border border-[#1db95444] text-[#00c853] hover:bg-[#1db95433] active:scale-95'
                    : runs === 6
                    ? 'bg-[#1db95444] border border-[#00c853] text-[#00c853] hover:bg-[#1db95466] active:scale-95'
                    : 'bg-[#25282e] hover:bg-[#2e323a] text-white border border-[#2a2a2e] active:scale-95'
                }`}
              >
                {runs === 0 ? '•' : runs}
              </button>
            ))}

            {/* Wicket Button */}
            <button
              id="btn-score-wicket"
              onClick={handleOpenWicketModal}
              className="py-3.5 sm:py-4 rounded-xl bg-[#d5000033] border border-[#d50000] hover:bg-[#d5000044] text-[#ff5252] font-display font-black text-base sm:text-lg shadow-md transition touch-active flex flex-col items-center justify-center active:scale-95"
            >
              <span>OUT!</span>
            </button>
          </div>

          {/* Extras Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleScoreExtra('Wide', 0)}
              className="py-2.5 rounded-xl bg-[#ffab0022] hover:bg-[#ffab0033] border border-[#ffab0044] text-xs font-bold text-[#ffab00] transition touch-active"
            >
              Wide (+1 wd)
            </button>
            <button
              onClick={() => handleScoreExtra('NoBall', 0)}
              className="py-2.5 rounded-xl bg-[#d5000022] hover:bg-[#d5000033] border border-[#d5000044] text-xs font-bold text-[#ff5252] transition touch-active"
            >
              No Ball (+1 nb)
            </button>
            <button
              onClick={() => handleScoreExtra('Bye', 1)}
              className="py-2.5 rounded-xl bg-[#25282e] hover:bg-[#2e323a] border border-[#2a2a2e] text-xs font-bold text-[#e0e0e0] transition touch-active"
            >
              Bye (+1)
            </button>
            <button
              onClick={() => handleScoreExtra('LegBye', 1)}
              className="py-2.5 rounded-xl bg-[#25282e] hover:bg-[#2e323a] border border-[#2a2a2e] text-xs font-bold text-[#e0e0e0] transition touch-active"
            >
              Leg Bye (+1)
            </button>
          </div>
        </div>
      </div>

      {/* Wicket Dismissal Modal (Requirement 4) */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-lg text-[#ff5252] flex items-center gap-2">
                <span>Wicket Fall Details</span>
              </h3>
              <button
                onClick={() => setShowWicketModal(false)}
                className="text-[#909090] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmWicket} className="space-y-3.5">
              {/* Dismissed Batsman */}
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                  Dismissed Batsman *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWicketBatsmanId(striker?.id || '')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                      wicketBatsmanId === striker?.id
                        ? 'bg-[#d5000022] border-[#d50000] text-[#ff5252]'
                        : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
                    }`}
                  >
                    Striker: {striker?.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWicketBatsmanId(nonStriker?.id || '')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                      wicketBatsmanId === nonStriker?.id
                        ? 'bg-[#d5000022] border-[#d50000] text-[#ff5252]'
                        : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
                    }`}
                  >
                    Non-Striker: {nonStriker?.name}
                  </button>
                </div>
              </div>

              {/* Dismissal Type */}
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                  Dismissal Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'] as DismissalType[]).map(
                    (dt) => (
                      <button
                        type="button"
                        key={dt}
                        onClick={() => setWicketType(dt)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                          wicketType === dt
                            ? 'bg-[#d5000022] border-[#d50000] text-[#ff5252] font-bold'
                            : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090] hover:text-white'
                        }`}
                      >
                        {dt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Bowler who took wicket */}
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                  Wicket Credited to Bowler
                </label>
                <div className="p-2.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white">
                  {wicketType === 'Run Out' ? 'None (Run Out)' : `${currentBowler?.name} (Active Bowler)`}
                </div>
              </div>

              {/* Fielder if Caught, Run Out, Stumped */}
              {(wicketType === 'Caught' || wicketType === 'Run Out' || wicketType === 'Stumped') && (
                <div>
                  <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                    Fielder Involved
                  </label>
                  <select
                    value={wicketFielderId}
                    onChange={(e) => setWicketFielderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white focus:outline-none"
                  >
                    <option value="">Select Fielder / Keeper</option>
                    {bowlingSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Incoming Next Batsman */}
              {availableBatsmen.length > 0 && currentInnings.wickets < 9 && (
                <div>
                  <label className="block text-xs font-bold text-[#00c853] mb-1 uppercase tracking-wider">
                    Next Batter to the Crease
                  </label>
                  <select
                    value={incomingBatsmanId}
                    onChange={(e) => setIncomingBatsmanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#00c85355] text-xs text-white focus:outline-none"
                  >
                    {availableBatsmen.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role}, {p.battingStyle})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => setShowWicketModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-[#909090] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#d50000] hover:bg-[#b71c1c] text-white text-xs font-bold shadow-md shadow-[#d5000044] transition"
                >
                  Confirm Wicket Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Bowler Modal (Requirement 4: Prevents consecutive overs) */}
      {showChangeBowlerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-base text-white">Assign Next Bowler</h3>
              <button
                onClick={() => setShowChangeBowlerModal(false)}
                className="text-[#909090] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-[11px] text-[#ffab00]">
              ⚠️ <strong>Rule:</strong> A bowler cannot bowl consecutive overs in limited-overs cricket.
            </div>

            <form onSubmit={handleConfirmChangeBowler} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                  Select Bowler from {bowlingTeam?.name}
                </label>
                <div className="max-h-56 overflow-y-auto space-y-1.5">
                  {availableBowlers.map((b) => {
                    const stats = currentInnings.bowlersRecords[b.id];
                    const isSelected = selectedNewBowlerId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedNewBowlerId(b.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[#00c85315] border-[#00c853] text-white'
                            : 'bg-[#0f1115] border-[#2a2a2e] text-[#e0e0e0] hover:bg-[#25282e]'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{b.name}</span>
                          <span className="text-[10px] text-[#909090]">{b.bowlingStyle}</span>
                        </div>
                        <span className="text-xs font-mono-num text-[#909090]">
                          {stats ? `${stats.wickets}/${stats.runsConceded} (${stats.overs} ov)` : '0 ov'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => setShowChangeBowlerModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-[#909090] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedNewBowlerId}
                  className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] disabled:opacity-50 text-black text-xs font-bold shadow-md"
                >
                  Assign Bowler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Select Next Batsman Modal */}
      {showNextBatsmanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-base text-white">Select Incoming Batter</h3>
              <button
                onClick={() => setShowNextBatsmanModal(false)}
                className="text-[#909090] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmNextBatsman} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Batter Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNextBatPosition('striker')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      nextBatPosition === 'striker' ? 'bg-[#00c853] text-black border-[#00c853]' : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090]'
                    }`}
                  >
                    Striker
                  </button>
                  <button
                    type="button"
                    onClick={() => setNextBatPosition('nonStriker')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      nextBatPosition === 'nonStriker' ? 'bg-[#00c853] text-black border-[#00c853]' : 'bg-[#0f1115] border-[#2a2a2e] text-[#909090]'
                    }`}
                  >
                    Non-Striker
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Available Squad</label>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {availableBatsmen.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedNextBatId(b.id)}
                      className={`p-2 rounded-xl border cursor-pointer text-xs ${
                        selectedNextBatId === b.id
                          ? 'bg-[#00c85315] border-[#00c853] text-white font-bold'
                          : 'bg-[#0f1115] border-[#2a2a2e] text-[#e0e0e0] hover:bg-[#25282e]'
                      }`}
                    >
                      {b.name} ({b.role}, {b.battingStyle})
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
                <button
                  type="submit"
                  disabled={!selectedNextBatId}
                  className="px-4 py-2 rounded-xl bg-[#00c853] text-black text-xs font-bold disabled:opacity-50"
                >
                  Send to Crease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simplified DLS Calculator Modal (Requirement 4) */}
      {showDLSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2e]">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#ffab00]" />
                <span>Simplified DLS Calculator</span>
              </h3>
              <button
                onClick={() => setShowDLSModal(false)}
                className="text-[#909090] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#e0e0e0] leading-relaxed bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e]">
              If rain curtails the second innings, adjust the revised overs or target reduction to recalculate the winning target.
            </div>

            <form onSubmit={handleApplyDLSForm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                  Revised Total Overs for 2nd Innings
                </label>
                <input
                  type="number"
                  value={dlsRevisedOvers}
                  onChange={(e) => setDlsRevisedOvers(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={currentMatch.oversLimit}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">
                  Target Reduction (Optional Runs deduction)
                </label>
                <input
                  type="number"
                  value={dlsTargetReduction}
                  onChange={(e) => setDlsTargetReduction(Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num"
                />
              </div>

              <div className="bg-[#0f1115] p-2.5 rounded-xl border border-[#2a2a2e] text-xs text-[#00c853] font-mono-num font-bold">
                Original Target: {currentMatch.target} runs
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
                <button
                  type="button"
                  onClick={() => setShowDLSModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#909090] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs font-bold"
                >
                  Apply DLS Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2nd Innings Opening Lineup Modal */}
      {showSecondInningsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1a1d23] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-white">Commence 2nd Innings</h3>
            <p className="text-xs text-[#909090]">
              Target: <strong className="text-[#00c853]">{currentMatch.target} runs</strong> in {currentMatch.oversLimit} overs
            </p>

            <form onSubmit={handleConfirmSecondInnings} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Opening Striker</label>
                <select
                  value={secStriker}
                  onChange={(e) => setSecStriker(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white"
                >
                  {players
                    .filter((p) => p.teamId === currentMatch.innings[1].battingTeamId && !p.isDeleted)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Opening Non-Striker</label>
                <select
                  value={secNonStriker}
                  onChange={(e) => setSecNonStriker(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white"
                >
                  {players
                    .filter((p) => p.teamId === currentMatch.innings[1].battingTeamId && !p.isDeleted)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#909090] mb-1 uppercase tracking-wider">Opening Bowler</label>
                <select
                  value={secBowler}
                  onChange={(e) => setSecBowler(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white"
                >
                  {players
                    .filter((p) => p.teamId === currentMatch.innings[1].bowlingTeamId && !p.isDeleted)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2e]">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-black text-xs font-bold"
                >
                  Start Chase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Custom Overs Modal */}
      {showAdjustOversModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#121418] border border-[#2a2a2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2e]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00c85322] text-[#00c853] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Adjust Match Overs</h3>
                  <p className="text-[11px] text-[#909090]">Curtail or set custom overs in real time</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdjustOversModal(false)}
                className="p-1 rounded-lg text-[#909090] hover:text-white hover:bg-[#1a1d23]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#1a1d23] p-3 rounded-xl border border-[#2a2a2e] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#909090]">
                <span>Current Format:</span>
                <span className="text-white font-bold">{currentMatch.oversLimit} Overs per innings</span>
              </div>
              <div className="flex justify-between text-[#909090]">
                <span>1st Innings Bowled:</span>
                <span className="text-white font-mono-num font-semibold">
                  {Math.floor(currentMatch.innings[0].legalBallsBowled / 6)}.{currentMatch.innings[0].legalBallsBowled % 6} ov ({currentMatch.innings[0].totalRuns}/{currentMatch.innings[0].wickets})
                </span>
              </div>
              {currentMatch.currentInningsIndex === 1 && (
                <div className="flex justify-between text-[#909090]">
                  <span>2nd Innings Bowled:</span>
                  <span className="text-white font-mono-num font-semibold">
                    {Math.floor(currentMatch.innings[1].legalBallsBowled / 6)}.{currentMatch.innings[1].legalBallsBowled % 6} ov ({currentMatch.innings[1].totalRuns}/{currentMatch.innings[1].wickets})
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#e0e0e0] mb-1">
                  New Overs Limit per Innings (1 - 100)
                </label>
                <div className="flex items-center bg-[#0f1115] border border-[#2a2a2e] rounded-xl overflow-hidden focus-within:border-[#00c853]">
                  <button
                    type="button"
                    onClick={() => {
                      const minAllowed = Math.ceil(currentInnings.legalBallsBowled / 6) || 1;
                      setAdjustedOvers((prev) => Math.max(minAllowed, prev - 1));
                    }}
                    className="px-3 py-2 text-[#909090] hover:text-white hover:bg-[#25282e]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={Math.ceil(currentInnings.legalBallsBowled / 6) || 1}
                    max={100}
                    value={adjustedOvers}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const minAllowed = Math.ceil(currentInnings.legalBallsBowled / 6) || 1;
                      if (!isNaN(val)) {
                        setAdjustedOvers(Math.max(minAllowed, Math.min(100, val)));
                      }
                    }}
                    className="w-full text-center bg-transparent py-2 text-sm font-bold font-mono-num text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustedOvers((prev) => Math.min(100, prev + 1))}
                    className="px-3 py-2 text-[#909090] hover:text-white hover:bg-[#25282e]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons for Custom Overs */}
              <div>
                <span className="block text-[11px] text-[#909090] mb-1">Quick Presets:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {[2, 4, 5, 6, 8, 10, 12, 15, 20].map((ov) => {
                    const minAllowed = Math.ceil(currentInnings.legalBallsBowled / 6) || 1;
                    const isDisabled = ov < minAllowed;
                    return (
                      <button
                        type="button"
                        key={ov}
                        disabled={isDisabled}
                        onClick={() => setAdjustedOvers(ov)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                          adjustedOvers === ov
                            ? 'bg-[#00c85322] border-[#00c853] text-[#00c853]'
                            : isDisabled
                            ? 'opacity-30 cursor-not-allowed bg-[#1a1d23] border-[#2a2a2e] text-[#606060]'
                            : 'bg-[#1a1d23] border-[#2a2a2e] text-[#909090] hover:text-white'
                        }`}
                      >
                        {ov} ov
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target adjustment if in 2nd innings */}
              {currentMatch.currentInningsIndex === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#e0e0e0]">
                      Revised 2nd Innings Target (Runs)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const originalTarget = currentMatch.target || (currentMatch.innings[0].totalRuns + 1);
                        const ratio = adjustedOvers / currentMatch.oversLimit;
                        setCustomAdjustedTarget(Math.max(1, Math.round(originalTarget * ratio)));
                      }}
                      className="text-[11px] text-[#00c853] hover:underline"
                    >
                      Auto Proportional
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={customAdjustedTarget}
                    onChange={(e) => setCustomAdjustedTarget(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    placeholder="Enter revised target"
                    className="w-full px-3 py-2 rounded-xl bg-[#0f1115] border border-[#2a2a2e] text-xs text-white font-mono-num focus:outline-none focus:border-[#00c853]"
                  />
                  <p className="text-[11px] text-[#808080] mt-1">
                    Original target was {currentMatch.target || currentMatch.innings[0].totalRuns + 1} runs in {currentMatch.oversLimit} overs.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#2a2a2e] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdjustOversModal(false)}
                className="px-3 py-1.5 rounded-xl bg-[#1a1d23] border border-[#2a2a2e] text-xs text-[#909090] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateMatchOversLimit(
                    currentMatch.id,
                    adjustedOvers,
                    customAdjustedTarget ? Number(customAdjustedTarget) : undefined
                  );
                  setShowAdjustOversModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#00c853] hover:bg-[#00b54b] text-xs font-bold text-black shadow-md shadow-[#00c85333]"
              >
                Apply Custom Overs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Scorecard Modal */}
      {showScorecardModal && (
        <ScorecardModal matchId={currentMatch.id} onClose={() => setShowScorecardModal(false)} />
      )}
    </div>
  );
};
