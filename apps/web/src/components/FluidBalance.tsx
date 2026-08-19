import React from 'react';

export function FluidBalance() {
  const hours = ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '0', '1', '2', '3', '4', '5', '6'];

  const gains = [
    { item: '57657 - FENTANILA 50 MCG/ML 10 ML F/A (IV)', values: ['10,00','','10,00','','10,00','','6,00','','6,00','','4,00','','4,00','','4,00','','4,00','','4,00','','4,00'] },
    { item: '51697 - SORO RINGER SIMPLES - 500ML (IV)', values: ['126,00','','126,00','','126,00','','126,00','','42,00','','42,00','','42,00','','42,00','','42,00','','42,00'] },
    { item: '51616 - MEROPENEM 1G INJ. (IV)', values: ['100,00','','','','','','100,00','','','','','','100,00','','','','','',''] },
  ];

  const losses = [
    { item: '5 - DIURESE POR SVD', values: ['','','','','','300,00','','','','','','300,00','','','','','','','','','',''] },
    { item: '15 - DRENAGEM DVE', values: ['','','','','','','','','','','50,00','','','','','','','','','','',''] },
  ];

  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Balanço Hídrico</h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Controle de entradas e saídas</p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
        <strong>Saldo Acumulado:</strong> -274 mL (Balanço Negativo)
      </div>

      <h4 style={{ color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>Ganhos (Entradas)</h4>
      <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
        <table className="table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th style={{ width: '220px' }}>Item do Balanço - Ganho</th>
              {hours.map(h => <th key={h} style={{ textAlign: 'center', padding: '0.4rem' }}>{h}h</th>)}
            </tr>
          </thead>
          <tbody>
            {gains.map((row, idx) => (
              <tr key={idx}>
                <td><strong>{row.item}</strong></td>
                {hours.map((_, hIdx) => (
                  <td key={hIdx} style={{ textAlign: 'center', background: '#fcfcfc' }}>
                    {row.values[hIdx] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 style={{ color: 'var(--brand-pulse)', marginBottom: '0.5rem' }}>Perdas (Saídas)</h4>
      <div className="table-responsive">
        <table className="table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th style={{ width: '220px' }}>Item do Balanço - Perda</th>
              {hours.map(h => <th key={h} style={{ textAlign: 'center', padding: '0.4rem' }}>{h}h</th>)}
            </tr>
          </thead>
          <tbody>
            {losses.map((row, idx) => (
              <tr key={idx}>
                <td><strong>{row.item}</strong></td>
                {hours.map((_, hIdx) => (
                  <td key={hIdx} style={{ textAlign: 'center', background: '#fff5f5' }}>
                    {row.values[hIdx] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
