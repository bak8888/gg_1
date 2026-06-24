export type PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY';
export type SimulationEventType = 'attack' | 'press' | 'counter' | 'shot' | 'goal' | 'save' | 'miss';
export type DataSource = 'sample' | 'custom' | 'mock-api' | 'api';
export type MatchSource = DataSource;
export type DataProviderMode = 'local' | 'mock-api' | 'future-api';

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
  source?: DataSource;
}

// 실제 축구 데이터 API 응답 연결 시 provider별 응답 필드를 안전하게 좁혀가기 위한 확장형 raw 타입입니다.
export type ApiFixtureRaw = Record<string, unknown>;
export type ApiTeamRaw = Record<string, unknown>;
export type ApiTeamStatsRaw = Record<string, unknown>;
export type ApiMatchRaw = ApiFixtureRaw;

export interface NormalizedDataResult<T> {
  data: T | null;
  source: DataSource;
  raw?: Record<string, unknown>;
  error?: string;
}

export interface Team {
  name: string;
  shortName: string;
  color: string;
  stats: TeamStats;
}

export interface Match {
  id: string;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string;
  source?: MatchSource;
  lastUpdatedAt?: string;
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
