export default function EventCaption({ text, type }: { text: string; type: string }) { return <div className="event-caption"><strong>{type.toUpperCase()}</strong><span>{text}</span></div>; }
