import { Match } from '../types';

export const matches: Match[] = [
  {
    id: 'seoul-busan-001',
    league: 'K League Simulation',
    kickoffTime: '2026-06-24 20:00',
    source: 'sample',
    homeTeam: { name: '서울 유나이티드', shortName: 'SEO', color: '#ff4d5a', stats: { recentForm: 82, attackPower: 78, defensePower: 72, possessionStyle: 86, counterAttack: 63, fatigue: 22 } },
    awayTeam: { name: '부산 마리너스', shortName: 'BUS', color: '#4da3ff', stats: { recentForm: 69, attackPower: 74, defensePower: 68, possessionStyle: 62, counterAttack: 81, fatigue: 35 } },
  },
  {
    id: 'incheon-daegu-002',
    league: 'K League Simulation',
    kickoffTime: '2026-06-25 19:30',
    source: 'sample',
    homeTeam: { name: '인천 웨이브', shortName: 'INC', color: '#6ee7b7', stats: { recentForm: 71, attackPower: 66, defensePower: 79, possessionStyle: 70, counterAttack: 58, fatigue: 28 } },
    awayTeam: { name: '대구 썬더', shortName: 'DAE', color: '#facc15', stats: { recentForm: 75, attackPower: 80, defensePower: 64, possessionStyle: 57, counterAttack: 88, fatigue: 31 } },
  },
  {
    id: 'jeju-suwon-003',
    league: 'Friendly Predictor Cup',
    kickoffTime: '2026-06-26 21:00',
    source: 'sample',
    homeTeam: { name: '제주 오렌지', shortName: 'JEJ', color: '#fb923c', stats: { recentForm: 64, attackPower: 70, defensePower: 71, possessionStyle: 74, counterAttack: 65, fatigue: 42 } },
    awayTeam: { name: '수원 나이츠', shortName: 'SUW', color: '#a78bfa', stats: { recentForm: 83, attackPower: 76, defensePower: 77, possessionStyle: 68, counterAttack: 73, fatigue: 19 } },
  },
];
