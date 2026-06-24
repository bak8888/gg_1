import { useState } from 'react';
import { matches } from './data/matches';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import SimulationPage from './pages/SimulationPage';
import { PredictionResult } from './types';
import { createPrediction } from './utils/predictionEngine';
import './styles/global.css';

type View = 'home' | 'simulation' | 'result';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [matchId, setMatchId] = useState<string>();
  const [prediction, setPrediction] = useState<PredictionResult>(() => createPrediction(matches[0]));
  const selectedMatch = matches.find((match) => match.id === matchId) ?? matches[0];

  const startSimulation = (id: string) => {
    const match = matches.find((item) => item.id === id) ?? matches[0];
    setMatchId(id);
    setPrediction(createPrediction(match));
    setView('simulation');
  };

  if (view === 'simulation') {
    return <SimulationPage match={selectedMatch} prediction={prediction} onComplete={() => setView('result')} />;
  }

  if (view === 'result') {
    return <ResultPage match={selectedMatch} prediction={prediction} onRestart={() => setView('home')} />;
  }

  return <HomePage onSelectMatch={startSimulation} />;
}
