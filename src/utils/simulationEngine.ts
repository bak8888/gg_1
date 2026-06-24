import { Match, PredictionResult, SimulationEvent, SimulationEventType, SimulationPhase } from '../types';

const baseHome = [
  { x: 21, y: 28 },
  { x: 29, y: 52 },
  { x: 38, y: 70 },
  { x: 15, y: 50 },
];
const baseAway = [
  { x: 79, y: 28 },
  { x: 71, y: 52 },
  { x: 62, y: 70 },
  { x: 85, y: 50 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const phaseForSecond = (second: number): SimulationPhase => {
  if (second <= 10) return '탐색전';
  if (second <= 20) return '압박과 역습';
  return '결정적 찬스';
};

const eventPoolForSecond = (second: number): SimulationEventType[] => {
  if (second <= 10) return ['pass', 'press', 'pass', 'attack', 'press'];
  if (second <= 20) return ['press', 'counter', 'shot', 'save', 'counter', 'shot'];
  return ['shot', 'save', 'miss', 'shot', 'goal', 'save'];
};

const teamForEvent = (second: number, prediction: PredictionResult) => {
  const predictedSide = prediction.outcome === 'AWAY' ? 'away' : 'home';
  const oppositeSide = predictedSide === 'home' ? 'away' : 'home';

  if (second <= 10) return second % 2 === 0 ? 'home' : 'away';
  if (second <= 20) return second % 3 === 0 ? oppositeSide : predictedSide;
  return second % 4 === 0 && prediction.outcome !== 'DRAW' ? oppositeSide : predictedSide;
};

const ballPosition = (second: number, type: SimulationEventType, team: 'home' | 'away') => {
  const homeFlow = team === 'home';
  const progress = second <= 10 ? 0.22 + (second % 10) * 0.035 : second <= 20 ? 0.42 + (second % 10) * 0.04 : 0.68 + (second % 10) * 0.025;
  const forwardX = homeFlow ? 18 + progress * 74 : 82 - progress * 74;
  const waveY = 30 + ((second * 13) % 42);

  if (type === 'shot' || type === 'goal') return { x: homeFlow ? 91 : 9, y: type === 'goal' ? 50 : clamp(waveY, 28, 72) };
  if (type === 'save') return { x: homeFlow ? 86 : 14, y: second % 2 === 0 ? 38 : 62 };
  if (type === 'miss') return { x: homeFlow ? 96 : 4, y: second % 2 === 0 ? 22 : 78 };
  if (type === 'counter') return { x: homeFlow ? clamp(forwardX + 12, 18, 84) : clamp(forwardX - 12, 16, 82), y: waveY };
  return { x: clamp(forwardX, 18, 82), y: waveY };
};

const movePlayers = (players: Array<{ x: number; y: number }>, ball: { x: number; y: number }, side: 'home' | 'away', second: number) => {
  const lineBias = side === 'home' ? -8 : 8;

  return players.map((player, index) => {
    const chase = index === 3 ? 0.12 : 0.28 + index * 0.04;
    return {
      x: clamp(player.x + (ball.x - player.x + lineBias) * chase + Math.sin(second + index) * 2.4, 8, 92),
      y: clamp(player.y + (ball.y - player.y) * chase + Math.cos(second + index) * 2.8, 16, 84),
    };
  });
};

const captionForEvent = (match: Match, type: SimulationEventType, team: 'home' | 'away', phase: SimulationPhase) => {
  const name = team === 'home' ? match.homeTeam.name : match.awayTeam.name;

  const captions: Record<SimulationEventType, string> = {
    pass: `초반 흐름은 아직 조심스럽습니다. ${name}이 짧은 패스로 빈틈을 찾고 있습니다.`,
    attack: `${name}이 점유율의 결을 바꿉니다. 예측 엔진은 측면 전개 가능성을 감지합니다.`,
    press: `${name}의 압박이 높아집니다. 최근 경기에서 보였던 전방 압박 패턴과 닮아 있습니다.`,
    counter: `${name}이 빠르게 역습합니다. 수비 뒷공간을 노리는 장면입니다.`,
    shot: `결정적 찬스입니다. ${name}의 슈팅 흐름은 예상 스코어에 큰 영향을 줍니다.`,
    goal: `골망이 흔들립니다. 예측 엔진이 ${name} 쪽으로 기울기 시작합니다.`,
    save: `골키퍼가 흐름을 붙잡습니다. ${name}의 찬스가 확률의 벽에 튕겨 나갑니다.`,
    miss: `공이 골문 밖으로 흐릅니다. ${phase}의 균열이 아직 결과로 굳어지지는 않습니다.`,
  };

  return captions[type];
};

export const createSimulationEvents = (match: Match, prediction: PredictionResult): SimulationEvent[] => {
  const goalSecond = prediction.outcome === 'DRAW' ? -1 : 24 + Math.floor(Math.random() * 5);

  return Array.from({ length: 30 }, (_, index) => {
    const second = index + 1;
    const phase = phaseForSecond(second);
    const team = teamForEvent(second, prediction);
    const pool = eventPoolForSecond(second);
    const type = second === goalSecond ? 'goal' : pool[(second + prediction.confidence + index) % pool.length];
    const ball = ballPosition(second, type, team);

    return {
      second,
      phase,
      type,
      team,
      caption: captionForEvent(match, type, team, phase),
      ball,
      homePlayers: movePlayers(baseHome, ball, 'home', second),
      awayPlayers: movePlayers(baseAway, ball, 'away', second),
    };
  });
};
