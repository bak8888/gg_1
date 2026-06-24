import { useMemo, useState } from 'react';
import { PredictionHistoryItem } from '../types';
import { clearPredictionHistory, deletePredictionHistory, loadPredictionHistory } from '../utils/storage';

const labels = { HOME: '홈승', DRAW: '무승부', AWAY: '원정승' } as const;

const formatSavedAt = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const sourceLabels = { sample: '샘플 경기', custom: '사용자 추가 경기', api: 'API 경기' } as const;

export default function PredictionHistoryPage({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<PredictionHistoryItem[]>(() => loadPredictionHistory());
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selectedRecord = useMemo(() => history.find((item) => item.id === selectedId), [history, selectedId]);

  const handleDelete = (id: string) => {
    const nextHistory = deletePredictionHistory(id);
    setHistory(nextHistory);
    if (selectedId === id) setSelectedId(undefined);
  };

  const handleClear = () => {
    clearPredictionHistory();
    setHistory([]);
    setSelectedId(undefined);
  };

  return <main className="page history-page">
    <section className="hero history-hero">
      <p>Prediction Archive</p>
      <h1>예측 기록</h1>
      <span>완료한 30초 시뮬레이션 결과를 브라우저에 저장하고 다시 확인합니다.</span>
      <div className="hero-actions">
        <button className="secondary-action" onClick={onBack}>경기 목록으로 돌아가기</button>
        {history.length > 0 && <button className="danger-action" onClick={handleClear}>전체 기록 삭제</button>}
      </div>
    </section>

    {history.length === 0
      ? <section className="empty-history">
        <strong>아직 저장된 예측 기록이 없습니다.</strong>
        <p>경기를 선택하고 30초 시뮬레이션을 완료하면 결과가 자동으로 이곳에 저장됩니다.</p>
        <button onClick={onBack}>첫 예측 시작하기</button>
      </section>
      : <section className="history-layout">
        <div className="history-list" aria-label="저장된 예측 기록 목록">
          {history.map((record) => <article className={selectedId === record.id ? 'history-card active' : 'history-card'} key={record.id}>
            <button className="history-card-main" onClick={() => setSelectedId(record.id)}>
              <span className={`source-badge ${record.matchSource === 'custom' ? 'custom' : ''}`}>{sourceLabels[record.matchSource]}</span>
              <h2>{record.homeTeamName} vs {record.awayTeamName}</h2>
              <p>{record.league} · {record.kickoffTime}</p>
              <div className="history-meta">
                <b>{labels[record.expectedOutcome]}</b>
                <span>{record.expectedScore.home} : {record.expectedScore.away}</span>
                <em>{record.confidence}%</em>
              </div>
              <div className="confidence-track" aria-label={`신뢰도 ${record.confidence}%`}><i style={{ width: `${record.confidence}%` }} /></div>
              <small>{formatSavedAt(record.savedAt)} 저장</small>
            </button>
            <button className="history-delete danger-action" onClick={() => handleDelete(record.id)}>삭제</button>
          </article>)}
        </div>

        <aside className="history-detail">
          {selectedRecord
            ? <>
              <p className="league">History Detail</p>
              <h2>{selectedRecord.homeTeamName} vs {selectedRecord.awayTeamName}</h2>
              <div className="detail-score">{selectedRecord.expectedScore.home} : {selectedRecord.expectedScore.away}</div>
              <dl className="detail-grid">
                <div><dt>리그</dt><dd>{selectedRecord.league}</dd></div>
                <div><dt>경기 시간</dt><dd>{selectedRecord.kickoffTime}</dd></div>
                <div><dt>예상 결과</dt><dd>{labels[selectedRecord.expectedOutcome]}</dd></div>
                <div><dt>신뢰도</dt><dd>{selectedRecord.confidence}%</dd></div>
              </dl>
              <section><h3>예측 이유</h3><ul>{selectedRecord.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section>
              <section><h3>경기 흐름 로그</h3><ol>{selectedRecord.simulationLog.map((log) => <li key={`${log.second}-${log.text}`}><time>{String(log.second).padStart(2, '0')}초</time>{log.text}</li>)}</ol></section>
              <section className="warning-card"><h3>위험 변수 / 반전 가능성</h3><p>{selectedRecord.riskFactor}</p></section>
              <p className="disclaimer">이 예측은 재미용 시뮬레이션이며 실제 결과를 보장하지 않습니다.</p>
            </>
            : <div className="detail-empty">왼쪽 기록 카드를 선택하면 상세 내용을 볼 수 있습니다.</div>}
        </aside>
      </section>}
  </main>;
}
