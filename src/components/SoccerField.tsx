import { Match, SimulationEvent } from '../types';
import Ball from './Ball';
import StickPlayer from './StickPlayer';

export default function SoccerField({ match, event }: { match: Match; event: SimulationEvent }) {
  return (
    <div className={`field field-${event.type}`}>
      <div className="goal-post goal-left" />
      <div className="goal-post goal-right" />
      <div className="center-line" />
      <div className="center-circle" />
      <div className="box box-left" />
      <div className="box box-right" />
      {event.homePlayers.map((player, index) => (
        <StickPlayer
          key={`h-${index}`}
          x={player.x}
          y={player.y}
          color={match.homeTeam.color}
          active={event.team === 'home'}
          eventType={event.type}
        />
      ))}
      {event.awayPlayers.map((player, index) => (
        <StickPlayer
          key={`a-${index}`}
          x={player.x}
          y={player.y}
          color={match.awayTeam.color}
          active={event.team === 'away'}
          eventType={event.type}
          flip
        />
      ))}
      <Ball x={event.ball.x} y={event.ball.y} type={event.type} />
      {event.type === 'goal' && <div className="goal-burst">GOAL!</div>}
    </div>
  );
}
