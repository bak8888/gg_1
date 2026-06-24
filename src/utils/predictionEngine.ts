import { Match, PredictionResult, SimulationLogEntry, Team, TeamStats } from '../types';

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

const teamWithHigher = (home: Team, away: Team, key: keyof TeamStats, lowerIsBetter = false) => {
  const homeValue = home.stats[key];
  const awayValue = away.stats[key];
  return lowerIsBetter ? (homeValue <= awayValue ? home : away) : (homeValue >= awayValue ? home : away);
};

const createReasons = (match: Match, outcome: PredictionResult['outcome'], diff: number) => {
  const attackLeader = teamWithHigher(match.homeTeam, match.awayTeam, 'attackPower');
  const defenseLeader = teamWithHigher(match.homeTeam, match.awayTeam, 'defensePower');
  const fresherTeam = teamWithHigher(match.homeTeam, match.awayTeam, 'fatigue', true);
  const counterLeader = teamWithHigher(match.homeTeam, match.awayTeam, 'counterAttack');

  if (outcome === 'DRAW') {
    return [
      `두 팀의 전력 차이가 ${Math.abs(diff).toFixed(1)}점으로 크지 않아 후반 집중력이 결과를 가를 가능성이 있습니다.`,
      `공격 지표에서는 ${attackLeader.name}이 근소하게 앞서지만, ${defenseLeader.name}의 수비 안정감이 균형을 맞추고 있습니다.`,
      `${counterLeader.name}은 역습 성향이 강하지만, ${fresherTeam.name}의 체력 우위가 경기 막판 변수로 작용합니다.`,
    ];
  }

  const favorite = outcome === 'HOME' ? match.homeTeam : match.awayTeam;
  const underdog = outcome === 'HOME' ? match.awayTeam : match.homeTeam;

  return [
    `${favorite.name}은 최근 흐름과 공격 지표에서 ${underdog.name}보다 근소하게 앞서 있습니다.`,
    `수비 안정감에서는 ${defenseLeader.name}이 조금 더 우세하게 계산되어 위험 지역 관리에 강점이 있습니다.`,
    `${underdog.name}은 역습 성향으로 반전을 노릴 수 있지만, 피로도와 후반 압박 대응 수치가 변수로 작용합니다.`,
    `예측 엔진은 경기 후반 찬스 생성력에서 ${counterLeader.name}의 결정적인 장면 가능성도 감지했습니다.`,
  ];
};

const createSimulationLog = (match: Match, outcome: PredictionResult['outcome']): SimulationLogEntry[] => {
  const favorite = outcome === 'AWAY' ? match.awayTeam : match.homeTeam;
  const challenger = outcome === 'AWAY' ? match.homeTeam : match.awayTeam;

  return [
    { second: 4, text: `${favorite.name}이 조심스럽게 점유율을 가져가며 템포를 확인합니다.` },
    { second: 10, text: `${challenger.name}이 빠른 전환으로 첫 번째 균열을 찾습니다.` },
    { second: 16, text: `${favorite.name}의 공격 패턴이 측면에서 더 선명하게 계산됩니다.` },
    { second: 22, text: `${challenger.name}의 역습 지수가 올라가며 반전 가능성이 감지됩니다.` },
    { second: 27, text: `결정적 찬스 구간에서 ${favorite.name}의 기대 득점 값이 한 단계 상승합니다.` },
    { second: 30, text: '예측 엔진이 최종 스코어와 승부 흐름을 계산했습니다.' },
  ];
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
  const favorite = outcome === 'AWAY' ? match.awayTeam : match.homeTeam;
  const challenger = outcome === 'AWAY' ? match.homeTeam : match.awayTeam;
  const reasons = createReasons(match, outcome, diff);
  const flowSummary = outcome === 'DRAW'
    ? '초반 탐색전 이후 양 팀이 번갈아 주도권을 가져가며, 마지막 10초 구간까지 균형이 유지되는 흐름으로 해석됩니다.'
    : `${favorite.name}이 초반 주도권을 잡고, ${challenger.name}의 역습을 견디면서 후반 결정적 찬스 구간에서 우위를 넓히는 흐름입니다.`;
  const keyPoint = outcome === 'DRAW'
    ? '승부를 가른 핵심 포인트는 공격보다 실점 위험을 먼저 줄이는 안정적인 경기 운영입니다.'
    : `승부를 가른 핵심 포인트는 ${favorite.name}의 찬스 생성력과 박스 근처 압박 지속성입니다.`;
  const riskFactor = `${challenger.name}의 빠른 역습 또는 세트피스 한 번이 예측 흐름을 뒤집을 수 있는 위험 변수입니다.`;

  return { matchId: match.id, outcome, homeScore, awayScore, confidence, reasons, flowSummary, keyPoint, riskFactor, simulationLog: createSimulationLog(match, outcome), homePower, awayPower };
};
