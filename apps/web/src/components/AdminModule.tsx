import React, { useState } from 'react';
import type { ActiveMenu } from './Sidebar';
import { InstitutionalPrintHeader } from './InstitutionalPrintHeader';

interface AdminModuleProps {
  activeMenu: ActiveMenu;
  onNavigateMenu?: (menu: ActiveMenu) => void;
}

export type ReportCategory = 
  | 'ATTENDANCE'
  | 'TRIAGE'
  | 'BEDS_OBS'
  | 'CARE'
  | 'DIAGNOSTICS'
  | 'OUTCOMES'
  | 'TRANSFERS'
  | 'DOCS'
  | 'PATIENT_SAFETY'
  | 'PRODUCTIVITY'
  | 'COMPARATIVE'
  | 'CUSTOM';

export function AdminModule({ activeMenu, onNavigateMenu }: AdminModuleProps) {
  // Estado interno do módulo de Relatórios
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('ATTENDANCE');
  const [filterPeriod, setFilterPeriod] = useState<string>('MONTH');
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [filterProfessional, setFilterProfessional] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  
  // Detalhamento do Diagnóstico Selecionado (Drill-Down)
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<string | null>(null);

  // Notificação de Exportação
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleExport = (format: 'PDF' | 'CSV' | 'EXCEL') => {
    setExportMessage(`Relatório (${activeCategory}) exportado com sucesso no formato ${format}! Evento registrado na Auditoria.`);
    setTimeout(() => setExportMessage(null), 4000);
  };

  return (
    <div>
      {/* ===================================================================
          1. DASHBOARD — PAINEL EXECUTIVO GERENCIAL (VISÃO EXECUTIVA RESUMIDA)
          =================================================================== */}
      {activeMenu === 'admin_dashboard' && (
        <div>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>DASHBOARD EXECUTIVO</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Painel gerencial resumido com principais indicadores assistenciais e operacionais</p>
            </div>
            {onNavigateMenu && (
              <button className="btn btn-primary" onClick={() => onNavigateMenu('admin_reports')}>
                📊 Ver Relatórios Detalhados
              </button>
            )}
          </div>

          {/* Cards Executivos de Indicadores Globais */}
          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL DE ATENDIMENTOS (MÊS)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>1.428</div>
              <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700, marginTop: '0.25rem' }}>↑ 4.2% em relação ao mês anterior</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>ATENDIMENTOS ATUAIS NA UNIDADE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', marginTop: '0.2rem' }}>28</div>
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 700, marginTop: '0.25rem' }}>2 Recepção • 3 Triagem • 23 Permanência</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>TEMPO MÉDIO DE ESPERA (TRIAGEM ➔ MÉDICO)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>14 min</div>
              <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700, marginTop: '0.25rem' }}>Dentro da meta institucional (&lt; 20 min)</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #991b1b' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>OCUPAÇÃO DE LEITOS ASSISTENCIAIS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#991b1b', marginTop: '0.2rem' }}>72.2%</div>
              <div style={{ fontSize: '0.74rem', color: '#991b1b', fontWeight: 700, marginTop: '0.25rem' }}>26 dos 36 leitos físicos permanentes ocupados</div>
            </div>
          </div>

          {/* Gráficos e Distribuição Executiva em Duas Colunas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.15rem', marginBottom: '1.25rem' }}>
            {/* Distribuição Manchester */}
            <div className="card">
              <div className="card-title">CLASSIFICAÇÃO DE RISCO (MANCHESTER)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>🔴 VERMELHO (Emergente)</span>
                    <span>4.2% (60 atendimentos)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', marginTop: '0.2rem', overflow: 'hidden' }}>
                    <div style={{ background: '#dc2626', width: '4.2%', height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>🟠 LARANJA (Muito Urgente)</span>
                    <span>18.5% (264 atendimentos)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', marginTop: '0.2rem', overflow: 'hidden' }}>
                    <div style={{ background: '#ea580c', width: '18.5%', height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>🟡 AMARELO (Urgente)</span>
                    <span>52.1% (744 atendimentos)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', marginTop: '0.2rem', overflow: 'hidden' }}>
                    <div style={{ background: '#d97706', width: '52.1%', height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>🟢 VERDE (Pouco Urgente)</span>
                    <span>22.0% (314 atendimentos)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', marginTop: '0.2rem', overflow: 'hidden' }}>
                    <div style={{ background: '#16a34a', width: '22.0%', height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>🔵 AZUL (Não Urgente)</span>
                    <span>3.2% (46 atendimentos)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', marginTop: '0.2rem', overflow: 'hidden' }}>
                    <div style={{ background: '#2563eb', width: '3.2%', height: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo de Desfechos e Alertas Críticos */}
            <div className="card">
              <div className="card-title">DESFECHOS E INDICADORES CRÍTICOS</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Desfecho</th>
                      <th>Qtd. Mês</th>
                      <th>% Total</th>
                      <th>Meta Institucional</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Alta Médica</strong></td>
                      <td>1.120</td>
                      <td>78.4%</td>
                      <td><span className="badge-manchester badge-VERDE">DENTRO DA META</span></td>
                    </tr>
                    <tr>
                      <td><strong>Internação UPA</strong></td>
                      <td>182</td>
                      <td>12.7%</td>
                      <td><span className="badge-manchester badge-AZUL">CONTROLADO</span></td>
                    </tr>
                    <tr>
                      <td><strong>Transferência (SER / TFD)</strong></td>
                      <td>98</td>
                      <td>6.8%</td>
                      <td><span className="badge-manchester badge-AMARELO">MONITORADO</span></td>
                    </tr>
                    <tr>
                      <td><strong>Evasão / Desistência</strong></td>
                      <td>21</td>
                      <td>1.4%</td>
                      <td><span className="badge-manchester badge-AMARELO">ATENÇÃO</span></td>
                    </tr>
                    <tr>
                      <td><strong>Óbito na Unidade</strong></td>
                      <td>7</td>
                      <td>0.5%</td>
                      <td><span className="badge-manchester badge-VERMELHO">AUDITADO 100%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          2. RELATÓRIOS — CENTRO INTEGRAL DE INDICADORES E ANÁLISES (12 CATEGORIAS)
          =================================================================== */}
      {activeMenu === 'admin_reports' && (
        <div>
          <InstitutionalPrintHeader documentTitle="RELATÓRIO GERENCIAL E INDICADORES DA UPA 24H BREVES" />
          {/* Header do Módulo de Relatórios */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>CENTRO DE INDICADORES E RELATÓRIOS</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Análises estatísticas, diagnósticos prevalentes, produtividade e auditoria assistencial da UPA</p>
            </div>

            {/* Ações de Exportação Global */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('PDF')}>📄 Exportar PDF</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('EXCEL')}>📊 Exportar Excel</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('CSV')}>📁 Exportar CSV</button>
            </div>
          </div>

          {exportMessage && (
            <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{exportMessage}</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }} onClick={() => setExportMessage(null)}>✕</button>
            </div>
          )}

          {/* Barra Unificada de Filtros Globais */}
          <div className="card" style={{ marginBottom: '1.25rem', background: '#ffffff', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand-navy)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              FILTROS DE ANÁLISE E DIMENSÕES
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Período de Análise</label>
                <select className="form-control" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}>
                  <option value="TODAY">Hoje (24 horas)</option>
                  <option value="WEEK">Esta Semana</option>
                  <option value="MONTH">Este Mês (Agosto/2026)</option>
                  <option value="QUARTER">Este Trimestre</option>
                  <option value="YEAR">Ano de 2026</option>
                  <option value="CUSTOM">Período Personalizado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Setor Assistencial</label>
                <select className="form-control" value={filterSector} onChange={e => setFilterSector(e.target.value)}>
                  <option value="ALL">Todos os Setores</option>
                  <option value="RECEPTION">Recepção / Triagem</option>
                  <option value="EMERGENCY">Sala Vermelha / Emergência</option>
                  <option value="OBSERVATION">Observação</option>
                  <option value="ADULT_INT">Internação Adulto</option>
                  <option value="PEDIATRICS">Pediatria</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Profissional Responsável</label>
                <select className="form-control" value={filterProfessional} onChange={e => setFilterProfessional(e.target.value)}>
                  <option value="ALL">Todos os Profissionais</option>
                  <option value="dr_thales">Dr. Thales Djalon (Médico Clínico)</option>
                  <option value="enf_marcus">Marcus Yan (Enfermeiro)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Classificação de Risco</label>
                <select className="form-control" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                  <option value="ALL">Todas as Classificações</option>
                  <option value="VERMELHO">Vermelho (Emergente)</option>
                  <option value="LARANJA">Laranja (Muito Urgente)</option>
                  <option value="AMARELO">Amarelo (Urgente)</option>
                  <option value="VERDE">Verde (Pouco Urgente)</option>
                  <option value="AZUL">Azul (Não Urgente)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Desfecho Assistencial</label>
                <select className="form-control" value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
                  <option value="ALL">Todos os Desfechos</option>
                  <option value="ALTA">Alta Médica</option>
                  <option value="INTERNACAO">Internação</option>
                  <option value="TRANSFERENCIA">Transferência / SER</option>
                  <option value="EVASAO">Evasão / Desistência</option>
                  <option value="OBITO">Óbito</option>
                </select>
              </div>
            </div>
          </div>

          {/* Navegação Interna pelas 12 Categorias do Módulo de Relatórios */}
          <nav className="chart-subnav" style={{ marginBottom: '1.25rem' }}>
            <button className={`chart-tab ${activeCategory === 'ATTENDANCE' ? 'active' : ''}`} onClick={() => setActiveCategory('ATTENDANCE')}>A. Atendimento</button>
            <button className={`chart-tab ${activeCategory === 'TRIAGE' ? 'active' : ''}`} onClick={() => setActiveCategory('TRIAGE')}>B. Triagem e Risk</button>
            <button className={`chart-tab ${activeCategory === 'BEDS_OBS' ? 'active' : ''}`} onClick={() => setActiveCategory('BEDS_OBS')}>C. Observação e Leitos</button>
            <button className={`chart-tab ${activeCategory === 'CARE' ? 'active' : ''}`} onClick={() => setActiveCategory('CARE')}>D. Assistência e Exames</button>
            <button className={`chart-tab ${activeCategory === 'DIAGNOSTICS' ? 'active' : ''}`} onClick={() => setActiveCategory('DIAGNOSTICS')}>E. Diagnósticos Prevalentes</button>
            <button className={`chart-tab ${activeCategory === 'OUTCOMES' ? 'active' : ''}`} onClick={() => setActiveCategory('OUTCOMES')}>F. Desfechos</button>
            <button className={`chart-tab ${activeCategory === 'TRANSFERS' ? 'active' : ''}`} onClick={() => setActiveCategory('TRANSFERS')}>G. Transferências</button>
            <button className={`chart-tab ${activeCategory === 'DOCS' ? 'active' : ''}`} onClick={() => setActiveCategory('DOCS')}>H. Documentação</button>
            <button className={`chart-tab ${activeCategory === 'PATIENT_SAFETY' ? 'active' : ''}`} onClick={() => setActiveCategory('PATIENT_SAFETY')}>I. Segurança Paciente</button>
            <button className={`chart-tab ${activeCategory === 'PRODUCTIVITY' ? 'active' : ''}`} onClick={() => setActiveCategory('PRODUCTIVITY')}>J. Produtividade</button>
            <button className={`chart-tab ${activeCategory === 'COMPARATIVE' ? 'active' : ''}`} onClick={() => setActiveCategory('COMPARATIVE')}>K. Comparativos</button>
            <button className={`chart-tab ${activeCategory === 'CUSTOM' ? 'active' : ''}`} onClick={() => setActiveCategory('CUSTOM')}>L. Personalizado</button>
          </nav>

          {/* ===================================================================
              CATEGORIA A: RELATÓRIOS DE ATENDIMENTO
              =================================================================== */}
          {activeCategory === 'ATTENDANCE' && (
            <div className="card">
              <div className="card-title">A. RELATÓRIO COMPLETO DE ATENDIMENTOS</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Dimensão / Período</th>
                      <th>Total Atendimentos</th>
                      <th>Tempo Médio Permanência</th>
                      <th>Taxa de Retorno (24h)</th>
                      <th>Taxa de Retorno (72h)</th>
                      <th>Taxa de Evasão</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Hoje (24h)</strong></td>
                      <td>142</td>
                      <td>3h 45min</td>
                      <td>1.4% (2 pacientes)</td>
                      <td>2.8% (4 pacientes)</td>
                      <td>0.7% (1 paciente)</td>
                    </tr>
                    <tr>
                      <td><strong>Esta Semana</strong></td>
                      <td>680</td>
                      <td>4h 12min</td>
                      <td>1.8% (12 pacientes)</td>
                      <td>3.1% (21 pacientes)</td>
                      <td>1.1% (7 pacientes)</td>
                    </tr>
                    <tr>
                      <td><strong>Este Mês (Agosto/2026)</strong></td>
                      <td>1.428</td>
                      <td>4h 05min</td>
                      <td>1.6% (23 pacientes)</td>
                      <td>2.9% (41 pacientes)</td>
                      <td>1.4% (20 pacientes)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA B: TRIAGEM E CLASSIFICAÇÃO DE RISCO
              =================================================================== */}
          {activeCategory === 'TRIAGE' && (
            <div className="card">
              <div className="card-title">B. TRIAGEM E CLASSIFICAÇÃO DE RISCO (MANCHESTER)</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Classificação</th>
                      <th>Pacientes Triados</th>
                      <th>% do Total</th>
                      <th>Tempo Médio Espera (Triagem ➔ Médico)</th>
                      <th>Tempo Mín / Máx Espera</th>
                      <th>Taxa de Reclassificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge-manchester badge-VERMELHO">VERMELHO</span></td>
                      <td>60</td>
                      <td>4.2%</td>
                      <td>0 min (Imediato)</td>
                      <td>0 min / 2 min</td>
                      <td>0.0%</td>
                    </tr>
                    <tr>
                      <td><span className="badge-manchester badge-LARANJA">LARANJA</span></td>
                      <td>264</td>
                      <td>18.5%</td>
                      <td>8 min</td>
                      <td>2 min / 12 min</td>
                      <td>1.2% (3 reclassificações)</td>
                    </tr>
                    <tr>
                      <td><span className="badge-manchester badge-AMARELO">AMARELO</span></td>
                      <td>744</td>
                      <td>52.1%</td>
                      <td>18 min</td>
                      <td>5 min / 32 min</td>
                      <td>2.1% (15 reclassificações)</td>
                    </tr>
                    <tr>
                      <td><span className="badge-manchester badge-VERDE">VERDE</span></td>
                      <td>314</td>
                      <td>22.0%</td>
                      <td>42 min</td>
                      <td>10 min / 78 min</td>
                      <td>0.6% (2 reclassificações)</td>
                    </tr>
                    <tr>
                      <td><span className="badge-manchester badge-AZUL">AZUL</span></td>
                      <td>46</td>
                      <td>3.2%</td>
                      <td>65 min</td>
                      <td>15 min / 110 min</td>
                      <td>0.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA C: OBSERVAÇÃO E LEITOS
              =================================================================== */}
          {activeCategory === 'BEDS_OBS' && (
            <div className="card">
              <div className="card-title">C. INDICAÇÕES E OCUPAÇÃO DE OBSERVAÇÃO E LEITOS</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Setor Assistencial</th>
                      <th>Leitos Físicos</th>
                      <th>Leitos Extras Ativos</th>
                      <th>Taxa de Ocupação Média</th>
                      <th>Giro dos Leitos (Saídas/Leito)</th>
                      <th>Tempo Médio Permanência</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Sala Vermelha</strong></td>
                      <td>4 leitos</td>
                      <td>0 extras</td>
                      <td>75.0%</td>
                      <td>3.2 altas/dia</td>
                      <td>12h 40min</td>
                    </tr>
                    <tr>
                      <td><strong>Internação Adulto</strong></td>
                      <td>17 leitos</td>
                      <td>1 extra</td>
                      <td>82.4%</td>
                      <td>1.1 altas/dia</td>
                      <td>3 dias 14h</td>
                    </tr>
                    <tr>
                      <td><strong>Pediatria</strong></td>
                      <td>6 leitos</td>
                      <td>0 extras</td>
                      <td>50.0%</td>
                      <td>1.8 altas/dia</td>
                      <td>1 dia 08h</td>
                    </tr>
                    <tr>
                      <td><strong>Observação</strong></td>
                      <td>9 leitos</td>
                      <td>0 extras</td>
                      <td>66.7%</td>
                      <td>2.5 altas/dia</td>
                      <td>18h 30min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA D: ASSISTÊNCIA E EXAMES
              =================================================================== */}
          {activeCategory === 'CARE' && (
            <div className="card">
              <div className="card-title">D. PROCEDIMENTOS, EXAMES E PRESCRIÇÕES ASSISTENCIAIS</div>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>EXAMES SOLICITADOS (MÊS)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)' }}>1.240</div>
                  <div style={{ fontSize: '0.74rem', color: '#475569' }}>1.180 realizados • 60 pendentes</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>TEMPO MÉDIO DE LAUDO/RESULTADO</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7' }}>45 min</div>
                  <div style={{ fontSize: '0.74rem', color: '#15803d' }}>Laboratório e Raio-X integrados</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>PRESCRIÇÕES MÉDICAS EMITIDAS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)' }}>2.110</div>
                  <div style={{ fontSize: '0.74rem', color: '#475569' }}>100% assinadas eletronicamente</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA E: DIAGNÓSTICOS PREVALENTES (PAINEL ANALÍTICO PRÓPRIO)
              =================================================================== */}
          {activeCategory === 'DIAGNOSTICS' && (
            <div>
              <div className="card" style={{ borderLeft: '4px solid var(--brand-navy)' }}>
                <div className="card-title">E. PAINEL ANALÍTICO DE DIAGNÓSTICOS PREVALENTES (CID-10)</div>
                <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1rem' }}>
                  Ranking automático de diagnósticos codificados registrados nos atendimentos e prontuários da UPA. Clique em um diagnóstico para abrir a análise aprofundada.
                </p>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código CID-10</th>
                        <th>Descrição do Diagnóstico</th>
                        <th>Qtd. Casos</th>
                        <th>% Total</th>
                        <th>Principal Desfecho</th>
                        <th>Tempo Médio Permanência</th>
                        <th>Taxa Retorno (72h)</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: selectedDiagnostic === 'I60' ? '#f0f9ff' : 'transparent' }}>
                        <td><strong>I60</strong></td>
                        <td>Hemorragia Subaracnoidea / Acidente Vascular Cerebral (AVC)</td>
                        <td>142</td>
                        <td>9.9%</td>
                        <td><span className="badge-manchester badge-AZUL">TRANSFERÊNCIA / SER</span></td>
                        <td>8h 20min</td>
                        <td>1.2%</td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDiagnostic(selectedDiagnostic === 'I60' ? null : 'I60')}>
                            {selectedDiagnostic === 'I60' ? 'Fechar Análise' : 'Aprofundar Análise'}
                          </button>
                        </td>
                      </tr>
                      <tr style={{ background: selectedDiagnostic === 'S06' ? '#f0f9ff' : 'transparent' }}>
                        <td><strong>S06</strong></td>
                        <td>Traumatismo Intracraniano / TCE (Quedas e Acidentes)</td>
                        <td>128</td>
                        <td>9.0%</td>
                        <td><span className="badge-manchester badge-VERDE">ALTA COM ORIENTAÇÃO</span></td>
                        <td>4h 15min</td>
                        <td>2.3%</td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDiagnostic(selectedDiagnostic === 'S06' ? null : 'S06')}>
                            {selectedDiagnostic === 'S06' ? 'Fechar Análise' : 'Aprofundar Análise'}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>I10</strong></td>
                        <td>Hipertensão Arterial Essencial (Crise Hipertensiva)</td>
                        <td>115</td>
                        <td>8.1%</td>
                        <td><span className="badge-manchester badge-VERDE">ALTA APÓS OBSERVAÇÃO</span></td>
                        <td>3h 10min</td>
                        <td>3.8%</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => setSelectedDiagnostic('I10')}>Aprofundar Análise</button></td>
                      </tr>
                      <tr>
                        <td><strong>J18</strong></td>
                        <td>Pneumonia por Agente Não Especificado</td>
                        <td>94</td>
                        <td>6.6%</td>
                        <td><span className="badge-manchester badge-AZUL">INTERNAÇÃO UPA</span></td>
                        <td>2 dias 04h</td>
                        <td>1.0%</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => setSelectedDiagnostic('J18')}>Aprofundar Análise</button></td>
                      </tr>
                      <tr>
                        <td><strong>A09</strong></td>
                        <td>Gastroenterite e Colite de Origem Infecciosa</td>
                        <td>82</td>
                        <td>5.7%</td>
                        <td><span className="badge-manchester badge-VERDE">ALTA DOMICILIAR</span></td>
                        <td>2h 45min</td>
                        <td>1.9%</td>
                        <td><button className="btn btn-secondary btn-sm" onClick={() => setSelectedDiagnostic('A09')}>Aprofundar Análise</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detalhamento Analítico do Diagnóstico Selecionado (Drill-Down) */}
              {selectedDiagnostic && (
                <div className="card" style={{ border: '2px solid var(--brand-navy)', background: '#f8fafc' }}>
                  <div className="card-title" style={{ color: 'var(--brand-navy)' }}>
                    <span>ANÁLISE APROFUNDADA — {selectedDiagnostic === 'I60' ? 'I60 (Hemorragia Subaracnoidea / AVC)' : selectedDiagnostic === 'S06' ? 'S06 (Trauma Intracraniano / TCE)' : selectedDiagnostic}</span>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }} onClick={() => setSelectedDiagnostic(null)}>✕ Fechar</button>
                  </div>

                  <div className="form-grid" style={{ fontSize: '0.86rem' }}>
                    <div><strong>Faixa Etária Predominante:</strong> 50 a 75 anos (64% dos casos)</div>
                    <div><strong>Distribuição por Sexo:</strong> 52% Masculino • 48% Feminino</div>
                    <div><strong>Setor de Maior Atendimento:</strong> Sala Vermelha (58%) e Observação (42%)</div>
                    <div><strong>Taxa de Transferência Externa (SER):</strong> 68.4% dos pacientes</div>
                    <div><strong>Taxa de Óbito Associado:</strong> 2.1% (3 casos auditados)</div>
                    <div><strong>Tempo Médio até Transferência Efetivada:</strong> 6h 15min</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              CATEGORIA F: DESFECHOS
              =================================================================== */}
          {activeCategory === 'OUTCOMES' && (
            <div className="card">
              <div className="card-title">F. RELATÓRIO DE DESFECHOS ASSISTENCIAIS</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo de Desfecho</th>
                      <th>Quantidade</th>
                      <th>% do Total</th>
                      <th>Faixa Etária Média</th>
                      <th>Setor Predominante</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Alta Médica Domiciliar</strong></td>
                      <td>1.120</td>
                      <td>78.4%</td>
                      <td>38 anos</td>
                      <td>Consultórios / Reavaliação</td>
                    </tr>
                    <tr>
                      <td><strong>Internação na UPA</strong></td>
                      <td>182</td>
                      <td>12.7%</td>
                      <td>62 anos</td>
                      <td>Internação Adulto / Pediatria</td>
                    </tr>
                    <tr>
                      <td><strong>Transferência para Hospital de Referência (SER)</strong></td>
                      <td>98</td>
                      <td>6.8%</td>
                      <td>54 anos</td>
                      <td>Sala Vermelha</td>
                    </tr>
                    <tr>
                      <td><strong>Evasão / Saída a Pedido</strong></td>
                      <td>21</td>
                      <td>1.4%</td>
                      <td>29 anos</td>
                      <td>Recepção / Observação</td>
                    </tr>
                    <tr>
                      <td><strong>Óbito</strong></td>
                      <td>7</td>
                      <td>0.5%</td>
                      <td>71 anos</td>
                      <td>Sala Vermelha</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA G: TRANSFERÊNCIAS (SER / TFD)
              =================================================================== */}
          {activeCategory === 'TRANSFERS' && (
            <div className="card">
              <div className="card-title">G. INDICADORES DE TRANSFERÊNCIA E REGULAÇÃO (SER / TFD)</div>
              <div className="form-grid" style={{ marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>SOLICITAÇÕES DE VAGA</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)' }}>98</div>
                  <div style={{ fontSize: '0.74rem', color: '#475569' }}>88 efetivadas • 10 em aguardo</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>5h 40min</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>TEMPO MÉDIO ATÊ TRANSFERÊNCIA</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>89.8%</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>TAXA DE ACEITE DA REGULAÇÃO</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA H: DOCUMENTAÇÃO ASSISTENCIAL
              =================================================================== */}
          {activeCategory === 'DOCS' && (
            <div className="card">
              <div className="card-title">H. PRODUÇÃO DE DOCUMENTOS INSTITUCIONAIS</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo de Documento</th>
                      <th>Emitidos (Mês)</th>
                      <th>Assinados Eletronicamente</th>
                      <th>Pendentes / Rascunhos</th>
                      <th>Inativados / Retificados</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Laudo de AIH (Internação Hospitalar)</strong></td>
                      <td>182</td>
                      <td>182 (100%)</td>
                      <td>0</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td><strong>Laudo de APAC (Procedimento Ambulatorial)</strong></td>
                      <td>94</td>
                      <td>94 (100%)</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td><strong>Solicitação de Sangue (HEMOPA)</strong></td>
                      <td>36</td>
                      <td>36 (100%)</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td><strong>Prescrições Médicas Hospitalares</strong></td>
                      <td>2.110</td>
                      <td>2.110 (100%)</td>
                      <td>0</td>
                      <td>3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA I: SEGURANÇA DO PACIENTE
              =================================================================== */}
          {activeCategory === 'PATIENT_SAFETY' && (
            <div className="card">
              <div className="card-title">I. NOTIFICAÇÕES DE SEGURANÇA DO PACIENTE E NUCLEO DE SEGURANÇA</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo de Evento</th>
                      <th>Notificações Mês</th>
                      <th>Gravidade Predominante</th>
                      <th>Status da Investigação NSP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Queda de Leito / Maca</strong></td>
                      <td>2</td>
                      <td>Leve (sem lesão)</td>
                      <td><span className="badge-manchester badge-VERDE">INVESTIGADO / CONCLUÍDO</span></td>
                    </tr>
                    <tr>
                      <td><strong>Quase Erro de Medicação (Near Miss)</strong></td>
                      <td>4</td>
                      <td>Nenhuma (interceptado)</td>
                      <td><span className="badge-manchester badge-AZUL">AÇÃO PREVENTIVA ADOTADA</span></td>
                    </tr>
                    <tr>
                      <td><strong>Perda de Acesso Venoso / Sonda</strong></td>
                      <td>6</td>
                      <td>Leve</td>
                      <td><span className="badge-manchester badge-VERDE">CONCLUÍDO</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA J: PRODUTIVIDADE
              =================================================================== */}
          {activeCategory === 'PRODUCTIVITY' && (
            <div className="card">
              <div className="card-title">J. RELATÓRIO DE PRODUTIVIDADE DA EQUIPE ASSISTENCIAL</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Profissional</th>
                      <th>Função</th>
                      <th>Atendimentos Realizados</th>
                      <th>Prescrições / Evoluções</th>
                      <th>Tempo Médio por Atendimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>DR. THALES DJALON CHAGAS DE ARAUJO</strong></td>
                      <td>Médico Clínico</td>
                      <td>742 atendimentos</td>
                      <td>1.080 prescrições/evoluções</td>
                      <td>12 min</td>
                    </tr>
                    <tr>
                      <td><strong>MARCUS YAN DOS SANTOS COSTA</strong></td>
                      <td>Enfermeiro Classificador</td>
                      <td>686 triagens/evoluções</td>
                      <td>940 procedimentos/registros</td>
                      <td>6 min</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA K: ANÁLISES COMPARATIVAS
              =================================================================== */}
          {activeCategory === 'COMPARATIVE' && (
            <div className="card">
              <div className="card-title">K. ANÁLISE COMPARATIVA TEMPORAL</div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Indicador</th>
                      <th>Mês Atual (Agosto/2026)</th>
                      <th>Mês Anterior (Julho/2026)</th>
                      <th>Variação Absoluta</th>
                      <th>Variação Percentual (%)</th>
                      <th>Tendência</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Total de Atendimentos</strong></td>
                      <td>1.428</td>
                      <td>1.370</td>
                      <td>+58 atendimentos</td>
                      <td>+4.23%</td>
                      <td><span className="badge-manchester badge-VERDE">↑ CRESCIMENTO</span></td>
                    </tr>
                    <tr>
                      <td><strong>Tempo Médio de Espera</strong></td>
                      <td>14 min</td>
                      <td>16 min</td>
                      <td>-2 min</td>
                      <td>-12.50%</td>
                      <td><span className="badge-manchester badge-VERDE">↓ MELHORIA</span></td>
                    </tr>
                    <tr>
                      <td><strong>Taxa de Ocupação Média</strong></td>
                      <td>72.2%</td>
                      <td>68.5%</td>
                      <td>+3.7%</td>
                      <td>+5.40%</td>
                      <td><span className="badge-manchester badge-AMARELO">↑ AUMENTO DE DEMANDA</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================
              CATEGORIA L: RELATÓRIOS PERSONALIZADOS (BUILDER DEDICADO)
              =================================================================== */}
          {activeCategory === 'CUSTOM' && (
            <div className="card">
              <div className="card-title">L. CONSTRUTOR DE RELATÓRIOS PERSONALIZADOS</div>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1rem' }}>
                Selecione as dimensões e métricas para gerar um relatório analítico personalizado sob demanda.
              </p>

              <form onSubmit={e => { e.preventDefault(); handleExport('CSV'); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Dimensão Principal (Linhas)</label>
                    <select className="form-control">
                      <option>Diagnóstico CID-10</option>
                      <option>Classificação de Risco (Manchester)</option>
                      <option>Profissional Responsável</option>
                      <option>Setor Assistencial</option>
                      <option>Faixa Etária</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dimensão Cruzada (Colunas)</label>
                    <select className="form-control">
                      <option>Desfecho Assistencial</option>
                      <option>Tempo de Permanência</option>
                      <option>Taxa de Retorno</option>
                      <option>Sexo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Métrica de Agregação</label>
                    <select className="form-control">
                      <option>Contagem de Pacientes (Absoluto)</option>
                      <option>Percentual do Total (%)</option>
                      <option>Média de Horas / Minutos</option>
                    </select>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '1.15rem' }}>
                  <button type="submit" className="btn btn-primary">
                    📊 Gerar e Exportar Relatório Personalizado
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Módulos Administrativos Padrão (Sem alterações) */}
      {activeMenu === 'admin_users' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Usuários e Acessos</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Gerenciamento de usuários e permissões</p>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Nome Completo</th>
                  <th>Perfil de Acesso</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>marcos.enfermeiro</td>
                  <td>MARCUS YAN DOS SANTOS COSTA</td>
                  <td>Enfermeiro</td>
                  <td><span className="badge-manchester badge-VERDE">ATIVO</span></td>
                </tr>
                <tr>
                  <td>thales.medico</td>
                  <td>DR. THALES DJALON CHAGAS DE ARAUJO</td>
                  <td>Médico Clínico</td>
                  <td><span className="badge-manchester badge-VERDE">ATIVO</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeMenu === 'admin_professionals' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Profissionais</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Cadastro e registro profissional</p>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Função</th>
                  <th>Registro Profissional</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DR. THALES DJALON CHAGAS DE ARAUJO</td>
                  <td>Médico Clínico</td>
                  <td>CRM — 14522</td>
                  <td><button className="btn btn-secondary btn-sm">Editar</button></td>
                </tr>
                <tr>
                  <td>MARCUS YAN DOS SANTOS COSTA</td>
                  <td>Enfermeiro</td>
                  <td>COREN — 64520</td>
                  <td><button className="btn btn-secondary btn-sm">Editar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeMenu === 'admin_sectors' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Setores</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Cadastro e organização dos setores assistenciais</p>
          </div>
          <ul>
            <li>Sala de Emergência</li>
            <li>Internação Adulto</li>
            <li>Pediatria</li>
            <li>Observação</li>
            <li>Sala de Sutura</li>
          </ul>
        </div>
      )}

      {activeMenu === 'admin_beds' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Leitos</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Cadastro, localização e configuração dos leitos</p>
          </div>
          <div className="alert alert-info">Cadastro dos leitos assistenciais permanentes e extras.</div>
        </div>
      )}

      {activeMenu === 'admin_protocols' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Protocolos Assistenciais</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Protocolos e linhas de cuidado da unidade</p>
          </div>
          <ul>
            <li>Protocolo de AVC</li>
            <li>Protocolo de Sepse</li>
            <li>Protocolo de Dor Torácica</li>
            <li>Protocolo de Politrauma</li>
          </ul>
        </div>
      )}

      {activeMenu === 'admin_registry' && (
        <div>
          <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid var(--brand-navy)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>CADASTROS MESTRE E TABELAS GERAIS</h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Administração e consulta permanente de cadastros e tabelas do sistema</p>
            </div>

            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.1rem', fontWeight: 800 }}>1. CONSULTA E CADASTRO DE PACIENTES</h3>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Pesquisa mestre de pessoas cadastradas independente de atendimento aberto.</p>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Prontuário Mestre</th>
                    <th>Nome Completo</th>
                    <th>Nome da Mãe</th>
                    <th>CPF</th>
                    <th>Data Nascimento / Sexo</th>
                    <th>Cidade de Origem</th>
                    <th>Status Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>PRONT-137603</strong></td>
                    <td>SADRAQUE PINHEIRO DE SOUZA</td>
                    <td>ODILENE SILVA PINHEIRO</td>
                    <td>034.900.072-71</td>
                    <td>14/11/1998 (27a) • M</td>
                    <td>BAGRE / PA</td>
                    <td><span className="badge-manchester badge-VERDE">CADASTRO ATIVO</span></td>
                  </tr>
                  <tr>
                    <td><strong>PRONT-104402</strong></td>
                    <td>RAIMUNDO SANTANA FEITOZA</td>
                    <td>MARIA FEITOZA</td>
                    <td>128.450.902-88</td>
                    <td>03/05/1958 (68a) • M</td>
                    <td>BREVES / PA</td>
                    <td><span className="badge-manchester badge-VERDE">CADASTRO ATIVO</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-title">2. TABELAS DE APOIO E REFERÊNCIA INSTITUCIONAL</div>
            <div className="form-grid">
              <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <strong>📖 CID-10 (Classificação Internacional de Doenças)</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Cadastro de códigos e descrições para diagnóstico médico.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <strong>💊 Medicamentos e Farmácia Hospitalar</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Cadastro de princípios ativos, posologias e estoques.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <strong>🧪 Materiais e Insumos Assistenciais</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Materiais cirúrgicos, descartáveis e de enfermagem.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <strong>🩺 Tabela de Procedimentos UPA (SIA/SUS)</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Procedimentos de urgência, suturas e medicação.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMenu === 'admin_audit' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Auditoria</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Histórico de alterações e acessos</p>
          </div>
          <p>Registro imutável de acessos e auditoria de ações.</p>
        </div>
      )}

      {activeMenu === 'admin_settings' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.4rem', fontWeight: 800 }}>Configurações</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>Parâmetros e preferências da unidade</p>
          </div>
          <p>Parâmetros gerais de funcionamento do sistema.</p>
        </div>
      )}
    </div>
  );
}
