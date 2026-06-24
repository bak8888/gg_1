import { useEffect, useMemo, useState } from 'react';
import EventCaption from '../components/EventCaption';
import ScoreBoard from '../components/ScoreBoard';
import SoccerField from '../components/SoccerField';
import { Match, PredictionResult } from '../types';
import { createSimulationEvents } from '../utils/simulationEngine';

interface SimulationPageProps {
  match: Match;
  prediction: PredictionResult;
  onComplete: () => void;
}

export default function SimulationPage({ match, prediction, onComplete }: SimulationPageProps) {
  const events = useMemo(() => createSimulationEvents(match, prediction), [match, prediction]);
  const [tick, setTick] = useState(0);
  const current = events[Math.min(tick, events.length - 1)];
  const secondsLeft = Math.max(0, 30 - tick);
  const progress = Math.min(100, (tick / 30) * 100);

  useEffect(() => {
    if (tick >= 30) {
      onComplete();
      return;
    }

    const timer = window.setTimeout(() => setTick((value) => value + 1), 1000);
    return () => window.clearTimeout(timer);
  }, [tick, onComplete]);

  return (
    <main className="page simulation">
      <header className="simulation-header">
        <p>{match.league}</p>
        <h1>{match.homeTeam.name} vs {match.awayTeam.name}</h1>
      </header>
      <ScoreBoard match={match} secondsLeft={secondsLeft} progress={progress} phase={current.phase} />
      <SoccerField match={match} event={current} />
      <EventCaption text={current.caption} type={current.type} phase={current.phase} />
      <p className="simulation-note">30초가 모두 지나기 전까지 결과는 공개되지 않습니다.</p>
    </main>
  );
}
