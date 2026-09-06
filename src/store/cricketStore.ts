import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Team,
  Player,
  Tournament,
  CricketMatch,
  MatchInnings,
  BallDelivery,
  BallWicket,
  ExtraType,
  AndroidDeviceMode,
  ToastMessage,
  PlayerStatsSummary,
  DismissalType,
  Partnership,
  MatchStatus,
} from '../types';
import {
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_TOURNAMENTS,
  INITIAL_MATCHES,
  SAMPLE_TEAMS,
  SAMPLE_PLAYERS,
  SAMPLE_TOURNAMENTS,
  SAMPLE_MATCHES,
} from '../data/seedData';

interface CricketState {
  teams: Team[];
  players: Player[];
  tournaments: Tournament[];
  matches: CricketMatch[];
  activeMatchId: string | null;
  activeTab: 'dashboard' | 'live' | 'tournaments' | 'teams' | 'players' | 'stats';
  deviceMode: AndroidDeviceMode;
  toasts: ToastMessage[];
  adminMode: boolean;
  selectedPlayerForModal: Player | null;
  scorecardMatchId: string | null; // When viewing full scorecard modal

  // Navigation & UI Actions
  setActiveTab: (tab: 'dashboard' | 'live' | 'tournaments' | 'teams' | 'players' | 'stats') => void;
  setDeviceMode: (mode: AndroidDeviceMode) => void;
  setAdminMode: (enabled: boolean) => void;
  setSelectedPlayerForModal: (player: Player | null) => void;
  setScorecardMatchId: (matchId: string | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Team Management (CRUD)
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'isDeleted'>) => boolean;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => boolean;

  // Player Management (CRUD)
  addPlayer: (player: Omit<Player, 'id' | 'createdAt' | 'isDeleted'>) => boolean;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => boolean;

  // Tournament Management
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'status'>) => string;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;

  // Match Scoring & Core Engine
  startNewMatch: (params: {
    tournamentId: string;
    teamAId: string;
    teamBId: string;
    oversLimit: number;
    tossWinnerTeamId: string;
    tossDecision: 'Bat' | 'Bowl';
    strikerId: string;
    nonStrikerId: string;
    openingBowlerId: string;
  }) => string;
  setActiveMatchId: (matchId: string | null) => void;
  recordBall: (delivery: {
    runsScored: number;
    extraType: ExtraType;
    extraRuns?: number;
    wicket?: BallWicket;
  }) => void;
  rotateStrike: () => void;
  setBowler: (bowlerId: string) => boolean;
  setNextBatsman: (batsmanId: string, position: 'striker' | 'nonStriker') => void;
  undoLastBall: () => void;
  endInnings: () => void;
  startSecondInnings: (strikerId: string, nonStrikerId: string, openingBowlerId: string) => void;
  toggleRainDelay: (note?: string) => void;
  applyDLS: (revisedOvers: number, targetReduction?: number) => void;
  updateMatchOversLimit: (matchId: string, newOversLimit: number, revisedTarget?: number) => void;
  concludeMatchManually: (resultText?: string) => void;

  // Automatic Stats Calculation & Data Integrity
  getPlayerStats: (playerId: string, tournamentId?: string) => PlayerStatsSummary;
  getAllPlayersStats: (tournamentId?: string) => PlayerStatsSummary[];
  recalculateStats: () => void;
  recalculateAllStats: () => void;
  adminOverridePlayerStats: (
    playerId: string,
    overrides: { runs?: number; wickets?: number; fours?: number; sixes?: number }
  ) => void;
  deleteInnings: (matchId: string) => void;
  deleteMatch: (matchId: string) => void;
  clearAllStats: () => void;
  clearTournamentStats: (tournamentId: string) => void;
  resetPlayerStats: (playerId: string) => void;
  clearAllMockData: () => void;
  createQuickMatchTeams: () => { teamAId: string; teamBId: string };
  resetToSampleData: () => void;
}

const createEmptyInnings = (battingTeamId: string, bowlingTeamId: string, oversLimit: number): MatchInnings => ({
  battingTeamId,
  bowlingTeamId,
  totalRuns: 0,
  wickets: 0,
  legalBallsBowled: 0,
  oversLimit,
  extras: {
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    penalty: 0,
    total: 0,
  },
  overs: [],
  batsmenRecords: {},
  bowlersRecords: {},
  fallOfWickets: [],
  currentPartnership: {
    batsman1Id: '',
    batsman2Id: '',
    runs: 0,
    balls: 0,
  },
  isCompleted: false,
});

export const useCricketStore = create<CricketState>()(
  persist(
    (set, get) => ({
      teams: INITIAL_TEAMS,
      players: INITIAL_PLAYERS,
      tournaments: INITIAL_TOURNAMENTS,
      matches: INITIAL_MATCHES,
      activeMatchId: null,
      activeTab: 'dashboard',
      deviceMode: 'fluid',
      toasts: [],
      adminMode: false,
      selectedPlayerForModal: null,
      scorecardMatchId: null,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setDeviceMode: (mode) => set({ deviceMode: mode }),
      setAdminMode: (enabled) => set({ adminMode: enabled }),
      setSelectedPlayerForModal: (player) => set({ selectedPlayerForModal: player }),
      setScorecardMatchId: (matchId) => set({ scorecardMatchId: matchId }),

      addToast: (toast) => {
        const id = 'toast-' + Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = { id, durationMs: 3500, ...toast };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        setTimeout(() => {
          get().removeToast(id);
        }, newToast.durationMs || 3500);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      // Team Management (CRUD)
      addTeam: (teamData) => {
        const id = 'team-' + Math.random().toString(36).substring(2, 9);
        const newTeam: Team = {
          ...teamData,
          id,
          isDeleted: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ teams: [...state.teams, newTeam] }));
        get().addToast({
          type: 'success',
          title: 'Team Created',
          description: `${newTeam.name} (${newTeam.shortCode}) has been registered.`,
        });
        return true;
      },

      updateTeam: (id, updates) => {
        set((state) => ({
          teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        get().addToast({
          type: 'info',
          title: 'Team Updated',
          description: 'Team profile details saved successfully.',
        });
      },

      deleteTeam: (id) => {
        const state = get();
        // Rule: If a team is deleted, remove them from the current teams list
        // but DO NOT delete their historical match records or stats.
        // Check if team is currently in a live match
        const activeMatch = state.matches.find(
          (m) => (m.teamAId === id || m.teamBId === id) && m.status === 'Live'
        );

        if (activeMatch) {
          get().addToast({
            type: 'error',
            title: 'Action Denied',
            description: 'Cannot delete team - currently playing in an active live match!',
          });
          return false;
        }

        const team = state.teams.find((t) => t.id === id);
        set((prevState) => ({
          teams: prevState.teams.map((t) => (t.id === id ? { ...t, isDeleted: true } : t)),
        }));

        get().addToast({
          type: 'info',
          title: 'Team Removed',
          description: `${team?.name || 'Team'} removed from active list. Historical records and stats preserved.`,
        });
        return true;
      },

      // Player Management (CRUD)
      addPlayer: (playerData) => {
        const id = 'player-' + Math.random().toString(36).substring(2, 9);
        const newPlayer: Player = {
          ...playerData,
          id,
          isDeleted: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ players: [...state.players, newPlayer] }));
        get().addToast({
          type: 'success',
          title: 'Player Added',
          description: `${newPlayer.name} is now registered in the squad.`,
        });
        return true;
      },

      updatePlayer: (id, updates) => {
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        get().addToast({
          type: 'info',
          title: 'Player Updated',
          description: 'Player details updated successfully.',
        });
      },

      deletePlayer: (id) => {
        const state = get();
        // Check if player is currently active in a live match
        const liveMatch = state.matches.find(
          (m) =>
            m.status === 'Live' &&
            (m.strikerId === id || m.nonStrikerId === id || m.currentBowlerId === id)
        );

        if (liveMatch) {
          get().addToast({
            type: 'error',
            title: 'Action Denied',
            description: 'Cannot remove player who is currently on the field in a live match.',
          });
          return false;
        }

        const player = state.players.find((p) => p.id === id);
        set((prevState) => ({
          players: prevState.players.map((p) => (p.id === id ? { ...p, isDeleted: true } : p)),
        }));

        get().addToast({
          type: 'info',
          title: 'Player Removed',
          description: `${player?.name || 'Player'} removed from active roster. Historical career stats preserved.`,
        });
        return true;
      },

      // Tournament Setup
      createTournament: (tournamentData) => {
        const id = 'tour-' + Math.random().toString(36).substring(2, 9);
        const newTournament: Tournament = {
          ...tournamentData,
          id,
          status: 'Ongoing',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tournaments: [...state.tournaments, newTournament] }));
        get().addToast({
          type: 'success',
          title: 'Tournament Created',
          description: `${newTournament.name} is ready. All team players synchronized to tournament stats.`,
        });
        return id;
      },

      updateTournament: (id, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTournament: (id) => {
        set((state) => ({
          tournaments: state.tournaments.filter((t) => t.id !== id),
        }));
        get().addToast({
          type: 'info',
          title: 'Tournament Deleted',
          description: 'Tournament configuration removed.',
        });
      },

      // Live Match Scoring Engine
      startNewMatch: ({
        tournamentId,
        teamAId,
        teamBId,
        oversLimit,
        tossWinnerTeamId,
        tossDecision,
        strikerId,
        nonStrikerId,
        openingBowlerId,
      }) => {
        const matchId = 'match-' + Math.random().toString(36).substring(2, 9);

        // Determine batting team for 1st innings
        let battingTeamId = teamAId;
        let bowlingTeamId = teamBId;

        if (tossWinnerTeamId === teamAId) {
          battingTeamId = tossDecision === 'Bat' ? teamAId : teamBId;
          bowlingTeamId = tossDecision === 'Bat' ? teamBId : teamAId;
        } else {
          battingTeamId = tossDecision === 'Bat' ? teamBId : teamAId;
          bowlingTeamId = tossDecision === 'Bat' ? teamAId : teamBId;
        }

        const innings1 = createEmptyInnings(battingTeamId, bowlingTeamId, oversLimit);
        const innings2 = createEmptyInnings(bowlingTeamId, battingTeamId, oversLimit);

        // Initialize striker and non-striker in 1st innings batsman records
        innings1.batsmenRecords[strikerId] = {
          playerId: strikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
          battingOrder: 1,
        };
        innings1.batsmenRecords[nonStrikerId] = {
          playerId: nonStrikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
          battingOrder: 2,
        };

        // Initialize opening bowler
        innings1.bowlersRecords[openingBowlerId] = {
          playerId: openingBowlerId,
          overs: 0,
          ballsBowled: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          economyRate: 0,
          wides: 0,
          noBalls: 0,
        };

        innings1.currentPartnership = {
          batsman1Id: strikerId,
          batsman2Id: nonStrikerId,
          runs: 0,
          balls: 0,
        };

        const newMatch: CricketMatch = {
          id: matchId,
          tournamentId,
          teamAId,
          teamBId,
          oversLimit,
          tossWinnerTeamId,
          tossDecision,
          status: 'Live',
          currentInningsIndex: 0,
          innings: [innings1, innings2],
          strikerId,
          nonStrikerId,
          currentBowlerId: openingBowlerId,
          previousBowlerId: null,
          isFreeHitNext: false,
          rainDelays: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          matches: [newMatch, ...state.matches],
          activeMatchId: matchId,
          activeTab: 'live',
        }));

        get().addToast({
          type: 'success',
          title: 'Match Commenced!',
          description: '1st Innings is underway. Ready for live ball-by-ball scoring.',
        });

        return matchId;
      },

      setActiveMatchId: (matchId) => set({ activeMatchId: matchId }),

      recordBall: ({ runsScored, extraType, extraRuns = 0, wicket }) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match || match.status !== 'Live') {
          get().addToast({
            type: 'error',
            title: 'Scoring Locked',
            description: 'No active live match in progress.',
          });
          return;
        }

        if (!match.strikerId || !match.nonStrikerId) {
          get().addToast({
            type: 'error',
            title: 'Select Batsmen',
            description: 'Please set striker and non-striker before recording balls.',
          });
          return;
        }

        if (!match.currentBowlerId) {
          get().addToast({
            type: 'error',
            title: 'Select Bowler',
            description: 'Please assign a bowler for this over.',
          });
          return;
        }

        const inningsIndex = match.currentInningsIndex;
        const currentInnings = JSON.parse(JSON.stringify(match.innings[inningsIndex])) as MatchInnings;

        const strikerId = match.strikerId;
        const nonStrikerId = match.nonStrikerId;
        const bowlerId = match.currentBowlerId;

        // Ensure batsman record exists
        if (!currentInnings.batsmenRecords[strikerId]) {
          currentInnings.batsmenRecords[strikerId] = {
            playerId: strikerId,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            battingOrder: Object.keys(currentInnings.batsmenRecords).length + 1,
          };
        }
        const batsmanRec = currentInnings.batsmenRecords[strikerId];

        // Ensure bowler record exists
        if (!currentInnings.bowlersRecords[bowlerId]) {
          currentInnings.bowlersRecords[bowlerId] = {
            playerId: bowlerId,
            overs: 0,
            ballsBowled: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            economyRate: 0,
            wides: 0,
            noBalls: 0,
          };
        }
        const bowlerRec = currentInnings.bowlersRecords[bowlerId];

        // Determine ball legality and extras
        const isLegal = extraType !== 'Wide' && extraType !== 'NoBall';
        let calculatedExtraRuns = 0;
        let isBoundary4 = false;
        let isBoundary6 = false;

        if (extraType === 'Wide') {
          calculatedExtraRuns = (extraRuns || 0) + 1; // standard wide = 1 + any runs scored
          currentInnings.extras.wides += calculatedExtraRuns;
          bowlerRec.wides += 1;
          bowlerRec.runsConceded += calculatedExtraRuns;
        } else if (extraType === 'NoBall') {
          calculatedExtraRuns = (extraRuns || 0) + 1; // standard no ball = 1
          currentInnings.extras.noBalls += calculatedExtraRuns;
          bowlerRec.noBalls += 1;
          bowlerRec.runsConceded += calculatedExtraRuns;
          // In a no-ball, batsman runs off the bat still count for batsman
          if (runsScored > 0) {
            batsmanRec.runs += runsScored;
            bowlerRec.runsConceded += runsScored;
            if (runsScored === 4) isBoundary4 = true;
            if (runsScored === 6) isBoundary6 = true;
          }
          batsmanRec.balls += 1;
        } else if (extraType === 'Bye') {
          calculatedExtraRuns = runsScored || extraRuns || 1;
          currentInnings.extras.byes += calculatedExtraRuns;
          // Byes do NOT count against bowler's runs conceded
          batsmanRec.balls += 1;
        } else if (extraType === 'LegBye') {
          calculatedExtraRuns = runsScored || extraRuns || 1;
          currentInnings.extras.legByes += calculatedExtraRuns;
          // Leg byes do NOT count against bowler
          batsmanRec.balls += 1;
        } else {
          // Standard ball off bat
          batsmanRec.runs += runsScored;
          batsmanRec.balls += 1;
          bowlerRec.runsConceded += runsScored;

          if (runsScored === 4) {
            batsmanRec.fours += 1;
            isBoundary4 = true;
            get().addToast({ type: 'boundary', title: 'FOUR! 🏏', description: 'Boundary smashed to the fence!' });
          } else if (runsScored === 6) {
            batsmanRec.sixes += 1;
            isBoundary6 = true;
            get().addToast({ type: 'boundary', title: 'SIX! 💥', description: 'Massive maximum over the ropes!' });
          }
        }

        currentInnings.extras.total =
          currentInnings.extras.wides +
          currentInnings.extras.noBalls +
          currentInnings.extras.byes +
          currentInnings.extras.legByes +
          currentInnings.extras.penalty;

        const totalRunsThisBall =
          extraType === 'Bye' || extraType === 'LegBye'
            ? calculatedExtraRuns
            : runsScored + calculatedExtraRuns;

        currentInnings.totalRuns += totalRunsThisBall;

        // Partnership updates
        currentInnings.currentPartnership.runs += totalRunsThisBall;
        if (isLegal) {
          currentInnings.currentPartnership.balls += 1;
          currentInnings.legalBallsBowled += 1;
          bowlerRec.ballsBowled += 1;
        }

        // Batsman Strike Rate
        batsmanRec.strikeRate = batsmanRec.balls > 0 ? Number(((batsmanRec.runs / batsmanRec.balls) * 100).toFixed(1)) : 0;

        // Bowler overs and economy rate
        const fullOvers = Math.floor(bowlerRec.ballsBowled / 6);
        const remainderBalls = bowlerRec.ballsBowled % 6;
        bowlerRec.overs = Number(`${fullOvers}.${remainderBalls}`);
        bowlerRec.economyRate =
          bowlerRec.ballsBowled > 0 ? Number(((bowlerRec.runsConceded / bowlerRec.ballsBowled) * 6).toFixed(2)) : 0;

        // Over handling
        const currentOverNumber = Math.floor((currentInnings.legalBallsBowled - (isLegal ? 1 : 0)) / 6);
        let overData = currentInnings.overs.find((o) => o.overNumber === currentOverNumber);
        if (!overData) {
          overData = {
            overNumber: currentOverNumber,
            bowlerId,
            balls: [],
            isComplete: false,
            maidenOver: false,
            runsConceded: 0,
            wicketsTaken: 0,
          };
          currentInnings.overs.push(overData);
        }

        const ballEvent: BallDelivery = {
          ballNumber: overData.balls.length + 1,
          overNumber: currentOverNumber,
          bowlerId,
          strikerId,
          nonStrikerId,
          runsScored,
          extraType,
          extraRuns: calculatedExtraRuns,
          totalRuns: totalRunsThisBall,
          isLegalDelivery: isLegal,
          wicket,
          isBoundary4,
          isBoundary6,
          isFreeHit: match.isFreeHitNext,
          givesFreeHitNext: extraType === 'NoBall',
          timestamp: new Date().toISOString(),
        };

        overData.balls.push(ballEvent);
        if (extraType !== 'Bye' && extraType !== 'LegBye') {
          overData.runsConceded += totalRunsThisBall;
        }

        // Wicket Processing
        let newStrikerId = strikerId;
        let newNonStrikerId = nonStrikerId;
        let wicketFallen = false;

        if (wicket) {
          wicketFallen = true;
          currentInnings.wickets += 1;
          overData.wicketsTaken += 1;

          // Credit bowler with wicket (except Run Out)
          if (wicket.dismissalType !== 'Run Out' && wicket.dismissalType !== 'Retired Hurt') {
            bowlerRec.wickets += 1;
          }

          // Mark out batsman
          const outBatsmanRec = currentInnings.batsmenRecords[wicket.batsmanId];
          if (outBatsmanRec) {
            outBatsmanRec.isOut = true;
            outBatsmanRec.dismissal = wicket;
          }

          const outPlayerObj = state.players.find((p) => p.id === wicket.batsmanId);
          const oversFormatted = `${Math.floor(currentInnings.legalBallsBowled / 6)}.${currentInnings.legalBallsBowled % 6}`;

          currentInnings.fallOfWickets.push({
            wicketNumber: currentInnings.wickets,
            teamScore: currentInnings.totalRuns,
            overs: oversFormatted,
            batsmanName: outPlayerObj?.name || 'Batsman',
            batsmanId: wicket.batsmanId,
          });

          // Reset partnership
          currentInnings.currentPartnership = {
            batsman1Id: wicket.batsmanId === strikerId ? nonStrikerId : strikerId,
            batsman2Id: '',
            runs: 0,
            balls: 0,
          };

          if (wicket.batsmanId === strikerId) {
            newStrikerId = ''; // Requires next batsman prompt
          } else {
            newNonStrikerId = ''; // Requires next batsman prompt
          }

          get().addToast({
            type: 'wicket',
            title: 'WICKET! ☝️',
            description: `${outPlayerObj?.name || 'Batsman'} dismissed (${wicket.dismissalType})! Score: ${currentInnings.totalRuns}/${currentInnings.wickets}`,
          });
        }

        // Strike rotation logic
        // 1. If odd runs were scored off the bat or byes/leg-byes, batsmen rotate strike
        const physicalRuns = runsScored || (extraType === 'Bye' || extraType === 'LegBye' ? calculatedExtraRuns : 0);
        let rotatedStriker = newStrikerId;
        let rotatedNonStriker = newNonStrikerId;

        if (physicalRuns % 2 === 1 && newStrikerId && newNonStrikerId) {
          rotatedStriker = newNonStrikerId;
          rotatedNonStriker = newStrikerId;
        }

        // 2. Over Completion check
        let isOverComplete = false;
        let nextBowlerId = match.currentBowlerId;
        let prevBowlerId = match.previousBowlerId;

        if (isLegal && currentInnings.legalBallsBowled % 6 === 0) {
          isOverComplete = true;
          overData.isComplete = true;

          // Check if maiden over
          if (overData.runsConceded === 0) {
            overData.maidenOver = true;
            bowlerRec.maidens += 1;
            get().addToast({
              type: 'info',
              title: 'Maiden Over! 🎯',
              description: 'Zero runs conceded in this over!',
            });
          }

          // Rule: Change Bowler at end of over, preventing consecutive overs
          prevBowlerId = bowlerId;
          nextBowlerId = null; // Forces bowler selection prompt

          // Batsmen swap ends at the end of the over
          if (rotatedStriker && rotatedNonStriker) {
            const temp = rotatedStriker;
            rotatedStriker = rotatedNonStriker;
            rotatedNonStriker = temp;
          }

          get().addToast({
            type: 'info',
            title: `Over ${Math.floor(currentInnings.legalBallsBowled / 6)} Complete`,
            description: `Score: ${currentInnings.totalRuns}/${currentInnings.wickets}. Please assign the next bowler.`,
          });
        }

        // Check Innings/Match End Condition
        const allOut = currentInnings.wickets >= 10;
        const oversFinished = currentInnings.legalBallsBowled >= currentInnings.oversLimit * 6;
        let updatedMatchStatus: MatchStatus = match.status;
        let resultSummary = match.resultSummary;
        let winningTeamId = match.winningTeamId;

        // 2nd Innings Target reached check
        if (inningsIndex === 1 && match.target) {
          if (currentInnings.totalRuns >= match.target) {
            updatedMatchStatus = 'Completed';
            const wicketsLeft = 10 - currentInnings.wickets;
            const ballsLeft = currentInnings.oversLimit * 6 - currentInnings.legalBallsBowled;
            const battingTeam = state.teams.find((t) => t.id === currentInnings.battingTeamId);
            winningTeamId = currentInnings.battingTeamId;
            resultSummary = `${battingTeam?.name || 'Chasing Team'} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''} (with ${ballsLeft} ball${ballsLeft !== 1 ? 's' : ''} remaining)!`;

            get().addToast({
              type: 'success',
              title: 'MATCH WON! 🏆',
              description: resultSummary,
              durationMs: 6000,
            });
          } else if (allOut || oversFinished) {
            updatedMatchStatus = 'Completed';
            const margin = match.target - 1 - currentInnings.totalRuns;
            if (margin > 0) {
              const defTeam = state.teams.find((t) => t.id === currentInnings.bowlingTeamId);
              winningTeamId = currentInnings.bowlingTeamId;
              resultSummary = `${defTeam?.name || 'Defending Team'} won by ${margin} run${margin !== 1 ? 's' : ''}!`;
            } else {
              resultSummary = 'Match Tied!';
            }
            get().addToast({
              type: 'success',
              title: 'Match Finished!',
              description: resultSummary,
              durationMs: 6000,
            });
          }
        } else if (inningsIndex === 0 && (allOut || oversFinished)) {
          updatedMatchStatus = 'Innings Break';
          currentInnings.isCompleted = true;
          get().addToast({
            type: 'info',
            title: '1st Innings Concluded',
            description: `Target set to ${currentInnings.totalRuns + 1} runs in ${currentInnings.oversLimit} overs.`,
            durationMs: 5000,
          });
        }

        const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];
        updatedInnings[inningsIndex] = currentInnings;

        const updatedMatch: CricketMatch = {
          ...match,
          innings: updatedInnings,
          strikerId: rotatedStriker,
          nonStrikerId: rotatedNonStriker,
          currentBowlerId: nextBowlerId,
          previousBowlerId: prevBowlerId,
          isFreeHitNext: extraType === 'NoBall',
          target: inningsIndex === 0 && (allOut || oversFinished) ? currentInnings.totalRuns + 1 : match.target,
          status: updatedMatchStatus,
          resultSummary,
          winningTeamId,
          completedAt: updatedMatchStatus === 'Completed' ? new Date().toISOString() : undefined,
        };

        set((prevState) => ({
          matches: prevState.matches.map((m) => (m.id === match.id ? updatedMatch : m)),
        }));
      },

      rotateStrike: () => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match || !match.strikerId || !match.nonStrikerId) return;

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  strikerId: m.nonStrikerId,
                  nonStrikerId: m.strikerId,
                }
              : m
          ),
        }));

        get().addToast({
          type: 'info',
          title: 'Strike Rotated',
          description: 'Striker and non-striker swapped ends.',
        });
      },

      setBowler: (bowlerId) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return false;

        // Rule: Prevent bowler from bowling consecutive overs in limited-overs cricket
        if (match.previousBowlerId && match.previousBowlerId === bowlerId) {
          get().addToast({
            type: 'error',
            title: 'Rule Violation',
            description: 'A bowler cannot bowl two consecutive overs!',
          });
          return false;
        }

        const inningsIndex = match.currentInningsIndex;
        const currentInnings = { ...match.innings[inningsIndex] };

        if (!currentInnings.bowlersRecords[bowlerId]) {
          currentInnings.bowlersRecords[bowlerId] = {
            playerId: bowlerId,
            overs: 0,
            ballsBowled: 0,
            maidens: 0,
            runsConceded: 0,
            wickets: 0,
            economyRate: 0,
            wides: 0,
            noBalls: 0,
          };
        }

        const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];
        updatedInnings[inningsIndex] = currentInnings;

        const bowlerObj = state.players.find((p) => p.id === bowlerId);

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  innings: updatedInnings,
                  currentBowlerId: bowlerId,
                }
              : m
          ),
        }));

        get().addToast({
          type: 'info',
          title: 'Bowler Assigned',
          description: `${bowlerObj?.name || 'Bowler'} is set to bowl the current over.`,
        });

        return true;
      },

      setNextBatsman: (batsmanId, position) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        const inningsIndex = match.currentInningsIndex;
        const currentInnings = { ...match.innings[inningsIndex] };

        if (!currentInnings.batsmenRecords[batsmanId]) {
          currentInnings.batsmenRecords[batsmanId] = {
            playerId: batsmanId,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            battingOrder: Object.keys(currentInnings.batsmenRecords).length + 1,
          };
        }

        const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];
        updatedInnings[inningsIndex] = currentInnings;

        const batsmanObj = state.players.find((p) => p.id === batsmanId);

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  innings: updatedInnings,
                  strikerId: position === 'striker' ? batsmanId : m.strikerId,
                  nonStrikerId: position === 'nonStriker' ? batsmanId : m.nonStrikerId,
                }
              : m
          ),
        }));

        get().addToast({
          type: 'info',
          title: 'Batsman In',
          description: `${batsmanObj?.name || 'Batsman'} has taken the crease as ${position}.`,
        });
      },

      undoLastBall: () => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        // Clone current match and recalculate this innings from its full ball-by-ball timeline
        const inningsIndex = match.currentInningsIndex;
        const currentInnings = JSON.parse(JSON.stringify(match.innings[inningsIndex])) as MatchInnings;

        // Find the last over with balls
        const lastOver = currentInnings.overs[currentInnings.overs.length - 1];
        if (!lastOver || lastOver.balls.length === 0) {
          get().addToast({
            type: 'info',
            title: 'No Deliveries',
            description: 'No ball available to undo in current innings.',
          });
          return;
        }

        const removedBall = lastOver.balls.pop();
        if (lastOver.balls.length === 0) {
          currentInnings.overs.pop();
        }

        // Reconstruct whole innings from remaining balls in all overs to guarantee 100% precision
        const battingTeamId = currentInnings.battingTeamId;
        const bowlingTeamId = currentInnings.bowlingTeamId;
        const oversLimit = currentInnings.oversLimit;
        const rebuiltInnings = createEmptyInnings(battingTeamId, bowlingTeamId, oversLimit);

        // Collect all balls in order
        const allBalls: BallDelivery[] = [];
        for (const over of currentInnings.overs) {
          for (const ball of over.balls) {
            allBalls.push(ball);
          }
        }

        // Replay all balls
        let currentStriker = removedBall ? removedBall.strikerId : match.strikerId;
        let currentNonStriker = removedBall ? removedBall.nonStrikerId : match.nonStrikerId;
        let currentBowler = removedBall ? removedBall.bowlerId : match.currentBowlerId;

        // Set initial batsmen
        const initialBatsmen = Object.keys(currentInnings.batsmenRecords);
        if (initialBatsmen.length >= 2) {
          rebuiltInnings.batsmenRecords[initialBatsmen[0]] = {
            playerId: initialBatsmen[0],
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            battingOrder: 1,
          };
          rebuiltInnings.batsmenRecords[initialBatsmen[1]] = {
            playerId: initialBatsmen[1],
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            battingOrder: 2,
          };
        }

        for (const b of allBalls) {
          // ensure records
          if (!rebuiltInnings.batsmenRecords[b.strikerId]) {
            rebuiltInnings.batsmenRecords[b.strikerId] = {
              playerId: b.strikerId,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              isOut: false,
              battingOrder: Object.keys(rebuiltInnings.batsmenRecords).length + 1,
            };
          }
          const bat = rebuiltInnings.batsmenRecords[b.strikerId];

          if (!rebuiltInnings.bowlersRecords[b.bowlerId]) {
            rebuiltInnings.bowlersRecords[b.bowlerId] = {
              playerId: b.bowlerId,
              overs: 0,
              ballsBowled: 0,
              maidens: 0,
              runsConceded: 0,
              wickets: 0,
              economyRate: 0,
              wides: 0,
              noBalls: 0,
            };
          }
          const bowl = rebuiltInnings.bowlersRecords[b.bowlerId];

          if (b.extraType === 'Wide') {
            rebuiltInnings.extras.wides += b.extraRuns;
            bowl.wides += 1;
            bowl.runsConceded += b.extraRuns;
          } else if (b.extraType === 'NoBall') {
            rebuiltInnings.extras.noBalls += b.extraRuns;
            bowl.noBalls += 1;
            bowl.runsConceded += b.extraRuns;
            if (b.runsScored > 0) {
              bat.runs += b.runsScored;
              bowl.runsConceded += b.runsScored;
              if (b.isBoundary4) bat.fours += 1;
              if (b.isBoundary6) bat.sixes += 1;
            }
            bat.balls += 1;
          } else if (b.extraType === 'Bye') {
            rebuiltInnings.extras.byes += b.extraRuns;
            bat.balls += 1;
          } else if (b.extraType === 'LegBye') {
            rebuiltInnings.extras.legByes += b.extraRuns;
            bat.balls += 1;
          } else {
            bat.runs += b.runsScored;
            bat.balls += 1;
            bowl.runsConceded += b.runsScored;
            if (b.isBoundary4) bat.fours += 1;
            if (b.isBoundary6) bat.sixes += 1;
          }

          rebuiltInnings.totalRuns += b.totalRuns;
          if (b.isLegalDelivery) {
            rebuiltInnings.legalBallsBowled += 1;
            bowl.ballsBowled += 1;
          }

          bat.strikeRate = bat.balls > 0 ? Number(((bat.runs / bat.balls) * 100).toFixed(1)) : 0;
          bowl.overs = Number(`${Math.floor(bowl.ballsBowled / 6)}.${bowl.ballsBowled % 6}`);
          bowl.economyRate = bowl.ballsBowled > 0 ? Number(((bowl.runsConceded / bowl.ballsBowled) * 6).toFixed(2)) : 0;

          if (b.wicket) {
            rebuiltInnings.wickets += 1;
            if (b.wicket.dismissalType !== 'Run Out' && b.wicket.dismissalType !== 'Retired Hurt') {
              bowl.wickets += 1;
            }
            if (rebuiltInnings.batsmenRecords[b.wicket.batsmanId]) {
              rebuiltInnings.batsmenRecords[b.wicket.batsmanId].isOut = true;
              rebuiltInnings.batsmenRecords[b.wicket.batsmanId].dismissal = b.wicket;
            }
            const outPlayer = state.players.find((p) => p.id === b.wicket.batsmanId);
            rebuiltInnings.fallOfWickets.push({
              wicketNumber: rebuiltInnings.wickets,
              teamScore: rebuiltInnings.totalRuns,
              overs: `${Math.floor(rebuiltInnings.legalBallsBowled / 6)}.${rebuiltInnings.legalBallsBowled % 6}`,
              batsmanName: outPlayer?.name || 'Batsman',
              batsmanId: b.wicket.batsmanId,
            });
          }
        }

        rebuiltInnings.overs = currentInnings.overs;
        rebuiltInnings.extras.total =
          rebuiltInnings.extras.wides +
          rebuiltInnings.extras.noBalls +
          rebuiltInnings.extras.byes +
          rebuiltInnings.extras.legByes +
          rebuiltInnings.extras.penalty;

        const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];
        updatedInnings[inningsIndex] = rebuiltInnings;

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  innings: updatedInnings,
                  strikerId: currentStriker,
                  nonStrikerId: currentNonStriker,
                  currentBowlerId: currentBowler,
                  status: 'Live',
                }
              : m
          ),
        }));

        get().addToast({
          type: 'info',
          title: 'Delivery Undone',
          description: 'Last ball successfully reversed and statistics synchronized.',
        });
      },

      endInnings: () => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        if (match.currentInningsIndex === 0) {
          const innings1 = { ...match.innings[0], isCompleted: true };
          const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];
          updatedInnings[0] = innings1;

          set((prevState) => ({
            matches: prevState.matches.map((m) =>
              m.id === match.id
                ? {
                    ...m,
                    innings: updatedInnings,
                    status: 'Innings Break',
                    target: innings1.totalRuns + 1,
                  }
                : m
            ),
          }));

          get().addToast({
            type: 'info',
            title: 'Innings Ended',
            description: `1st Innings concluded. Target set to ${innings1.totalRuns + 1} runs.`,
          });
        } else {
          // End match manually
          get().concludeMatchManually();
        }
      },

      startSecondInnings: (strikerId, nonStrikerId, openingBowlerId) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        const innings2 = createEmptyInnings(match.innings[0].bowlingTeamId, match.innings[0].battingTeamId, match.oversLimit);

        innings2.batsmenRecords[strikerId] = {
          playerId: strikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
          battingOrder: 1,
        };
        innings2.batsmenRecords[nonStrikerId] = {
          playerId: nonStrikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
          battingOrder: 2,
        };

        innings2.bowlersRecords[openingBowlerId] = {
          playerId: openingBowlerId,
          overs: 0,
          ballsBowled: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          economyRate: 0,
          wides: 0,
          noBalls: 0,
        };

        innings2.currentPartnership = {
          batsman1Id: strikerId,
          batsman2Id: nonStrikerId,
          runs: 0,
          balls: 0,
        };

        const updatedInnings = [match.innings[0], innings2] as [MatchInnings, MatchInnings];

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  currentInningsIndex: 1,
                  innings: updatedInnings,
                  strikerId,
                  nonStrikerId,
                  currentBowlerId: openingBowlerId,
                  previousBowlerId: null,
                  status: 'Live',
                }
              : m
          ),
        }));

        get().addToast({
          type: 'success',
          title: '2nd Innings Underway',
          description: `Target: ${match.target || 0} runs to win.`,
        });
      },

      toggleRainDelay: (note) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        if (match.status === 'Rain Delay') {
          // Resume match
          const delays = [...match.rainDelays];
          if (delays.length > 0) {
            const last = delays[delays.length - 1];
            last.resumedAt = new Date().toISOString();
            const start = new Date(last.pausedAt).getTime();
            const end = new Date(last.resumedAt).getTime();
            last.durationMinutes = Math.round((end - start) / 60000);
          }

          set((prevState) => ({
            matches: prevState.matches.map((m) =>
              m.id === match.id
                ? {
                    ...m,
                    status: 'Live',
                    rainDelays: delays,
                  }
                : m
            ),
          }));

          get().addToast({
            type: 'success',
            title: 'Match Resumed! ☀️',
            description: 'Rain delay concluded. Live play resumed.',
          });
        } else {
          // Pause for rain
          const newDelay = {
            pausedAt: new Date().toISOString(),
            note: note || 'Covers brought on due to inclement weather.',
          };

          set((prevState) => ({
            matches: prevState.matches.map((m) =>
              m.id === match.id
                ? {
                    ...m,
                    status: 'Rain Delay',
                    rainDelays: [...m.rainDelays, newDelay],
                  }
                : m
            ),
          }));

          get().addToast({
            type: 'info',
            title: 'Rain Delay Activated 🌧️',
            description: 'Match paused and delay timestamp logged.',
          });
        }
      },

      applyDLS: (revisedOvers, targetReduction = 0) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        const originalTarget = match.target || match.innings[0].totalRuns + 1;
        // Simplified DLS standard calculation
        let newTarget = originalTarget;
        if (targetReduction > 0) {
          newTarget = Math.max(1, originalTarget - targetReduction);
        } else if (revisedOvers < match.oversLimit) {
          // Proportional resource reduction
          const ratio = revisedOvers / match.oversLimit;
          newTarget = Math.max(1, Math.round(originalTarget * ratio));
        }

        const delays = [...match.rainDelays];
        if (delays.length > 0) {
          delays[delays.length - 1].revisedOvers = revisedOvers;
          delays[delays.length - 1].revisedTarget = newTarget;
        }

        const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];
        updatedInnings[1].oversLimit = revisedOvers;

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  target: newTarget,
                  dlsTarget: newTarget,
                  dlsApplied: true,
                  rainDelays: delays,
                  innings: updatedInnings,
                }
              : m
          ),
        }));

        get().addToast({
          type: 'info',
          title: 'DLS Target Applied',
          description: `Revised target: ${newTarget} runs in ${revisedOvers} overs.`,
        });
      },

      updateMatchOversLimit: (matchId, newOversLimit, revisedTarget) => {
        const state = get();
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) return;

        const clampedOvers = Math.max(1, Math.min(100, Math.round(newOversLimit)));
        const updatedInnings = [...match.innings] as [MatchInnings, MatchInnings];

        // Update overs limit for both innings
        updatedInnings[0] = { ...updatedInnings[0], oversLimit: clampedOvers };
        updatedInnings[1] = { ...updatedInnings[1], oversLimit: clampedOvers };

        let updatedTarget = match.target;
        if (revisedTarget !== undefined && revisedTarget > 0) {
          updatedTarget = revisedTarget;
        } else if (match.currentInningsIndex === 1 && match.target && clampedOvers !== match.oversLimit) {
          // Proportionally adjust target if 2nd innings is underway
          const ratio = clampedOvers / match.oversLimit;
          updatedTarget = Math.max(1, Math.round(match.target * ratio));
        }

        const currentInn = updatedInnings[match.currentInningsIndex];
        const oversFinished = currentInn.legalBallsBowled >= clampedOvers * 6;
        let newStatus = match.status;
        let resultSummary = match.resultSummary;
        let winningTeamId = match.winningTeamId;

        if (oversFinished && match.status === 'Live') {
          if (match.currentInningsIndex === 0) {
            newStatus = 'Innings Break';
            currentInn.isCompleted = true;
            updatedTarget = currentInn.totalRuns + 1;
          } else {
            newStatus = 'Completed';
            const targetScore = updatedTarget || updatedInnings[0].totalRuns + 1;
            if (currentInn.totalRuns >= targetScore) {
              const team = state.teams.find((t) => t.id === currentInn.battingTeamId);
              winningTeamId = currentInn.battingTeamId;
              resultSummary = `${team?.name || 'Batting Team'} won the match!`;
            } else {
              const team = state.teams.find((t) => t.id === currentInn.bowlingTeamId);
              winningTeamId = currentInn.bowlingTeamId;
              resultSummary = `${team?.name || 'Defending Team'} won by ${targetScore - 1 - currentInn.totalRuns} runs!`;
            }
          }
        }

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  oversLimit: clampedOvers,
                  innings: updatedInnings,
                  target: updatedTarget,
                  status: newStatus,
                  resultSummary,
                  winningTeamId,
                  completedAt: newStatus === 'Completed' ? new Date().toISOString() : m.completedAt,
                }
              : m
          ),
        }));

        get().addToast({
          type: 'success',
          title: 'Overs Limit Updated',
          description: `Match overs set to ${clampedOvers} overs.${updatedTarget ? ` Target: ${updatedTarget} runs.` : ''}`,
        });
      },

      concludeMatchManually: (resultText) => {
        const state = get();
        const match = state.matches.find((m) => m.id === state.activeMatchId);
        if (!match) return;

        let summary = resultText;
        let winningTeamId = match.winningTeamId;

        if (!summary) {
          const inn1 = match.innings[0];
          const inn2 = match.innings[1];
          if (inn2.totalRuns >= (match.target || inn1.totalRuns + 1)) {
            const team = state.teams.find((t) => t.id === inn2.battingTeamId);
            winningTeamId = inn2.battingTeamId;
            summary = `${team?.name || 'Team'} won by ${10 - inn2.wickets} wickets!`;
          } else if (inn2.totalRuns < inn1.totalRuns) {
            const team = state.teams.find((t) => t.id === inn1.battingTeamId);
            winningTeamId = inn1.battingTeamId;
            summary = `${team?.name || 'Team'} won by ${inn1.totalRuns - inn2.totalRuns} runs!`;
          } else {
            summary = 'Match Tied!';
          }
        }

        set((prevState) => ({
          matches: prevState.matches.map((m) =>
            m.id === match.id
              ? {
                  ...m,
                  status: 'Completed',
                  resultSummary: summary,
                  winningTeamId,
                  completedAt: new Date().toISOString(),
                }
              : m
          ),
        }));

        get().addToast({
          type: 'success',
          title: 'Match Concluded',
          description: summary,
        });
      },

      // Automatic Stats Engine
      getPlayerStats: (playerId, tournamentId) => {
        const state = get();
        const player = state.players.find((p) => p.id === playerId);
        const team = state.teams.find((t) => t.id === player?.teamId);

        const batting = {
          matches: 0,
          innings: 0,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          average: 0,
          highScore: 0,
          isHighScoreNotOut: false,
          fifties: 0,
          hundreds: 0,
          notOuts: 0,
        };

        const bowling = {
          matches: 0,
          innings: 0,
          balls: 0,
          oversFormatted: '0.0',
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          economyRate: 0,
          average: 0,
          bestBowlingFigures: '0/0',
          bestWickets: 0,
          bestRuns: 9999,
          fiveWickets: 0,
        };

        const fielding = {
          catches: 0,
          runOuts: 0,
          stumpings: 0,
        };

        let timesDismissed = 0;

        // Filter matches based on tournament if provided
        const eligibleMatches = state.matches.filter(
          (m) => !tournamentId || m.tournamentId === tournamentId
        );

        for (const match of eligibleMatches) {
          let playerBattedInMatch = false;
          let playerBowledInMatch = false;

          for (const innings of match.innings) {
            // Batting check
            const batRec = innings.batsmenRecords[playerId];
            if (batRec && batRec.balls > 0) {
              playerBattedInMatch = true;
              batting.innings += 1;
              batting.runs += batRec.runs;
              batting.balls += batRec.balls;
              batting.fours += batRec.fours;
              batting.sixes += batRec.sixes;

              if (batRec.runs >= 100) batting.hundreds += 1;
              else if (batRec.runs >= 50) batting.fifties += 1;

              if (batRec.isOut) {
                timesDismissed += 1;
              } else {
                batting.notOuts += 1;
              }

              if (batRec.runs > batting.highScore) {
                batting.highScore = batRec.runs;
                batting.isHighScoreNotOut = !batRec.isOut;
              }
            }

            // Bowling check
            const bowlRec = innings.bowlersRecords[playerId];
            if (bowlRec && bowlRec.ballsBowled > 0) {
              playerBowledInMatch = true;
              bowling.innings += 1;
              bowling.balls += bowlRec.ballsBowled;
              bowling.maidens += bowlRec.maidens;
              bowling.runsConceded += bowlRec.runsConceded;
              bowling.wickets += bowlRec.wickets;

              // Best bowling figures check
              if (
                bowlRec.wickets > bowling.bestWickets ||
                (bowlRec.wickets === bowling.bestWickets && bowlRec.runsConceded < bowling.bestRuns && bowlRec.wickets > 0)
              ) {
                bowling.bestWickets = bowlRec.wickets;
                bowling.bestRuns = bowlRec.runsConceded;
                bowling.bestBowlingFigures = `${bowlRec.wickets}/${bowlRec.runsConceded}`;
              }

              if (bowlRec.wickets >= 5) {
                bowling.fiveWickets += 1;
              }
            }

            // Fielding check
            for (const fow of innings.fallOfWickets) {
              const outBat = innings.batsmenRecords[fow.batsmanId];
              if (outBat && outBat.dismissal && outBat.dismissal.fielderId === playerId) {
                if (outBat.dismissal.dismissalType === 'Caught') {
                  fielding.catches += 1;
                } else if (outBat.dismissal.dismissalType === 'Run Out') {
                  fielding.runOuts += 1;
                } else if (outBat.dismissal.dismissalType === 'Stumped') {
                  fielding.stumpings += 1;
                }
              }
            }
          }

          if (playerBattedInMatch || playerBowledInMatch) {
            batting.matches += 1;
            bowling.matches += 1;
          }
        }

        // Calculations
        batting.strikeRate = batting.balls > 0 ? Number(((batting.runs / batting.balls) * 100).toFixed(1)) : 0;
        batting.average = timesDismissed > 0 ? Number((batting.runs / timesDismissed).toFixed(1)) : batting.runs;

        const oversWhole = Math.floor(bowling.balls / 6);
        const ballsRemainder = bowling.balls % 6;
        bowling.oversFormatted = `${oversWhole}.${ballsRemainder}`;
        bowling.economyRate = bowling.balls > 0 ? Number(((bowling.runsConceded / bowling.balls) * 6).toFixed(2)) : 0;
        bowling.average = bowling.wickets > 0 ? Number((bowling.runsConceded / bowling.wickets).toFixed(1)) : 0;

        return {
          playerId,
          playerName: player?.name || 'Unknown Player',
          teamId: player?.teamId || '',
          teamName: team ? (team.isDeleted ? `${team.name} (Deleted)` : team.name) : 'Free Agent',
          batting,
          bowling,
          fielding,
        };
      },

      getAllPlayersStats: (tournamentId) => {
        const state = get();
        return state.players.map((p) => state.getPlayerStats(p.id, tournamentId));
      },

      recalculateStats: () => {
        // Force full re-verification of all match fall of wickets and calculations
        const state = get();
        const refreshedMatches = state.matches.map((match) => {
          const newInnings = match.innings.map((inn) => {
            let totalRunsCalc = 0;
            let wicketsCalc = 0;
            for (const batId in inn.batsmenRecords) {
              const bat = inn.batsmenRecords[batId];
              totalRunsCalc += bat.runs;
              if (bat.isOut) wicketsCalc += 1;
            }
            totalRunsCalc += inn.extras.total;

            return {
              ...inn,
              totalRuns: totalRunsCalc,
              wickets: wicketsCalc,
            };
          }) as [MatchInnings, MatchInnings];

          return { ...match, innings: newInnings };
        });

        set({ matches: refreshedMatches });
        get().addToast({
          type: 'success',
          title: 'Stats Recalculated',
          description: 'All player statistics and tournament rankings verified across the database.',
        });
      },

      recalculateAllStats: () => {
        get().recalculateStats();
      },

      adminOverridePlayerStats: (playerId, overrides) => {
        const state = get();
        // Look up matches where the player participated and adjust the most recent record or attach correction
        const matchesWithPlayer = state.matches.filter((m) =>
          m.innings.some((inn) => inn.batsmenRecords[playerId] || inn.bowlersRecords[playerId])
        );

        if (matchesWithPlayer.length > 0) {
          const targetMatch = matchesWithPlayer[matchesWithPlayer.length - 1];
          const updatedInnings = targetMatch.innings.map((inn) => {
            const newInn = { ...inn };
            if (newInn.batsmenRecords[playerId]) {
              newInn.batsmenRecords = {
                ...newInn.batsmenRecords,
                [playerId]: {
                  ...newInn.batsmenRecords[playerId],
                  runs: overrides.runs !== undefined ? overrides.runs : newInn.batsmenRecords[playerId].runs,
                  fours: overrides.fours !== undefined ? overrides.fours : newInn.batsmenRecords[playerId].fours,
                  sixes: overrides.sixes !== undefined ? overrides.sixes : newInn.batsmenRecords[playerId].sixes,
                },
              };
            }
            if (newInn.bowlersRecords[playerId]) {
              newInn.bowlersRecords = {
                ...newInn.bowlersRecords,
                [playerId]: {
                  ...newInn.bowlersRecords[playerId],
                  wickets: overrides.wickets !== undefined ? overrides.wickets : newInn.bowlersRecords[playerId].wickets,
                },
              };
            }
            return newInn;
          }) as [MatchInnings, MatchInnings];

          set((prevState) => ({
            matches: prevState.matches.map((m) =>
              m.id === targetMatch.id ? { ...m, innings: updatedInnings } : m
            ),
          }));
        }

        get().addToast({
          type: 'success',
          title: 'Admin Override Applied',
          description: 'Stats successfully updated and recalculated.',
        });
      },

      deleteInnings: (matchId) => {
        get().deleteMatch(matchId);
      },

      deleteMatch: (matchId) => {
        set((state) => ({
          matches: state.matches.filter((m) => m.id !== matchId),
          activeMatchId: state.activeMatchId === matchId ? null : state.activeMatchId,
          scorecardMatchId: state.scorecardMatchId === matchId ? null : state.scorecardMatchId,
        }));
        get().addToast({
          type: 'info',
          title: 'Match Record Deleted',
          description: 'Match record and its individual player stats contributions were deleted.',
        });
      },

      clearAllStats: () => {
        set({
          matches: [],
          activeMatchId: null,
          scorecardMatchId: null,
        });
        get().addToast({
          type: 'info',
          title: 'All Statistics Cleared',
          description: 'All match records deleted. All player stats reset to zero.',
        });
      },

      clearTournamentStats: (tournamentId) => {
        set((state) => ({
          matches: state.matches.filter((m) => m.tournamentId !== tournamentId),
          activeMatchId:
            state.matches.find((m) => m.id === state.activeMatchId)?.tournamentId === tournamentId
              ? null
              : state.activeMatchId,
          scorecardMatchId: null,
        }));
        get().addToast({
          type: 'info',
          title: 'Tournament Stats Cleared',
          description: 'All match records and statistics for this tournament have been cleared.',
        });
      },

      resetPlayerStats: (playerId) => {
        set((state) => {
          const updatedMatches = state.matches.map((m) => {
            const updatedInnings = m.innings.map((inn) => {
              const newBatsmen = { ...inn.batsmenRecords };
              delete newBatsmen[playerId];
              const newBowlers = { ...inn.bowlersRecords };
              delete newBowlers[playerId];
              return {
                ...inn,
                batsmenRecords: newBatsmen,
                bowlersRecords: newBowlers,
              };
            }) as [MatchInnings, MatchInnings];
            return { ...m, innings: updatedInnings };
          });
          return { matches: updatedMatches };
        });
        get().addToast({
          type: 'info',
          title: 'Player Stats Cleared',
          description: 'Accumulated match figures for this player were reset to zero.',
        });
      },

      clearAllMockData: () => {
        set({
          teams: [],
          players: [],
          tournaments: [],
          matches: [],
          activeMatchId: null,
        });
        get().addToast({
          type: 'success',
          title: 'UI Cleared',
          description: 'All mock data removed. Fresh clean slate ready.',
        });
      },

      createQuickMatchTeams: () => {
        const teamAId = 'team-' + Math.random().toString(36).substring(2, 8);
        const teamBId = 'team-' + Math.random().toString(36).substring(2, 8);
        const teamA: Team = {
          id: teamAId,
          name: 'Team Red',
          shortCode: 'RED',
          logoColor: '#f43f5e',
          homeCity: 'Red Lions',
          isDeleted: false,
          createdAt: new Date().toISOString(),
        };
        const teamB: Team = {
          id: teamBId,
          name: 'Team Blue',
          shortCode: 'BLU',
          logoColor: '#0284c7',
          homeCity: 'Blue Hawks',
          isDeleted: false,
          createdAt: new Date().toISOString(),
        };
        const redPlayers: Player[] = Array.from({ length: 11 }, (_, i) => ({
          id: `p-red-${i + 1}-${Math.random().toString(36).substring(2, 6)}`,
          name: `Red Player ${i + 1}`,
          teamId: teamAId,
          role: i < 4 ? 'Batsman' : i < 7 ? 'All-rounder' : 'Bowler',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm medium',
          isDeleted: false,
          createdAt: new Date().toISOString(),
        }));
        const bluePlayers: Player[] = Array.from({ length: 11 }, (_, i) => ({
          id: `p-blu-${i + 1}-${Math.random().toString(36).substring(2, 6)}`,
          name: `Blue Player ${i + 1}`,
          teamId: teamBId,
          role: i < 4 ? 'Batsman' : i < 7 ? 'All-rounder' : 'Bowler',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm medium',
          isDeleted: false,
          createdAt: new Date().toISOString(),
        }));

        set((state) => ({
          teams: [...state.teams, teamA, teamB],
          players: [...state.players, ...redPlayers, ...bluePlayers],
        }));

        get().addToast({
          type: 'success',
          title: 'Quick Teams Created',
          description: 'Team Red & Team Blue created with 11 players each.',
        });

        return { teamAId, teamBId };
      },

      resetToSampleData: () => {
        set({
          teams: SAMPLE_TEAMS,
          players: SAMPLE_PLAYERS,
          tournaments: SAMPLE_TOURNAMENTS,
          matches: SAMPLE_MATCHES,
          activeMatchId: null,
        });
        get().addToast({
          type: 'info',
          title: 'Sample Data Loaded',
          description: 'Restored sample tournament data and match records.',
        });
      },
    }),
    {
      name: 'cricpro-clean-v3',
      partialize: (state) => ({
        teams: state.teams,
        players: state.players,
        tournaments: state.tournaments,
        matches: state.matches,
        activeMatchId: state.activeMatchId,
        deviceMode: state.deviceMode,
        adminMode: state.adminMode,
      }),
    }
  )
);
