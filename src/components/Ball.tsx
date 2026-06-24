import { SimulationEventType } from '../types';

interface BallProps {
  x: number;
  y: number;
  type: SimulationEventType;
}

export default function Ball({ x, y, type }: BallProps) {
  return <div className={`ball ball-${type}`} style={{ left: `${x}%`, top: `${y}%` }} />;
}
