import { Match, PredictionResult } from '../types';

const labels = { HOME: '홈승', DRAW: '무승부', AWAY: '원정승' } as const;

export default function ResultPage({ match, prediction, onRestart }: { match: Match; prediction: PredictionResult; onRestart: () => void }) {
  return (
    <main className="page result">
      <section className="result-card">
        <p className="league">Prediction Result</p>
        <h1>{match.homeTeam.name} {prediction.homeScore} : {prediction.awayScore} {match.awayTeam.name}</h1>
        <h2>예상 결과: {labels[prediction.outcome]}</h2>
        <div className="confidence"><span>신뢰도</span><b>{prediction.confidence}%</b></div>
        <ul>{prediction.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <p className="disclaimer">이 예측은 재미용 시뮬레이션이며 실제 결과를 보장하지 않습니다.</p>
        <button onClick={onRestart}>다시 예측하기</button>
      </section>
    </main>
  );
}
