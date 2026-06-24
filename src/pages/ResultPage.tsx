import { Match, PredictionResult } from '../types';

const labels = { HOME: '홈승', DRAW: '무승부', AWAY: '원정승' } as const;

export default function ResultPage({ match, prediction, onRestart, onViewMatches }: { match: Match; prediction: PredictionResult; onRestart: () => void; onViewMatches: () => void }) {
  return <main className="page result">
    <section className="result-card result-shell">
      <p className="league">Prediction Result</p>
      <div className="score-hero">
        <span>{match.homeTeam.name}</span>
        <strong>{prediction.homeScore} : {prediction.awayScore}</strong>
        <span>{match.awayTeam.name}</span>
      </div>
      <h1>예상 결과: {labels[prediction.outcome]}</h1>
      <div className="result-layout">
        <article className="info-card confidence-card">
          <span>신뢰도</span>
          <div className="confidence-ring" style={{ background: `conic-gradient(#7dd3fc ${prediction.confidence * 3.6}deg, #172033 0deg)` }}>
            <b>{prediction.confidence}%</b>
          </div>
        </article>
        <article className="info-card">
          <h2>예측 이유</h2>
          <ul>{prediction.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
        </article>
        <article className="info-card">
          <h2>경기 흐름 요약</h2>
          <p>{prediction.flowSummary}</p>
        </article>
        <article className="info-card">
          <h2>승부를 가른 핵심 포인트</h2>
          <p>{prediction.keyPoint}</p>
        </article>
        <article className="info-card warning-card">
          <h2>위험 변수 / 반전 가능성</h2>
          <p>{prediction.riskFactor}</p>
        </article>
        <article className="info-card log-card">
          <h2>경기 흐름 로그</h2>
          <ol>{prediction.simulationLog.map(log => <li key={`${log.second}-${log.text}`}><time>{String(log.second).padStart(2, '0')}초</time>{log.text}</li>)}</ol>
        </article>
      </div>
      <p className="disclaimer">이 예측은 재미용 시뮬레이션이며 실제 결과를 보장하지 않습니다.</p>
      <div className="result-actions">
        <button onClick={onRestart}>다시 예측하기</button>
        <button className="secondary-action" onClick={onViewMatches}>다른 경기 보기</button>
      </div>
    </section>
  </main>;
}
