import { Match, SimulationPhase } from '../types';

interface ScoreBoardProps {
  match: Match;
  secondsLeft: number;
  progress: number;
  phase: SimulationPhase;
}

export default function ScoreBoard({ match, secondsLeft, progress, phase }: ScoreBoardProps) {
  return (
    <section className="score-board" aria-label="시뮬레이션 진행 정보">
      <div className="teams-row">
        <span>{match.homeTeam.shortName}</span>
        <b>{secondsLeft}s</b>
        <span>{match.awayTeam.shortName}</span>
      </div>
      <div className="phase-row">
        <em>{phase}</em>
        <small>{Math.round(progress)}% 진행</small>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
