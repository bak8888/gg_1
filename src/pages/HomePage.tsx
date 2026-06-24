import { useMemo, useState } from 'react';
import MatchCard from '../components/MatchCard';
import { Match } from '../types';

type MatchFilter = 'all' | 'sample' | 'custom';

export default function HomePage({ matches, onSelectMatch, onManageMatches }: { matches: Match[]; onSelectMatch: (id: string) => void; onManageMatches: () => void }) {
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
      <span>실제 도박/배팅 기능이 없는 재미용 예측 웹앱입니다.</span>
      <div className="hero-actions">
        <button onClick={onManageMatches}>경기 추가/관리</button>
      </div>
    </section>

    <section className="toolbar" aria-label="경기 검색 및 필터">
      <label>
        팀명/리그명 검색
        <input value={query} onChange={(event: any) => setQuery(event.target.value)} placeholder="예: 서울, K League" />
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
      : <p className="empty-state">조건에 맞는 경기가 없습니다. 검색어 또는 필터를 바꿔보세요.</p>}
  </main>;
}
