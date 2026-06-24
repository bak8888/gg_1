import { SimulationEventType } from '../types';

interface Props {
  x: number;
  y: number;
  color: string;
  active: boolean;
  eventType: SimulationEventType;
  flip?: boolean;
}

export default function StickPlayer({ x, y, color, active, eventType, flip }: Props) {
  return (
    <div
      className={`stick-player ${active ? 'stick-player-active' : ''} stick-player-${eventType}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        ['--kit' as string]: color,
        transform: `translate(-50%, -50%) scaleX(${flip ? -1 : 1})`,
      }}
    >
      <span className="head" />
      <span className="body" />
      <span className="arm arm-left" />
      <span className="arm arm-right" />
      <span className="leg leg-left" />
      <span className="leg leg-right" />
    </div>
  );
}
