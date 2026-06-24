import { useMemo, useState } from 'react';
import { Match, TeamStats } from '../types';
import { clearUserMatches, deleteUserMatch, normalizeUserMatch, saveUserMatches } from '../utils/storage';

const statFields: Array<{ key: keyof TeamStats; label: string }> = [
  { key: 'recentForm', label: '최근 흐름' },
  { key: 'attackPower', label: '공격력' },
  { key: 'defensePower', label: '수비력' },
  { key: 'possessionStyle', label: '점유 성향' },
  { key: 'counterAttack', label: '역습 성향' },
  { key: 'fatigue', label: '피로도' },
];

const emptyStats: TeamStats = { recentForm: 50, attackPower: 50, defensePower: 50, possessionStyle: 50, counterAttack: 50, fatigue: 50 };
const createBlankMatch = (): Match => ({
  id: `custom-${Date.now()}`,
  league: '',
  kickoffTime: '',
  source: 'custom',
  homeTeam: { name: '', shortName: 'HOM', color: '#38bdf8', stats: { ...emptyStats } },
  awayTeam: { name: '', shortName: 'AWY', color: '#86efac', stats: { ...emptyStats } },
});

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const shortName = (name: string, fallback: string) => name.replace(/\s+/g, '').slice(0, 3).toUpperCase() || fallback;

export default function MatchManagerPage({ userMatches, sampleMatches, onChange, onBack }: { userMatches: Match[]; sampleMatches: Match[]; onChange: (matches: Match[]) => void; onBack: () => void }) {
  const [form, setForm] = useState<Match>(createBlankMatch);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState('');

  const exportJson = useMemo(() => JSON.stringify(userMatches, null, 2), [userMatches]);

  const updateForm = (patch: Partial<Match>) => setForm((prev) => ({ ...prev, ...patch }));
  const updateTeam = (side: 'homeTeam' | 'awayTeam', name: string) => setForm((prev) => ({
    ...prev,
    [side]: { ...prev[side], name, shortName: shortName(name, side === 'homeTeam' ? 'HOM' : 'AWY') },
  }));
  const updateStat = (side: 'homeTeam' | 'awayTeam', key: keyof TeamStats, value: number) => setForm((prev) => ({
    ...prev,
    [side]: { ...prev[side], stats: { ...prev[side].stats, [key]: clamp(value) } },
  }));

  const resetForm = () => {
    setForm(createBlankMatch());
    setEditingId(null);
  };

  const submit = () => {
    const normalized = normalizeUserMatch({ ...form, id: editingId ?? form.id });
    if (!normalized) {
      setMessage('리그명, 홈팀, 원정팀, 경기 시간을 모두 입력해주세요.');
      return;
    }
    const nextMatches = editingId ? userMatches.map((match) => match.id === editingId ? normalized : match) : [...userMatches, normalized];
    saveUserMatches(nextMatches);
    onChange(nextMatches);
    resetForm();
    setMessage(editingId ? '경기를 수정했습니다.' : '새 경기를 추가했습니다.');
  };

  const editMatch = (match: Match) => {
    setForm(match);
    setEditingId(match.id);
    setMessage('수정할 내용을 입력한 뒤 저장하세요.');
  };

  const removeMatch = (id: string) => {
    const nextMatches = deleteUserMatch(id);
    onChange(nextMatches);
    if (editingId === id) resetForm();
    setMessage('경기를 삭제했습니다.');
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      const normalized = rows.map(normalizeUserMatch).filter((match): match is Match => Boolean(match));
      if (normalized.length !== rows.length || normalized.length === 0) {
        setMessage('가져오기 실패: 각 경기에는 리그명, 팀명, 경기 시간과 0~100 지표가 필요합니다.');
        return;
      }
      saveUserMatches(normalized);
      onChange(normalized);
      setMessage(`${normalized.length}개 경기를 가져왔습니다. 기존 사용자 경기 목록을 대체했습니다.`);
    } catch {
      setMessage('가져오기 실패: JSON 형식이 올바르지 않습니다. 대괄호와 쉼표를 확인해주세요.');
    }
  };

  const clearAll = () => {
    clearUserMatches();
    onChange([]);
    resetForm();
    setMessage('사용자 추가 경기 목록을 초기화했습니다.');
  };

  const renderStats = (side: 'homeTeam' | 'awayTeam') => <div className="stat-editor">
    {statFields.map((field) => <label key={`${side}-${field.key}`}>{field.label}
      <input type="range" min="0" max="100" value={form[side].stats[field.key]} onChange={(event: any) => updateStat(side, field.key, Number(event.target.value))} />
      <input type="number" min="0" max="100" value={form[side].stats[field.key]} onChange={(event: any) => updateStat(side, field.key, Number(event.target.value))} />
    </label>)}
  </div>;

  return <main className="page manager-page">
    <button className="secondary-action" onClick={onBack}>← 홈으로 돌아가기</button>
    <section className="hero manager-hero"><p>Match Data Manager</p><h1>경기 데이터 관리</h1><span>샘플 경기 {sampleMatches.length}개와 내가 추가한 경기 {userMatches.length}개를 함께 관리합니다.</span></section>

    {message && <p className="manager-message">{message}</p>}

    <section className="manager-layout">
      <article className="form-card">
        <h2>{editingId ? '경기 수정' : '새 경기 추가'}</h2>
        <div className="form-grid">
          <label>리그명<input value={form.league} onChange={(event: any) => updateForm({ league: event.target.value })} /></label>
          <label>경기 시간<input value={form.kickoffTime} onChange={(event: any) => updateForm({ kickoffTime: event.target.value })} placeholder="2026-06-24 20:00" /></label>
          <label>홈팀 이름<input value={form.homeTeam.name} onChange={(event: any) => updateTeam('homeTeam', event.target.value)} /></label>
          <label>원정팀 이름<input value={form.awayTeam.name} onChange={(event: any) => updateTeam('awayTeam', event.target.value)} /></label>
        </div>
        <div className="team-stat-columns">
          <section><h3>홈팀 지표</h3>{renderStats('homeTeam')}</section>
          <section><h3>원정팀 지표</h3>{renderStats('awayTeam')}</section>
        </div>
        <div className="manager-actions"><button onClick={submit}>{editingId ? '수정 저장' : '경기 추가'}</button><button className="secondary-action" onClick={resetForm}>입력 초기화</button></div>
      </article>

      <article className="form-card">
        <h2>저장된 경기 목록</h2>
        <div className="managed-list">
          {sampleMatches.map((match) => <div className="managed-row sample" key={match.id}><span>샘플 경기</span><b>{match.homeTeam.name} vs {match.awayTeam.name}</b><small>{match.league}</small></div>)}
          {userMatches.map((match) => <div className="managed-row" key={match.id}><span>내가 추가한 경기</span><b>{match.homeTeam.name} vs {match.awayTeam.name}</b><small>{match.league} · {match.kickoffTime}</small><div><button className="secondary-action" onClick={() => editMatch(match)}>수정</button><button className="danger-action" onClick={() => removeMatch(match.id)}>삭제</button></div></div>)}
          {userMatches.length === 0 && <p className="empty-state">아직 직접 추가한 경기가 없습니다.</p>}
        </div>
        <button className="danger-action" onClick={clearAll}>전체 사용자 경기 초기화</button>
      </article>
    </section>

    <section className="json-panel form-card">
      <h2>JSON 가져오기/내보내기</h2>
      <div className="json-grid">
        <label>내보내기<textarea readOnly value={exportJson} /></label>
        <label>가져오기<textarea value={jsonText} onChange={(event: any) => setJsonText(event.target.value)} placeholder="JSON 배열을 붙여넣으세요." /></label>
      </div>
      <button onClick={importJson}>JSON 가져오기</button>
    </section>
  </main>;
}
