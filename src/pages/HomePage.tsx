import { useMemo, useState } from 'react';
import MatchCard from '../components/MatchCard';
import { Match } from '../types';

type MatchFilter = 'all' | 'sample' | 'custom';

export default function HomePage({ matches, onSelectMatch, onManageMatches, onViewHistory }: { matches: Match[]; onSelectMatch: (id: string) => void; onManageMatches: () => void; onViewHistory: () => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MatchFilter>('all');

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return matches.filter((match) => {
      const source = match.source ?? 'sample';
      const matchesFilter = filter === 'all' || source === filter;
      const matchesQuery = !normalizedQuery || [match.league, match.homeTeam.name, match.awayTeam.name]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [filter, matches, query]);

  return <main className="page">
    <section className="hero">
      <p>Fun Football Oracle</p>
      <h1>30초 축구 예측 시뮬레이터</h1>
      <span>현재는 로컬 샘플/사용자 추가 경기 기반으로 작동합니다. 실시간 API 연동은 추후 확장 예정입니다.</span>
      <small>예측은 재미용 시뮬레이션이며 실제 결과를 보장하지 않습니다.</small>
      <div className="hero-actions">
        <button onClick={onManageMatches}>경기 추가/관리</button>
        <button className="secondary-action" onClick={onViewHistory}>예측 기록 보기</button>
      </div>
    </section>

    <section className="toolbar" aria-label="경기 검색 및 필터">
      <label>
        팀명/리그명 검색
        <input value={query} onChange={(event: any) => setQuery(event.target.value)} placeholder="예: 서울, K League" />
        <small>현재 등록된 경기 안에서 팀명 또는 리그명으로 검색합니다. 새 팀은 경기 추가/관리에서 등록할 수 있어요.</small>
      </label>
      <div className="filter-buttons">
        {([
          ['all', '전체 경기'],
          ['sample', '샘플 경기'],
          ['custom', '내가 추가한 경기'],
        ] as Array<[MatchFilter, string]>).map(([value, label]) => (
          <button key={value} className={filter === value ? 'active-filter secondary-action' : 'secondary-action'} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>
    </section>

    {filteredMatches.length > 0
      ? <section className="grid">{filteredMatches.map(match => <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />)}</section>
      : <p className="empty-state">현재 등록된 경기에는 해당 팀이 없습니다. 경기 추가/관리에서 새 경기를 추가해보세요.</p>}
  </main>;
}
