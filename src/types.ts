export type PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY';
export type SimulationEventType = 'attack' | 'press' | 'counter' | 'shot' | 'goal' | 'save' | 'miss';

export interface TeamStats {
  recentForm: number;
  attackPower: number;
  defensePower: number;
  possessionStyle: number;
  counterAttack: number;
  fatigue: number;
}


export interface TeamSuggestion {
  id: string;
  name: string;
  country: string;
  league: string;
  aliases: string[];
  defaultStats: TeamStats;
}

export interface ApiTeamRaw {
  [key: string]: unknown;
}

export interface ApiMatchRaw {
  [key: string]: unknown;
}

export interface Team {
  name: string;
  shortName: string;
  color: string;
  stats: TeamStats;
}

export type DataSource = 'sample' | 'custom' | 'api';
export type MatchSource = DataSource;

export interface Match {
  id: string;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  source?: MatchSource;
}

export interface SimulationLogEntry {
  second: number;
  text: string;
}

export interface PredictionResult {
  matchId: string;
  outcome: PredictionOutcome;
  homeScore: number;
  awayScore: number;
  confidence: number;
  reasons: string[];
  flowSummary: string;
  keyPoint: string;
  riskFactor: string;
  simulationLog: SimulationLogEntry[];
  homePower: number;
  awayPower: number;
}

export interface SimulationEvent {
  second: number;
  type: SimulationEventType;
  team: 'home' | 'away';
  caption: string;
  ball: { x: number; y: number };
  homePlayers: Array<{ x: number; y: number }>;
  awayPlayers: Array<{ x: number; y: number }>;
}


export interface PredictionHistoryItem {
  id: string;
  savedAt: string;
  league: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffTime: string;
  expectedScore: {
    home: number;
    away: number;
  };
  expectedOutcome: PredictionOutcome;
  confidence: number;
  reasons: string[];
  flowSummary: string;
  keyPoint: string;
  riskFactor: string;
  simulationLog: SimulationLogEntry[];
  matchSource: MatchSource;
}
