import { matches } from '../data/matches';
import { mockApiMatches } from '../data/mockApiMatches';
import { teamSuggestions } from '../data/teams';
import { DataProviderMode, Match, TeamStats, TeamSuggestion } from '../types';
import { normalizeApiFixtureToMatch, normalizeApiStatsToTeamStats, normalizeApiTeamToTeamSuggestion } from './apiNormalizers';

const DATA_PROVIDER_MODE_KEY = 'soccer-prediction-data-provider-mode';
const normalizeSearchText = (value: string) => value.trim().toLowerCase();

export const getActiveDataProviderMode = (): DataProviderMode => {
  if (typeof window === 'undefined') return 'local';
  const stored = window.localStorage.getItem(DATA_PROVIDER_MODE_KEY);
  return stored === 'mock-api' || stored === 'future-api' || stored === 'local' ? stored : 'local';
};

export const saveActiveDataProviderMode = (mode: DataProviderMode) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(DATA_PROVIDER_MODE_KEY, mode);
};

export const searchTeamsLocal = (query: string): TeamSuggestion[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return teamSuggestions
    .filter((team) => [team.name, team.country, team.league, ...team.aliases]
      .some((value) => normalizeSearchText(value).includes(normalizedQuery)))
    .slice(0, 6);
};

export const getMatchesLocal = (): Match[] => matches;
export const getMatchesMockApi = (): Match[] => mockApiMatches;

export const getMatchesByProvider = (mode: DataProviderMode, userMatches: Match[] = []): Match[] => {
  if (mode === 'mock-api') return getMatchesMockApi();
  if (mode === 'future-api') {
    // 실제 API 연결 시 이 분기에서 서버리스 프록시/백엔드를 통해 받은 응답을 normalizeApiFixtureToMatch로 변환합니다.
    return [];
  }
  return [...getMatchesLocal(), ...userMatches];
};

export const getAllMatchesByProvider = (userMatches: Match[] = []): Match[] => [
  ...getMatchesByProvider('local', userMatches),
  ...getMatchesByProvider('mock-api'),
];

export const searchTeamsByProvider = (query: string, mode: DataProviderMode = 'local'): TeamSuggestion[] => {
  if (mode === 'future-api') {
    // 실제 API 연결 시 원격 팀 검색 응답을 normalizeApiTeamToTeamSuggestion로 정규화합니다.
    return [];
  }
  return searchTeamsLocal(query);
};

export const getTeamStatsByProvider = (teamName: string, mode: DataProviderMode = 'local'): TeamStats | null => {
  if (mode === 'future-api') {
    // 실제 API 연결 시 최근 흐름/공수 지표 응답을 normalizeApiStatsToTeamStats로 정규화합니다.
    return null;
  }
  const normalizedName = normalizeSearchText(teamName);
  const suggestion = teamSuggestions.find((team) => normalizeSearchText(team.name) === normalizedName);
  if (suggestion) return suggestion.defaultStats;

  const match = (mode === 'mock-api' ? mockApiMatches : matches).find((item) =>
    normalizeSearchText(item.homeTeam.name) === normalizedName || normalizeSearchText(item.awayTeam.name) === normalizedName,
  );
  if (!match) return null;
  return normalizeSearchText(match.homeTeam.name) === normalizedName ? match.homeTeam.stats : match.awayTeam.stats;
};

export { normalizeApiFixtureToMatch, normalizeApiStatsToTeamStats, normalizeApiTeamToTeamSuggestion };
