import { Match, SimulationEvent } from '../types';
import Ball from './Ball';
import StickPlayer from './StickPlayer';

export default function SoccerField({ match, event }: { match: Match; event: SimulationEvent }) {
  return <div className="field"><div className="center-line"/><div className="center-circle"/><div className="box box-left"/><div className="box box-right"/>{event.homePlayers.map((p, i) => <StickPlayer key={`h-${i}`} x={p.x} y={p.y} color={match.homeTeam.color} />)}{event.awayPlayers.map((p, i) => <StickPlayer key={`a-${i}`} x={p.x} y={p.y} color={match.awayTeam.color} flip />)}<Ball x={event.ball.x} y={event.ball.y} /></div>;
}
