import { SimulationEventType, SimulationPhase } from '../types';

interface EventCaptionProps {
  text: string;
  type: SimulationEventType;
  phase: SimulationPhase;
}

export default function EventCaption({ text, type, phase }: EventCaptionProps) {
  return (
    <div className={`event-caption event-caption-${type}`}>
      <strong>{phase} · {type.toUpperCase()}</strong>
      <span>{text}</span>
    </div>
  );
}
