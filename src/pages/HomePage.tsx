import MatchCard from '../components/MatchCard';
import { matches } from '../data/matches';

export default function HomePage({ onSelectMatch }: { onSelectMatch: (id: string) => void }) {
  return (
    <main className="page">
      <section className="hero">
        <p>Fun Football Oracle</p>
        <h1>30초 축구 예측 시뮬레이터</h1>
        <span>실제 도박/배팅 기능이 없는 재미용 예측 웹앱입니다.</span>
      </section>
      <section className="grid">
        {matches.map((match) => <MatchCard key={match.id} match={match} onSelect={onSelectMatch} />)}
      </section>
    </main>
  );
}
