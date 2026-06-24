import { matches } from '../data/matches';
import { teamSuggestions } from '../data/teams';
import { ApiMatchRaw, ApiTeamRaw, Match, TeamSuggestion } from '../types';

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

export const searchTeamsLocal = (query: string): TeamSuggestion[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return teamSuggestions
    .filter((team) => [team.name, team.country, team.league, ...team.aliases]
      .some((value) => normalizeSearchText(value).includes(normalizedQuery)))
    .slice(0, 6);
};

export const getMatchesLocal = (): Match[] => matches;

export const normalizeApiTeamToTeamSuggestion = (_raw: ApiTeamRaw): TeamSuggestion | null => {
  // 향후 실제 API 응답을 앱 내부 타입으로 변환하는 함수입니다.
  return null;
};

export const normalizeApiMatchToMatch = (_raw: ApiMatchRaw): Match | null => {
  // 향후 실제 API 응답을 앱 내부 타입으로 변환하는 함수입니다.
  return null;
};
