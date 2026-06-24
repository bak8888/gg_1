export type PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY';
export type SimulationEventType = 'pass' | 'attack' | 'press' | 'counter' | 'shot' | 'goal' | 'save' | 'miss';
export type SimulationPhase = '탐색전' | '압박과 역습' | '결정적 찬스';

export interface TeamStats {
  recentForm: number;
  attackPower: number;
  defensePower: number;
  possessionStyle: number;
  counterAttack: number;
  fatigue: number;
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
}

export interface PredictionResult {
  matchId: string;
  outcome: PredictionOutcome;
  homeScore: number;
  awayScore: number;
  confidence: number;
  reasons: string[];
  homePower: number;
  awayPower: number;
}

export interface FieldPosition {
  x: number;
  y: number;
}

export interface SimulationEvent {
  second: number;
  phase: SimulationPhase;
  type: SimulationEventType;
  team: 'home' | 'away';
  caption: string;
  ball: FieldPosition;
  homePlayers: FieldPosition[];
  awayPlayers: FieldPosition[];
}
