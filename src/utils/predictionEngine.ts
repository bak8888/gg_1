import { Match, PredictionResult, TeamStats } from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const calculatePowerScore = (stats: TeamStats, isHome: boolean) => {
  const base = stats.recentForm * 0.22 + stats.attackPower * 0.27 + stats.defensePower * 0.2 + stats.possessionStyle * 0.12 + stats.counterAttack * 0.12 - stats.fatigue * 0.17;
  return Math.round((base + (isHome ? 5 : 0)) * 10) / 10;
};

const expectedGoals = (attack: number, opponentDefense: number, power: number) => {
  const tactical = (attack - opponentDefense) / 38 + power / 100;
  const randomFlavor = Math.random() * 0.7;
  return clamp(Math.round(tactical + randomFlavor), 0, 4);
};

export const createPrediction = (match: Match): PredictionResult => {
  const homePower = calculatePowerScore(match.homeTeam.stats, true);
  const awayPower = calculatePowerScore(match.awayTeam.stats, false);
  const diff = homePower - awayPower;
  const outcome = diff > 5 ? 'HOME' : diff < -5 ? 'AWAY' : 'DRAW';

  let homeScore = expectedGoals(match.homeTeam.stats.attackPower, match.awayTeam.stats.defensePower, homePower);
  let awayScore = expectedGoals(match.awayTeam.stats.attackPower, match.homeTeam.stats.defensePower, awayPower);

  if (outcome === 'HOME' && homeScore <= awayScore) homeScore = awayScore + 1;
  if (outcome === 'AWAY' && awayScore <= homeScore) awayScore = homeScore + 1;
  if (outcome === 'DRAW') {
    const drawScore = clamp(Math.round((homeScore + awayScore) / 2), 0, 3);
    homeScore = drawScore;
    awayScore = drawScore;
  }

  const confidence = clamp(Math.round(52 + Math.abs(diff) * 2.2 + Math.random() * 8), 54, 86);
  const leading = outcome === 'AWAY' ? match.awayTeam : match.homeTeam;
  const reasons = outcome === 'DRAW'
    ? ['두 팀의 종합 파워 스코어 차이가 작아 팽팽한 흐름이 예상됩니다.', '수비 안정성과 피로도 변수가 서로 상쇄됩니다.', '후반부에는 위험을 줄이는 운영이 나올 가능성이 큽니다.']
    : [`${leading.name}의 최근 폼과 전술 지표가 더 안정적으로 나타났습니다.`, '공격력과 상대 수비력의 조합에서 유효 슈팅 기대치가 높게 계산됐습니다.', '피로도와 압박 대응 수치가 경기 막판 흐름에 영향을 줄 것으로 보입니다.'];

  return { matchId: match.id, outcome, homeScore, awayScore, confidence, reasons, homePower, awayPower };
};
