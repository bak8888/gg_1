import { Match, PredictionResult, SimulationEvent, SimulationEventType } from '../types';

const types: SimulationEventType[] = ['attack', 'press', 'counter', 'shot', 'save', 'miss'];
const baseHome = [{ x: 24, y: 35 }, { x: 30, y: 55 }, { x: 40, y: 45 }];
const baseAway = [{ x: 76, y: 35 }, { x: 70, y: 55 }, { x: 60, y: 45 }];

export const createSimulationEvents = (match: Match, prediction: PredictionResult): SimulationEvent[] => {
  const winnerTeam = prediction.outcome === 'AWAY' ? 'away' : 'home';
  const goalSecond = 22 + Math.floor(Math.random() * 5);

  return Array.from({ length: 30 }, (_, index) => {
    const second = index + 1;
    const isGoal = second === goalSecond && prediction.outcome !== 'DRAW';
    const type = isGoal ? 'goal' : types[(index + (winnerTeam === 'away' ? 2 : 0)) % types.length];
    const team = type === 'counter' || (prediction.outcome === 'AWAY' && second % 3 !== 0) ? 'away' : winnerTeam;
    const direction = team === 'home' ? 1 : -1;
    const x = Math.max(12, Math.min(88, 50 + direction * ((second % 10) * 4 + (type === 'shot' || type === 'goal' ? 22 : 0))));
    const y = 28 + ((second * 11) % 44);
    const name = team === 'home' ? match.homeTeam.name : match.awayTeam.name;
    const captionMap: Record<SimulationEventType, string> = {
      attack: `${name}, 별자리처럼 패스 길을 잇고 있습니다.`,
      press: `${name}의 압박 지수가 상승합니다. 흐름이 흔들립니다.`,
      counter: `${name}의 역습 신호가 번개처럼 켜집니다.`,
      shot: `${name} 슈팅! 데이터의 파동이 골문으로 향합니다.`,
      goal: `${name} 골! 예측 엔진이 승부의 균열을 포착했습니다.`,
      save: '골키퍼 선방! 운명의 숫자가 잠시 멈춥니다.',
      miss: '아깝게 빗나갑니다. 확률의 바람이 살짝 비켜갑니다.',
    };

    return {
      second,
      type,
      team,
      caption: captionMap[type],
      ball: { x, y },
      homePlayers: baseHome.map((p, i) => ({ x: p.x + Math.sin(second + i) * 7 + (team === 'home' ? second % 8 : 0), y: p.y + Math.cos(second + i) * 5 })),
      awayPlayers: baseAway.map((p, i) => ({ x: p.x + Math.cos(second + i) * 7 - (team === 'away' ? second % 8 : 0), y: p.y + Math.sin(second + i) * 5 })),
    };
  });
};
