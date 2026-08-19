import React, { useState } from 'react';

export function NursingScales() {
  const [painScale, setPainScale] = useState(0);
  const [glasgow, setGlasgow] = useState(15);
  const [rass, setRass] = useState('0 - Alerta e calmo');
  const [bradenScore, setBradenScore] = useState('16 - Risco Moderado');
  const [fugulin, setFugulin] = useState('Cuidado Semiintensivo');
  const [savedHistory, setSavedHistory] = useState<any[]>([
    { date: '05/08/2026 00:15', scale: 'Dor', result: '0 (Sem Dor)', author: 'ENF. RENAN ALEXANDRE' },
    { date: '05/08/2026 00:15', scale: 'Fugulin', result: 'CUIDADO INTENSIVO', author: 'ENF. RENAN ALEXANDRE' },
    { date: '05/08/2026 00:10', scale: 'Morse', result: '45 OU MAIS - ALTO RISCO DE QUEDA', author: 'ENF. RENAN ALEXANDRE' },
  ]);

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      date: new Date().toLocaleString('pt-BR'),
      scale: 'Avaliação de Escalas',
      result: `Dor: ${painScale} | Glasgow: ${glasgow} | Fugulin: ${fugulin}`,
      author: 'ENFERMEIRO PLANTÃO UPA',
    };
    setSavedHistory([newEntry, ...savedHistory]);
  };

  return (
    <div className="card">
      <div className="card-title">Avaliações e Escalas</div>
      <form onSubmit={handleSaveScale} style={{ marginBottom: '1.5rem' }}>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Dor (0 a 10)</label>
            <input className="form-control" type="number" min={0} max={10} value={painScale} onChange={e => setPainScale(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Glasgow (3 a 15)</label>
            <input className="form-control" type="number" min={3} max={15} value={glasgow} onChange={e => setGlasgow(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">RASS (Sedação)</label>
            <select className="form-control" value={rass} onChange={e => setRass(e.target.value)}>
              <option value="0 - Alerta e calmo">0 - Alerta e calmo</option>
              <option value="-1 - Sonolento">-1 - Sonolento</option>
              <option value="-2 - Sedação Leve">-2 - Sedação Leve</option>
              <option value="-3 - Sedação Moderada">-3 - Sedação Moderada</option>
              <option value="-4 - Sedação Profunda">-4 - Sedação Profunda</option>
              <option value="-5 - Indespertável">-5 - Indespertável</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fugulin</label>
            <select className="form-control" value={fugulin} onChange={e => setFugulin(e.target.value)}>
              <option value="Cuidado Mínimo">Cuidado Mínimo</option>
              <option value="Cuidado Intermediário">Cuidado Intermediário</option>
              <option value="Cuidado Semiintensivo">Cuidado Semiintensivo</option>
              <option value="Cuidado Intensivo">Cuidado Intensivo</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Braden</label>
            <select className="form-control" value={bradenScore} onChange={e => setBradenScore(e.target.value)}>
              <option value="16 - Risco Moderado">16 - Risco Moderado</option>
              <option value="12 - Risco Elevado">12 - Risco Elevado</option>
              <option value="19 - Sem Risco">19 - Sem Risco</option>
            </select>
          </div>
        </div>
        <button className="btn btn-mint" type="submit">Salvar Avaliações</button>
      </form>

      <div className="card-title" style={{ fontSize: '1rem' }}>Histórico de Avaliações</div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Escala</th>
              <th>Resultado</th>
              <th>Profissional</th>
            </tr>
          </thead>
          <tbody>
            {savedHistory.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td><strong>{item.scale}</strong></td>
                <td>{item.result}</td>
                <td>{item.author}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
