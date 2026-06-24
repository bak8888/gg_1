import { Match, TeamStats } from '../types';

const statLabels: Array<{ key: keyof TeamStats; label: string; lowerIsBetter?: boolean }> = [
  { key: 'attackPower', label: '공격 성향' },
  { key: 'defensePower', label: '수비 안정감' },
  { key: 'fatigue', label: '피로도', lowerIsBetter: true },
];

const flowLabel = (value: number) => {
  if (value >= 80) return '상승세';
  if (value >= 70) return '안정세';
  if (value >= 60) return '혼전';
  return '회복 필요';
};

function TeamPanel({ match, side }: { match: Match; side: 'homeTeam' | 'awayTeam' }) {
  const team = match[side];

  return <div className="team-panel">
    <div className="team-heading">
      <span className="team-dot" style={{ backgroundColor: team.color }} />
      <strong>{team.name}</strong>
      <em>{team.shortName}</em>
    </div>
    <p>최근 흐름 <b>{flowLabel(team.stats.recentForm)}</b> · {team.stats.recentForm}점</p>
  </div>;
}

export default function MatchCard({ match, onSelect }: { match: Match; onSelect: (id: string) => void }) {
  return <article className="match-card">
    <div className="card-topline">
      <p className="league">{match.league}</p>
      <span className="kickoff-chip">{match.kickoffTime}</span>
    </div>
    <h2>{match.homeTeam.name} <span>vs</span> {match.awayTeam.name}</h2>
    <div className="team-panels">
      <TeamPanel match={match} side="homeTeam" />
      <TeamPanel match={match} side="awayTeam" />
    </div>
    <div className="metric-grid" aria-label="핵심 팀 지표">
      {statLabels.map((stat) => {
        const homeValue = match.homeTeam.stats[stat.key];
        const awayValue = match.awayTeam.stats[stat.key];
        const betterHome = stat.lowerIsBetter ? homeValue <= awayValue : homeValue >= awayValue;
        return <div className="metric-pill" key={stat.key}>
          <span>{stat.label}</span>
          <b>{match.homeTeam.shortName} {homeValue}</b>
          <i className={betterHome ? 'home-edge' : 'away-edge'}>{betterHome ? match.homeTeam.shortName : match.awayTeam.shortName} 우세</i>
        </div>;
      })}
    </div>
    <button className="primary-action" onClick={() => onSelect(match.id)}>예측 보기</button>
  </article>;
}
