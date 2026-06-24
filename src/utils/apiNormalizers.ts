import { ApiFixtureRaw, ApiTeamRaw, ApiTeamStatsRaw, Match, NormalizedDataResult, TeamStats, TeamSuggestion } from '../types';

const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? value as Record<string, unknown> : {});
const asString = (value: unknown, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;
const asNumber = (value: unknown, fallback = 50) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, Math.round(parsed))) : fallback;
};

const normalizeStatsObject = (raw: unknown): TeamStats => {
  const stats = asRecord(raw);
  return {
    recentForm: asNumber(stats.recentForm),
    attackPower: asNumber(stats.attackPower),
    defensePower: asNumber(stats.defensePower),
    possessionStyle: asNumber(stats.possessionStyle),
    counterAttack: asNumber(stats.counterAttack),
    fatigue: asNumber(stats.fatigue),
  };
};

// 예시 정규화 함수입니다. 실제 API 연결 시 provider별 raw 필드 매핑을 이 함수 안에서 좁혀갑니다.
export const normalizeApiFixtureToMatch = (raw: ApiFixtureRaw): NormalizedDataResult<Match> => {
  const homeTeam = asRecord(raw.homeTeam);
  const awayTeam = asRecord(raw.awayTeam);
  const id = asString(raw.id);
  const league = asString(raw.league);
  const kickoffTime = asString(raw.kickoffTime);
  const homeName = asString(homeTeam.name);
  const awayName = asString(awayTeam.name);

  if (!id || !league || !kickoffTime || !homeName || !awayName) {
    return { data: null, source: 'api', raw, error: '필수 경기 필드가 부족합니다.' };
  }

  return {
    source: 'api',
    raw,
    data: {
      id,
      league,
      kickoffTime,
      source: 'api',
      lastUpdatedAt: asString(raw.lastUpdatedAt, new Date().toISOString()),
      homeTeam: {
        name: homeName,
        shortName: asString(homeTeam.shortName, homeName.slice(0, 3).toUpperCase()),
        color: asString(homeTeam.color, '#38bdf8'),
        stats: normalizeStatsObject(homeTeam.stats),
      },
      awayTeam: {
        name: awayName,
        shortName: asString(awayTeam.shortName, awayName.slice(0, 3).toUpperCase()),
        color: asString(awayTeam.color, '#86efac'),
        stats: normalizeStatsObject(awayTeam.stats),
      },
    },
  };
};

export const normalizeApiTeamToTeamSuggestion = (raw: ApiTeamRaw): NormalizedDataResult<TeamSuggestion> => {
  const id = asString(raw.id);
  const name = asString(raw.name);
  if (!id || !name) return { data: null, source: 'api', raw, error: '필수 팀 필드가 부족합니다.' };

  return {
    source: 'api',
    raw,
    data: {
      id,
      name,
      country: asString(raw.country, 'Unknown'),
      league: asString(raw.league, 'Unknown League'),
      aliases: Array.isArray(raw.aliases) ? raw.aliases.map((alias) => String(alias)) : [],
      defaultStats: normalizeStatsObject(raw.defaultStats),
      source: 'api',
    },
  };
};

export const normalizeApiStatsToTeamStats = (raw: ApiTeamStatsRaw): NormalizedDataResult<TeamStats> => ({
  data: normalizeStatsObject(raw),
  source: 'api',
  raw,
});
