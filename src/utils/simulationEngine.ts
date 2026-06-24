import { Match, PredictionResult, SimulationEvent, SimulationEventType } from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const phaseTypes: SimulationEventType[][] = [
  ['press', 'attack', 'counter', 'attack', 'press', 'shot', 'save', 'attack', 'counter', 'miss'],
  ['press', 'counter', 'attack', 'shot', 'save', 'counter', 'press', 'shot', 'miss', 'attack'],
  ['attack', 'shot', 'save', 'counter', 'shot', 'miss', 'press', 'attack', 'shot', 'save'],
];

const baseHome = [{ x: 20, y: 34 }, { x: 31, y: 58 }, { x: 42, y: 45 }, { x: 13, y: 50 }];
const baseAway = [{ x: 80, y: 34 }, { x: 69, y: 58 }, { x: 58, y: 45 }, { x: 87, y: 50 }];

const getBallPosition = (second: number, type: SimulationEventType, team: 'home' | 'away') => {
  const progressInPhase = ((second - 1) % 10) / 9;
  const homeX = 18 + progressInPhase * 58;
  const awayX = 82 - progressInPhase * 58;
  const direction = team === 'home' ? 1 : -1;
  const attackingGoalX = team === 'home' ? 91 : 9;
  const keeperX = team === 'home' ? 86 : 14;
  const driftY = 50 + Math.sin(second * 1.7) * 20;

  if (type === 'shot') return { x: clamp(attackingGoalX - direction * 9, 8, 92), y: clamp(50 + Math.sin(second) * 10, 24, 76) };
  if (type === 'goal') return { x: attackingGoalX, y: 50 };
  if (type === 'save') return { x: keeperX, y: clamp(43 + Math.cos(second) * 12, 27, 73) };
  if (type === 'miss') return { x: attackingGoalX, y: second % 2 === 0 ? 20 : 80 };
  if (type === 'counter') return { x: clamp(team === 'home' ? homeX + 13 : awayX - 13, 12, 88), y: clamp(driftY, 24, 76) };
  if (type === 'press') return { x: clamp(team === 'home' ? homeX - 7 : awayX + 7, 18, 82), y: clamp(48 + Math.cos(second * 1.3) * 16, 26, 74) };
  return { x: clamp(team === 'home' ? homeX : awayX, 14, 86), y: clamp(driftY, 24, 76) };
};

const getCaption = (type: SimulationEventType, teamName: string) => {
  const captionMap: Record<SimulationEventType, string> = {
    attack: `예언가의 렌즈에 ${teamName}의 패스 길이 선명해집니다. 흐름이 한쪽으로 기울고 있어요.`,
    press: `분석 지표가 요동칩니다. ${teamName}의 압박이 상대 선택지를 빠르게 지우고 있습니다.`,
    counter: `${teamName}의 역습 징조가 번개처럼 떠오릅니다. 잠깐의 빈틈이 운명을 흔듭니다.`,
    shot: `${teamName} 슈팅! 공의 궤적이 예측 그래프의 가장 날카로운 선을 따라갑니다.`,
    goal: `${teamName} 골! 경기장의 기운이 폭발하고 예측판에 결정적 표식이 새겨집니다.`,
    save: `골키퍼 선방! 골문 앞 확률이 튕겨 나가며 다음 장면을 다시 쓰고 있습니다.`,
    miss: `아깝게 벗어납니다. 예언의 바람이 골대 바깥으로 공을 밀어냈습니다.`,
  };

  return captionMap[type];
};

export const createSimulationEvents = (match: Match, prediction: PredictionResult): SimulationEvent[] => {
  const favoredTeam = prediction.outcome === 'AWAY' ? 'away' : 'home';
  const goalSecond = 24 + Math.floor(Math.random() * 4);

  return Array.from({ length: 30 }, (_, index) => {
    const second = index + 1;
    const phaseIndex = Math.min(2, Math.floor(index / 10));
    const isGoal = second === goalSecond && prediction.outcome !== 'DRAW';
    const type = isGoal ? 'goal' : phaseTypes[phaseIndex][index % 10];
    const team = type === 'counter'
      ? (favoredTeam === 'home' ? 'away' : 'home')
      : (prediction.outcome === 'DRAW' && second % 4 < 2 ? 'away' : favoredTeam);
    const ball = getBallPosition(second, type, team);
    const teamName = team === 'home' ? match.homeTeam.name : match.awayTeam.name;
    const homePush = team === 'home' ? phaseIndex * 5 + (type === 'shot' || type === 'goal' ? 10 : 0) : -phaseIndex * 2;
    const awayPush = team === 'away' ? -(phaseIndex * 5 + (type === 'shot' || type === 'goal' ? 10 : 0)) : phaseIndex * 2;

    return {
      second,
      type,
      team,
      caption: getCaption(type, teamName),
      ball,
      homePlayers: baseHome.map((p, i) => ({ x: clamp(p.x + homePush + Math.sin(second + i) * 5, 8, 92), y: clamp(p.y + Math.cos(second * 0.9 + i) * 7, 16, 84) })),
      awayPlayers: baseAway.map((p, i) => ({ x: clamp(p.x + awayPush + Math.cos(second + i) * 5, 8, 92), y: clamp(p.y + Math.sin(second * 0.9 + i) * 7, 16, 84) })),
    };
  });
};
