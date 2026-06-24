import { useMemo, useState } from 'react';
import MatchCard from '../components/MatchCard';
import { Match } from '../types';
import { getActiveDataProviderMode, getAllMatchesByProvider, getMatchesByProvider, saveActiveDataProviderMode } from '../utils/dataProvider';

type MatchFilter = 'all' | 'sample' | 'custom' | 'mock-api';
type DataViewMode = 'local' | 'mock-api' | 'all';

const dataModeLabels: Record<DataViewMode, string> = {
  local: '로컬 데이터',
  'mock-api': 'Mock API 데이터',
  all: '전체 보기',
};

export default function HomePage({ userMatches, onSelectMatch, onManageMatches, onViewHistory }: { userMatches: Match[]; onSelectMatch: (id: string) => void; onManageMatches: () => void; onViewHistory: () => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [dataMode, setDataMode] = useState<DataViewMode>(() => {
    const activeMode = getActiveDataProviderMode();
    return activeMode === 'mock-api' ? 'mock-api' : 'local';
  });

  const visibleMatches = useMemo(() => {
    if (dataMode === 'all') return getAllMatchesByProvider(userMatches);
    return getMatchesByProvider(dataMode, userMatches);
  }, [dataMode, userMatches]);

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return visibleMatches.filter((match) => {
      const source = match.source ?? 'sample';
      const matchesFilter = filter === 'all' || source === filter;
      const matchesQuery = !normalizedQuery || [match.league, match.homeTeam.name, match.awayTeam.name]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [filter, visibleMatches, query]);

  const changeDataMode = (mode: DataViewMode) => {
    setDataMode(mode);
    saveActiveDataProviderMode(mode === 'all' ? 'local' : mode);
    setFilter('all');
  };

  return <main className="page">
    <section className="hero">
      <p>Fun Football Oracle</p>
      <h1>30초 축구 예측 시뮬레이터</h1>
      <span>현재는 로컬/Mock API 기반으로 작동합니다. 실시간 API 연동은 추후 확장 예정입니다.</span>
      <small>이 예측은 재미용 시뮬레이션이며 실제 결과를 보장하지 않습니다.</small>
      <div className="hero-actions">
        <button onClick={onManageMatches}>경기 추가/관리</button>
        <button className="secondary-action" onClick={onViewHistory}>예측 기록 보기</button>
      </div>
    </section>

    <section className="api-notice" aria-label="실시간 API 연동 예정 안내">
      <div>
        <p>Real-time Data Ready</p>
        <h2>실시간 API 연동 예정</h2>
      </div>
      <ul>
        <li>현재는 로컬/Mock API 기반으로 작동합니다.</li>
        <li>향후 실제 축구 데이터 API를 연결하면 경기 일정, 팀 검색, 최근 흐름을 자동으로 불러올 수 있습니다.</li>
        <li>API 키 보호를 위해 실제 연동 단계에서는 프론트엔드에 API 키를 직접 넣지 않고 별도 서버리스 프록시 또는 백엔드 계층을 사용할 예정입니다.</li>
      </ul>
    </section>

    <section className="data-mode-panel" aria-label="데이터 모드 선택">
      <div>
        <span>데이터 모드</span>
        <strong>{dataModeLabels[dataMode]}</strong>
      </div>
      <div className="data-mode-tabs">
        {(['local', 'mock-api', 'all'] as DataViewMode[]).map((mode) => (
          <button key={mode} className={dataMode === mode ? 'active-filter secondary-action' : 'secondary-action'} onClick={() => changeDataMode(mode)}>{dataModeLabels[mode]}</button>
        ))}
      </div>
    </section>

    <section className="toolbar" aria-label="경기 검색 및 필터">
      <label>
        팀명/리그명 검색
        <input value={query} onChange={(event: any) => setQuery(event.target.value)} placeholder="예: 서울, K League" />
        <small>현재 선택한 데이터 모드 안에서 팀명 또는 리그명으로 검색합니다. 새 팀은 경기 추가/관리에서 등록할 수 있어요.</small>
      </label>
      <div className="filter-buttons">
        {([
          ['all', '전체 경기'],
          ['sample', '샘플 경기'],
          ['custom', '내가 추가한 경기'],
          ['mock-api', 'Mock API'],
        ] as Array<[MatchFilter, string]>).map(([value, label]) => (
          <button key={value} className={filter === value ? 'active-filter secondary-action' : 'secondary-action'} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>
    </section>

    {filteredMatches.length > 0
      ? <section className="grid">{filteredMatches.map(match => <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />)}</section>
      : <p className="empty-state">현재 선택한 데이터 모드에는 해당 팀이 없습니다. 데이터 모드나 검색어를 바꿔보세요.</p>}
  </main>;
}
