export default function Ball({ x, y }: { x: number; y: number }) { return <div className="ball" style={{ left: `${x}%`, top: `${y}%` }} />; }
