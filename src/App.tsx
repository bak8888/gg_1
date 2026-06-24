import { useEffect, useMemo, useState } from 'react';
import { matches as sampleMatches } from './data/matches';
import HomePage from './pages/HomePage';
import MatchManagerPage from './pages/MatchManagerPage';
import ResultPage from './pages/ResultPage';
import SimulationPage from './pages/SimulationPage';
import { Match, PredictionResult } from './types';
import { createPrediction } from './utils/predictionEngine';
import { loadUserMatches } from './utils/storage';
import './styles/global.css';

type View = 'home' | 'manager' | 'preparing' | 'simulation' | 'result';

const preparationSteps = ['최근 흐름 분석 중…', '공격 패턴 계산 중…', '수비 균열 탐색 중…', '예측 시뮬레이션 준비 완료'];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [userMatches, setUserMatches] = useState<Match[]>(() => loadUserMatches());
  const allMatches = useMemo(() => [...sampleMatches, ...userMatches], [userMatches]);
  const [matchId, setMatchId] = useState<string>();
  const [preparationStep, setPreparationStep] = useState(0);
  const [prediction, setPrediction] = useState<PredictionResult>(() => createPrediction(allMatches[0]));
  const selectedMatch = allMatches.find((match) => match.id === matchId) ?? allMatches[0];

  const startSimulation = (id: string) => {
    const match = allMatches.find((item) => item.id === id) ?? allMatches[0];
    setMatchId(id);
    setPrediction(createPrediction(match));
    setPreparationStep(0);
    setView('preparing');
  };

  const goHome = () => setView('home');
  const restartPrediction = () => startSimulation(selectedMatch.id);

  useEffect(() => {
    if (view !== 'preparing') return undefined;

    const stepTimer = window.setInterval(() => {
      setPreparationStep((step) => Math.min(step + 1, preparationSteps.length - 1));
    }, 650);
    const finishTimer = window.setTimeout(() => setView('simulation'), 2600);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(finishTimer);
    };
  }, [view]);

  if (view === 'manager') {
    return <MatchManagerPage sampleMatches={sampleMatches} userMatches={userMatches} onChange={setUserMatches} onBack={goHome} />;
  }

  if (view === 'preparing') {
    return <main className="page prep-page">
      <section className="prep-card">
        <p className="league">Analysis Warm-up</p>
        <h1>{selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}</h1>
        <div className="prep-orb" aria-hidden="true" />
        <ol className="prep-steps">
          {preparationSteps.map((step, index) => <li className={index <= preparationStep ? 'active' : ''} key={step}>{step}</li>)}
        </ol>
        <p className="simulation-note">잠시 후 기존 30초 예측 시뮬레이션으로 이동합니다.</p>
      </section>
    </main>;
  }

  if (view === 'simulation') {
    return <SimulationPage match={selectedMatch} prediction={prediction} onComplete={() => setView('result')} />;
  }

  if (view === 'result') {
    return <ResultPage match={selectedMatch} prediction={prediction} onRestart={restartPrediction} onViewMatches={goHome} />;
  }

  return <HomePage matches={allMatches} onSelectMatch={startSimulation} onManageMatches={() => setView('manager')} />;
}
