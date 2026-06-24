import { Match, PredictionHistoryItem, TeamStats } from '../types';

const STORAGE_KEY = 'soccer-prediction-user-matches';
const PREDICTION_HISTORY_KEY = 'soccer-prediction-history';
const statKeys: Array<keyof TeamStats> = ['recentForm', 'attackPower', 'defensePower', 'possessionStyle', 'counterAttack', 'fatigue'];

const clampStat = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.min(100, Math.max(0, Math.round(numberValue)));
};

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const normalizeStats = (stats: unknown): TeamStats => {
  const raw = (stats ?? {}) as Partial<Record<keyof TeamStats, unknown>>;
  return statKeys.reduce((acc, key) => ({ ...acc, [key]: clampStat(raw[key]) }), {} as TeamStats);
};

const makeShortName = (name: string) => name.replace(/\s+/g, '').slice(0, 3).toUpperCase() || 'TBD';

export const normalizeUserMatch = (match: unknown): Match | null => {
  const raw = match as Partial<Match> | null;
  if (!raw || !hasText(raw.league) || !hasText(raw.kickoffTime) || !raw.homeTeam || !raw.awayTeam) return null;
  if (!hasText(raw.homeTeam.name) || !hasText(raw.awayTeam.name)) return null;

  const id = hasText(raw.id) ? String(raw.id) : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const league = String(raw.league).trim();
  const kickoffTime = String(raw.kickoffTime).trim();
  const homeName = raw.homeTeam.name.trim();
  const awayName = raw.awayTeam.name.trim();

  return {
    id,
    league,
    kickoffTime,
    source: 'custom',
    homeTeam: {
      name: homeName,
      shortName: hasText(raw.homeTeam.shortName) ? raw.homeTeam.shortName.trim().slice(0, 4).toUpperCase() : makeShortName(homeName),
      color: hasText(raw.homeTeam.color) ? raw.homeTeam.color : '#38bdf8',
      stats: normalizeStats(raw.homeTeam.stats),
    },
    awayTeam: {
      name: awayName,
      shortName: hasText(raw.awayTeam.shortName) ? raw.awayTeam.shortName.trim().slice(0, 4).toUpperCase() : makeShortName(awayName),
      color: hasText(raw.awayTeam.color) ? raw.awayTeam.color : '#86efac',
      stats: normalizeStats(raw.awayTeam.stats),
    },
  };
};

export const loadUserMatches = (): Match[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeUserMatch).filter((match): match is Match => Boolean(match));
  } catch {
    return [];
  }
};

export const saveUserMatches = (matches: Match[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches.map(normalizeUserMatch).filter(Boolean), null, 2));
};

export const addUserMatch = (match: Match) => {
  const nextMatch = normalizeUserMatch(match);
  if (!nextMatch) return loadUserMatches();
  const nextMatches = [...loadUserMatches(), nextMatch];
  saveUserMatches(nextMatches);
  return nextMatches;
};

export const updateUserMatch = (match: Match) => {
  const nextMatch = normalizeUserMatch(match);
  if (!nextMatch) return loadUserMatches();
  const nextMatches = loadUserMatches().map((item) => item.id === nextMatch.id ? nextMatch : item);
  saveUserMatches(nextMatches);
  return nextMatches;
};

export const deleteUserMatch = (id: string) => {
  const nextMatches = loadUserMatches().filter((match) => match.id !== id);
  saveUserMatches(nextMatches);
  return nextMatches;
};

export const clearUserMatches = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};


const normalizePredictionHistoryItem = (item: unknown): PredictionHistoryItem | null => {
  const raw = item as Partial<PredictionHistoryItem> | null;
  if (!raw || !hasText(raw.id) || !hasText(raw.savedAt) || !hasText(raw.league) || !hasText(raw.homeTeamName) || !hasText(raw.awayTeamName) || !hasText(raw.kickoffTime)) return null;
  if (!raw.expectedScore || typeof raw.expectedScore.home !== 'number' || typeof raw.expectedScore.away !== 'number') return null;
  if (!raw.expectedOutcome || !['HOME', 'DRAW', 'AWAY'].includes(raw.expectedOutcome)) return null;

  return {
    id: String(raw.id),
    savedAt: String(raw.savedAt),
    league: String(raw.league),
    homeTeamName: String(raw.homeTeamName),
    awayTeamName: String(raw.awayTeamName),
    kickoffTime: String(raw.kickoffTime),
    expectedScore: {
      home: Math.max(0, Math.round(Number(raw.expectedScore.home) || 0)),
      away: Math.max(0, Math.round(Number(raw.expectedScore.away) || 0)),
    },
    expectedOutcome: raw.expectedOutcome,
    confidence: Math.min(100, Math.max(0, Math.round(Number(raw.confidence) || 0))),
    reasons: Array.isArray(raw.reasons) ? raw.reasons.filter(hasText).map(String).slice(0, 3) : [],
    flowSummary: hasText(raw.flowSummary) ? String(raw.flowSummary) : '',
    keyPoint: hasText(raw.keyPoint) ? String(raw.keyPoint) : '',
    riskFactor: hasText(raw.riskFactor) ? String(raw.riskFactor) : '',
    simulationLog: Array.isArray(raw.simulationLog)
      ? raw.simulationLog
        .map((log) => ({ second: Number((log as { second?: unknown }).second), text: String((log as { text?: unknown }).text ?? '') }))
        .filter((log) => Number.isFinite(log.second) && log.text.trim().length > 0)
      : [],
    matchSource: raw.matchSource === 'custom' || raw.matchSource === 'api' ? raw.matchSource : 'sample',
  };
};

export const loadPredictionHistory = (): PredictionHistoryItem[] => {
  try {
    const stored = window.localStorage.getItem(PREDICTION_HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizePredictionHistoryItem)
      .filter((item): item is PredictionHistoryItem => Boolean(item))
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
};

export const savePredictionHistory = (history: PredictionHistoryItem[]) => {
  const normalized = history
    .map(normalizePredictionHistoryItem)
    .filter((item): item is PredictionHistoryItem => Boolean(item))
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  window.localStorage.setItem(PREDICTION_HISTORY_KEY, JSON.stringify(normalized, null, 2));
};

export const addPredictionHistory = (item: PredictionHistoryItem) => {
  const normalized = normalizePredictionHistoryItem(item);
  if (!normalized) return loadPredictionHistory();
  const nextHistory = [normalized, ...loadPredictionHistory().filter((historyItem) => historyItem.id !== normalized.id)];
  savePredictionHistory(nextHistory);
  return nextHistory;
};

export const deletePredictionHistory = (id: string) => {
  const nextHistory = loadPredictionHistory().filter((item) => item.id !== id);
  savePredictionHistory(nextHistory);
  return nextHistory;
};

export const clearPredictionHistory = () => {
  window.localStorage.removeItem(PREDICTION_HISTORY_KEY);
};
