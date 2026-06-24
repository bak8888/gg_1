import { useEffect, useMemo, useState } from 'react';
import EventCaption from '../components/EventCaption';
import ScoreBoard from '../components/ScoreBoard';
import SoccerField from '../components/SoccerField';
import { Match, PredictionResult } from '../types';
import { createSimulationEvents } from '../utils/simulationEngine';

export default function SimulationPage({ match, prediction, onComplete }: { match: Match; prediction: PredictionResult; onComplete: () => void }) {
  const events = useMemo(() => createSimulationEvents(match, prediction), [match, prediction]);
  const [tick, setTick] = useState(0);
  const current = events[Math.min(tick, events.length - 1)];

  useEffect(() => {
    if (tick >= 30) { onComplete(); return; }
    const timer = window.setTimeout(() => setTick(t => t + 1), 1000);
    return () => window.clearTimeout(timer);
  }, [tick, onComplete]);

  return <main className="page simulation"><h1>{match.homeTeam.name} vs {match.awayTeam.name}</h1><ScoreBoard match={match} secondsLeft={Math.max(0, 30 - tick)} /><SoccerField match={match} event={current} /><EventCaption text={current.caption} type={current.type} /><p className="simulation-note">예측 엔진이 공격, 압박, 역습, 슈팅 패턴을 해석 중입니다...</p></main>;
}
