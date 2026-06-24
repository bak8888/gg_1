import { useEffect, useMemo, useState } from 'react';
import EventCaption from '../components/EventCaption';
import ScoreBoard from '../components/ScoreBoard';
import SoccerField from '../components/SoccerField';
import { Match, PredictionResult } from '../types';
import { createSimulationEvents } from '../utils/simulationEngine';

const SIMULATION_SECONDS = 30;

const getPhaseLabel = (elapsedSeconds: number) => {
  if (elapsedSeconds < 10) return '탐색전';
  if (elapsedSeconds < 20) return '압박과 역습';
  return '결정적 찬스';
};

export default function SimulationPage({ match, prediction, onComplete }: { match: Match; prediction: PredictionResult; onComplete: () => void }) {
  const events = useMemo(() => createSimulationEvents(match, prediction), [match, prediction]);
  const [tick, setTick] = useState(0);
  const eventIndex = Math.min(tick, events.length - 1);
  const current = events[eventIndex];
  const secondsLeft = Math.max(0, SIMULATION_SECONDS - tick);
  const progress = Math.min(100, (tick / SIMULATION_SECONDS) * 100);
  const phaseLabel = getPhaseLabel(Math.min(tick, SIMULATION_SECONDS - 1));

  useEffect(() => {
    if (tick >= SIMULATION_SECONDS) { onComplete(); return; }
    const timer = window.setTimeout(() => setTick(t => t + 1), 1000);
    return () => window.clearTimeout(timer);
  }, [tick, onComplete]);

  return <main className={`page simulation ${current.type === 'goal' ? 'goal-shake' : ''}`}>
    <h1>{match.homeTeam.name} vs {match.awayTeam.name}</h1>
    <ScoreBoard match={match} secondsLeft={secondsLeft} />
    <section className="simulation-meter" aria-label="30초 시뮬레이션 진행률">
      <div className="timer-row"><span>{phaseLabel}</span><b>{secondsLeft}초 남음</b></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="phase-labels"><span>0~10초 탐색전</span><span>10~20초 압박과 역습</span><span>20~30초 결정적 찬스</span></div>
    </section>
    <div className="field-wrap">
      {current.type === 'goal' && <div className="goal-banner">GOAL!</div>}
      <SoccerField match={match} event={current} />
    </div>
    <EventCaption text={current.caption} type={current.type} />
    <p className="simulation-note">예측 엔진이 공격, 압박, 역습, 슈팅 패턴을 해석 중입니다...</p>
  </main>;
}
