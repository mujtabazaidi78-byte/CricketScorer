export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
export type BattingStyle = 'Right-hand bat' | 'Left-hand bat';
export type BowlingStyle =
  | 'Right-arm fast'
  | 'Left-arm fast'
  | 'Right-arm medium'
  | 'Left-arm medium'
  | 'Off-spin'
  | 'Leg-spin'
  | 'Left-arm orthodox';

export type DismissalType =
  | 'Bowled'
  | 'Caught'
  | 'LBW'
  | 'Run Out'
  | 'Stumped'
  | 'Hit Wicket'
  | 'Retired Hurt';

export type ExtraType = 'None' | 'Wide' | 'NoBall' | 'Bye' | 'LegBye' | 'Penalty';

export type TournamentFormat = 'T20' | 'ODI' | 'Test' | 'Custom';

export type MatchStatus = 'Scheduled' | 'Live' | 'Innings Break' | 'Rain Delay' | 'Completed' | 'Tied' | 'Abandoned';

export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  isDeleted?: boolean; // When deleted from active roster, preserved for historical records
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string; // e.g. "KAR", "LHE"
  logoColor: string; // Hex color for badge
  logoIcon?: string;
  homeCity: string;
  isDeleted?: boolean; // When deleted, records show as "(Deleted Team)"
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  oversPerInnings: number;
  participatingTeamIds: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  winnerTeamId?: string;
  createdAt: string;
}

export interface BallWicket {
  batsmanId: string;
  bowlerId: string;
  dismissalType: DismissalType;
  fielderId?: string;
  description: string;
}

export interface BallDelivery {
  ballNumber: number; // 1 to 6 in over
  overNumber: number; // 0-indexed over number
  bowlerId: string;
  strikerId: string;
  nonStrikerId: string;
  runsScored: number; // Runs scored by batsman off bat
  extraType: ExtraType;
  extraRuns: number;
  totalRuns: number; // runsScored + extraRuns
  isLegalDelivery: boolean; // false for Wides and No-balls
  wicket?: BallWicket;
  isBoundary4: boolean;
  isBoundary6: boolean;
  isFreeHit: boolean; // was this delivered on a free hit
  givesFreeHitNext: boolean; // if this was a No-ball
  timestamp: string;
}

export interface OverData {
  overNumber: number;
  bowlerId: string;
  balls: BallDelivery[];
  isComplete: boolean;
  maidenOver: boolean;
  runsConceded: number;
  wicketsTaken: number;
}

export interface BatsmanInningsRecord {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: BallWicket;
  battingOrder: number;
}

export interface BowlerInningsRecord {
  playerId: string;
  overs: number; // legal balls / 6
  ballsBowled: number; // total legal balls
  maidens: number;
  runsConceded: number;
  wickets: number;
  economyRate: number;
  wides: number;
  noBalls: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  teamScore: number;
  overs: string;
  batsmanName: string;
  batsmanId: string;
}

export interface Partnership {
  batsman1Id: string;
  batsman2Id: string;
  runs: number;
  balls: number;
}

export interface MatchInnings {
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  legalBallsBowled: number;
  oversLimit: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
    total: number;
  };
  overs: OverData[];
  batsmenRecords: Record<string, BatsmanInningsRecord>;
  bowlersRecords: Record<string, BowlerInningsRecord>;
  fallOfWickets: FallOfWicket[];
  currentPartnership: Partnership;
  isCompleted: boolean;
}

export interface RainDelayLog {
  pausedAt: string;
  resumedAt?: string;
  durationMinutes?: number;
  revisedOvers?: number;
  revisedTarget?: number;
  note?: string;
}

export interface CricketMatch {
  id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  oversLimit: number;
  tossWinnerTeamId: string;
  tossDecision: 'Bat' | 'Bowl';
  status: MatchStatus;
  currentInningsIndex: 0 | 1; // 0 = 1st Innings, 1 = 2nd Innings
  innings: [MatchInnings, MatchInnings];
  strikerId: string | null;
  nonStrikerId: string | null;
  currentBowlerId: string | null;
  previousBowlerId: string | null;
  isFreeHitNext: boolean;
  target?: number; // Target for 2nd innings
  dlsTarget?: number;
  dlsApplied?: boolean;
  rainDelays: RainDelayLog[];
  resultSummary?: string;
  winningTeamId?: string;
  manOfTheMatchId?: string;
  createdAt: string;
  completedAt?: string;
}

// Player Aggregate Statistics
export interface PlayerBattingStats {
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  average: number;
  highScore: number;
  isHighScoreNotOut: boolean;
  fifties: number;
  hundreds: number;
  notOuts: number;
}

export interface PlayerBowlingStats {
  matches: number;
  innings: number;
  balls: number; // total legal balls
  oversFormatted: string; // e.g. "12.4"
  maidens: number;
  runsConceded: number;
  wickets: number;
  economyRate: number;
  average: number;
  bestBowlingFigures: string; // e.g. "3/15"
  bestWickets: number;
  bestRuns: number;
  fiveWickets: number;
}

export interface PlayerFieldingStats {
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface PlayerStatsSummary {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  batting: PlayerBattingStats;
  bowling: PlayerBowlingStats;
  fielding: PlayerFieldingStats;
}

export type PlayerStats = PlayerStatsSummary;

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'boundary' | 'wicket';
  title: string;
  description?: string;
  durationMs?: number;
}

export type AndroidDeviceMode = 'phone' | 'tablet' | 'fluid';
