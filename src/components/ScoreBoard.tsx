import { Match } from '../types';
export default function ScoreBoard({ match, secondsLeft }: { match: Match; secondsLeft: number }) { return <div className="score-board"><span>{match.homeTeam.shortName}</span><b>{secondsLeft}s</b><span>{match.awayTeam.shortName}</span></div>; }
