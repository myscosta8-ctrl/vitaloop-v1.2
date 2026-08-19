import React, { useState, useEffect } from 'react';
import './styles.css';
import { apiFetch, getAuthToken, setAuthToken } from './api';
import { Sidebar, ActiveMenu } from './components/Sidebar';
import { PatientBanner } from './components/PatientBanner';
import { PatientChartPermanence } from './components/PatientChartPermanence';
import { ReevaluationModule } from './components/ReevaluationModule';
import { ConsultationsModule } from './components/ConsultationsModule';
import { AdminModule } from './components/AdminModule';
import { TriageModule } from './components/TriageModule';
import { BedsMapModule } from './components/BedsMapModule';
import { DocumentWorkspaceModal } from './components/DocumentWorkspaceModal';

const VALID_MENUS: ActiveMenu[] = [
  'reception', 'triage', 'consultations', 'reevaluation',
  'beds_map', 'observation', 'hospitalization',
  'admin_dashboard', 'admin_users', 'admin_professionals', 'admin_sectors',
  'admin_beds', 'admin_protocols', 'admin_registry', 'admin_reports',
  'admin_audit', 'admin_settings'
];

class DiagnosticErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null; errorInfo: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('DIAGNOSTIC ERROR BOUNDARY CAUGHT:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fef2f2', border: '3px solid #ef4444', borderRadius: '8px', margin: '2rem', fontFamily: 'monospace', zIndex: 99999, position: 'relative' }}>
          <h2 style={{ color: '#991b1b', marginTop: 0 }}>⚠️ DIAGNÓSTICO DE ERRO DE RENDERIZAÇÃO REACT</h2>
          <p style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '1.1rem' }}>{this.state.error?.toString()}</p>
          <div style={{ fontWeight: 'bold', margin: '0.5rem 0', color: '#475569' }}>STACK TRACE DO ERRO:</div>
          <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.82rem' }}>
            {this.state.error?.stack}
          </pre>
          <div style={{ fontWeight: 'bold', margin: '0.5rem 0', color: '#475569' }}>PILHA DE COMPONENTES REACT:</div>
          <pre style={{ background: '#ffffff', color: '#334155', padding: '1rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.78rem', border: '1px solid #cbd5e1' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.removeItem('vitaloop_active_menu');
              window.location.reload();
            }}
            style={{ marginTop: '1rem', fontWeight: 800 }}
          >
            ↺ Redefinir Navegação para Recepção
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [username, setUsername] = useState('marcos.enfermeiro');
  const [password, setPassword] = useState('senha123');

  // Relógio e Turno em tempo real
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const isNight = hours >= 19 || hours < 7;

  // Estado do Menu Lateral Drawer (Aberto/Fechado) e Persistência de Navegação Segura
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenuState] = useState<ActiveMenu>(() => {
    try {
      const saved = localStorage.getItem('vitaloop_active_menu');
      if (saved && VALID_MENUS.includes(saved as ActiveMenu)) {
        return saved as ActiveMenu;
      }
    } catch {}
    return 'reception';
  });

  const setActiveMenu = (menu: ActiveMenu) => {
    const targetMenu = VALID_MENUS.includes(menu) ? menu : 'reception';
    setActiveMenuState(targetMenu);
    try {
      localStorage.setItem('vitaloop_active_menu', targetMenu);
    } catch {}
  };

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [patients, setPatients] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);

  const [newPatient, setNewPatient] = useState({
    fullName: '',
    socialName: '',
    motherName: '',
    birthDate: '',
    sex: 'M',
    cpf: '',
    cns: '',
    rg: '',
    cityOfOrigin: 'BAGRE / PA',
    phone: '',
    emergencyContact: '',
    allergies: 'PACIENTE NEGA ALERGIAS',
  });

  const [doctorForm, setDoctorForm] = useState({
    anamnese: 'PACIENTE ADMITIDO PROVENIENTE DE BAGRE/PA EM GRAVÍSSIMO ESTADO GERAL APÓS TRAUMA CRANIANO',
    physicalExam: 'PA 162X96 MMHG, GLASGOW 4 (AO4; RV1; RM3), PUPILAS MIDRIÁTICAS',
    diagnostics: 'I60 - HEMORRAGIA SUBARACNOIDEA; S06 - TRAUMATISMO INTRACRANIANO',
    conductPrescription: 'CUIDADOS PÓS-OPERATÓRIOS DE NEUROCIRUGIA. MANTER SEDAÇÃO PARA NEUROPROTEÇÃO.',
  });

  useEffect(() => {
    if (getAuthToken()) {
      setUser({ id: 'usr-1', name: 'MARCUS YAN (ENFERMEIRO)', role: 'ENFERMEIRO' });
      loadData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setAuthToken('demo-token-vitaloop');
    setUser({ id: 'usr-1', name: username.toUpperCase(), role: 'ENFERMEIRO / MÉDICO' });
    setSuccessMsg('Sessão iniciada na UPA com sucesso!');
    loadData();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setSelectedAttendance(null);
  };

  const loadData = async () => {
    try {
      const pData = await apiFetch('/patients');
      setPatients(pData.patients || []);
    } catch {}

    try {
      const bData = await apiFetch('/beds');
      setBeds(bData || []);
    } catch {}
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch('/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient),
      });
      setSuccessMsg(`Paciente cadastrado! Nº Prontuário: ${res.medicalRecordNumber}`);
      setNewPatient({
        fullName: '',
        socialName: '',
        motherName: '',
        birthDate: '',
        sex: 'M',
        cpf: '',
        cns: '',
        rg: '',
        cityOfOrigin: 'BAGRE / PA',
        phone: '',
        emergencyContact: '',
        allergies: 'PACIENTE NEGA ALERGIAS',
      });
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleOpenAttendance = async (patient: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiFetch('/attendances', {
        method: 'POST',
        body: JSON.stringify({
          patientId: patient.id,
          chiefComplaint: 'ADMISSÃO EM UPA PA',
          entryMode: 'ESPONTANEA',
        }),
      });
      setSelectedPatient(patient);
      setSelectedAttendance(res);
      setSuccessMsg(`Atendimento aberto com sucesso para ${patient.fullName || patient.full_name}! Redirecionado para Triagem.`);
      setActiveMenu('triage');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleFinishTriage = async (triageData: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (selectedAttendance) {
        await apiFetch(`/attendances/${selectedAttendance.id}/triage`, {
          method: 'POST',
          body: JSON.stringify(triageData),
        });
      }
      setSuccessMsg('Triagem concluída! Paciente encaminhado para Atendimento Médico.');
      setActiveMenu('consultations');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendance) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await apiFetch(`/attendances/${selectedAttendance.id}/consultation`, {
        method: 'POST',
        body: JSON.stringify({
          subjective: doctorForm.anamnese,
          objective: doctorForm.physicalExam,
          assessment: doctorForm.diagnostics,
          plan: doctorForm.conductPrescription,
        }),
      });
      setSuccessMsg('Atendimento Médico registrado! Encaminhado para Reavaliação Médica.');
      setActiveMenu('reevaluation');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDoctorDecision = (decision: 'ALTA' | 'REAVALIAÇÃO' | 'PERMANÊNCIA') => {
    if (decision === 'ALTA') {
      setSuccessMsg('Decisão de Destino: Alta médica concedida. Atendimento encerrado.');
      setSelectedAttendance(null);
      setActiveMenu('reception');
    } else if (decision === 'REAVALIAÇÃO') {
      setSuccessMsg('Decisão de Destino: Manter em nova reavaliação médica.');
      setActiveMenu('consultations');
    } else if (decision === 'PERMANÊNCIA') {
      setSuccessMsg('Decisão de Destino: Permanência médica solicitada.');
      setActiveMenu('observation');
    }
  };

  // TELA DE LOGIN PROFISSIONAL E ESTILIZADA
  if (!user) {
    return (
      <div className="app-container" style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 60%, #0f172a 100%)',
        padding: '1.5rem',
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '430px',
          padding: '2.5rem 2.2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          background: 'rgba(28, 37, 65, 0.95)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {/* Logo e Marca */}
          <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--brand-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-navy)',
                fontWeight: 900,
                fontSize: '1.6rem',
                boxShadow: '0 0 20px rgba(86, 184, 165, 0.4)',
              }}>
                ∞
              </div>
              <h1 style={{ color: '#ffffff', fontSize: '2.1rem', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
                Vitaloop UPA
              </h1>
            </div>
            <div style={{ color: 'var(--brand-mint)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Prontuário Eletrônico — UPA 24h
            </div>
          </div>

          {errorMsg && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1.3rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}>
                Usuário / Registro Profissional
              </label>
              <input
                className="form-control"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: enfermeiro.marcus"
                required
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.8rem' }}>
              <label className="form-label" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}>
                Senha de Acesso
              </label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <button
              className="btn btn-mint"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '8px',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 14px rgba(86, 184, 165, 0.3)',
              }}
              type="submit"
            >
              Acessar Prontuário
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            Sistema Seguro — Conexão Criptografada UPA 24h
          </div>
        </div>
      </div>
    );
  }

  // FORMATADORES DE DATA E HORA DO TOPBAR
  const formattedDay = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="app-layout">
      {/* Menu Lateral Drawer */}
      <Sidebar
        activeMenu={activeMenu}
        onSelectMenu={m => setActiveMenu(m)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-wrapper">
        {/* TOPBAR PROFISSIONAL */}
        <header className="app-topbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.25rem',
          background: 'var(--brand-navy)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          {/* Esquerda: Logo + Botão Hamburger */}
          <div className="topbar-brand-section" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              className={`topbar-hamburger-btn ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Menu Lateral de Navegação"
              aria-label="Abrir Menu Lateral"
              style={{
                background: sidebarOpen ? 'var(--brand-mint)' : 'rgba(255,255,255,0.08)',
                color: sidebarOpen ? 'var(--brand-navy)' : '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                padding: '0.4rem 0.65rem',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
                transition: 'all 0.15s ease',
              }}
            >
              ☰
            </button>
            <div className="brand-title-group">
              <div className="brand-name" style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.2 }}>
                Vitaloop UPA
              </div>
              <div className="brand-subtitle" style={{ fontSize: '0.68rem', color: 'var(--brand-mint)', fontWeight: 600, lineHeight: 1 }}>
                Prontuário Eletrônico do Paciente
              </div>
            </div>
          </div>

          {/* Centro: Relógio em Tempo Real + Chip de Turno */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#e2e8f0',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: 'var(--brand-mint)' }}>🕒</span>
              <span>{formattedDay} | {formattedTime}</span>
            </div>

            <div style={{
              background: isNight ? 'rgba(147, 51, 234, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              border: isNight ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(250, 204, 21, 0.4)',
              color: isNight ? '#d8b4fe' : '#fde047',
              padding: '0.3rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.3px',
            }}>
              {isNight ? '🌙 Plantão Noturno (19h-07h)' : '☀️ Plantão Diurno (07h-19h)'}
            </div>
          </div>

          {/* Direita: Perfil do Usuário e Sair */}
          <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.83rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                {user?.name || 'ENFERMEIRO / MÉDICO'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1 }}>
                UPA 24h Bagre/PA
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
              }}
            >
              Sair
            </button>
          </div>
        </header>

        {/* Sticky Patient Banner */}
        {selectedAttendance && (
          <PatientBanner
            patient={selectedPatient || {
              id: 'p-137603',
              medicalRecordNumber: '137603',
              fullName: 'SADRAQUE PINHEIRO DE SOUZA',
              cpf: '034.900.072-71',
              cns: '704707717173434',
              motherName: 'ODILENE SILVA PINHEIRO',
              birthDate: '1998-11-14',
              sex: 'M',
              cityOfOrigin: 'BAGRE / PA',
              allergies: 'PACIENTE NEGA ALERGIAS',
            }}
            attendance={selectedAttendance}
          />
        )}

        <DiagnosticErrorBoundary>
          <main className="main-content">
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            {successMsg && <div className="alert alert-info">{successMsg}</div>}

            {/* 🟦 FLUXO DE ATENDIMENTO: RECEPÇÃO */}
            {activeMenu === 'reception' && (
              <div>
                {/* Título da Recepção */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ color: 'var(--brand-navy)', fontSize: '1.35rem', fontWeight: 800 }}>Recepção</h2>
                  </div>
                  <button className="btn btn-primary" onClick={() => setIsRegistrationModalOpen(true)} style={{ fontWeight: 800 }}>
                    👤 + Novo Paciente
                  </button>
                </div>

                {/* FILA DE PACIENTES IDENTIFICADOS */}
                <div className="card" style={{ borderLeft: '4px solid var(--brand-mint)' }}>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--brand-navy)', fontSize: '1.05rem', fontWeight: 800 }}>Pacientes Cadastrados</h3>
                  </div>

                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Nº Prontuário</th>
                          <th>Nome Completo</th>
                          <th>Nome da Mãe</th>
                          <th>CPF</th>
                          <th>Cidade Origem</th>
                          <th>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.length === 0 ? (
                          <tr>
                            <td><strong>PRONT-137603</strong></td>
                            <td>SADRAQUE PINHEIRO DE SOUZA</td>
                            <td>ODILENE SILVA PINHEIRO</td>
                            <td>034.900.072-71</td>
                            <td>BAGRE / PA</td>
                            <td>
                              <button className="btn btn-primary btn-sm" onClick={() => handleOpenAttendance({ id: 'p-137603', medicalRecordNumber: '137603', fullName: 'SADRAQUE PINHEIRO DE SOUZA', cpf: '034.900.072-71', cns: '704707717173434', motherName: 'ODILENE SILVA PINHEIRO', birthDate: '1998-11-14', sex: 'M', cityOfOrigin: 'BAGRE / PA', allergies: 'PACIENTE NEGA ALERGIAS' })}>
                                ▶ Abrir Atendimento
                              </button>
                            </td>
                          </tr>
                        ) : (
                          patients.map(p => (
                            <tr key={p.id}>
                              <td><strong>{p.medical_record_number}</strong></td>
                              <td>{p.full_name}</td>
                              <td>{p.mother_name || 'N/I'}</td>
                              <td>{p.cpf || 'Sem CPF'}</td>
                              <td>{p.city_of_origin || 'BAGRE / PA'}</td>
                              <td>
                                <button className="btn btn-primary btn-sm" onClick={() => handleOpenAttendance(p)}>
                                  ▶ Abrir Atendimento
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL SOBREPOSTO DE CADASTRO DO PACIENTE */}
                {isRegistrationModalOpen && (
                  <DocumentWorkspaceModal
                    isOpen={true}
                    documentType="PATIENT_REGISTRATION"
                    title="CADASTRO DO PACIENTE"
                    patient={{ fullName: newPatient.fullName || 'Novo Paciente', medicalRecordNumber: 'PRONT-NOVO' }}
                    attendance={{ id: 'N/A' }}
                    user={user}
                    onClose={() => setIsRegistrationModalOpen(false)}
                    onRelease={(e) => {
                      handleCreatePatient(e as any);
                      setIsRegistrationModalOpen(false);
                    }}
                  >
                    <div className="card">
                      <div className="card-title">DADOS CADASTRAIS PERMANENTES DO PACIENTE</div>
                      <div className="form-grid">
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">Nome Completo *</label>
                          <input className="form-control" value={newPatient.fullName} onChange={e => setNewPatient({ ...newPatient, fullName: e.target.value })} placeholder="Nome completo do paciente" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nome Social</label>
                          <input className="form-control" value={newPatient.socialName} onChange={e => setNewPatient({ ...newPatient, socialName: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nome da Mãe *</label>
                          <input className="form-control" value={newPatient.motherName} onChange={e => setNewPatient({ ...newPatient, motherName: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Data de Nascimento</label>
                          <input className="form-control" type="date" value={newPatient.birthDate} onChange={e => setNewPatient({ ...newPatient, birthDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Sexo</label>
                          <select className="form-control" value={newPatient.sex} onChange={e => setNewPatient({ ...newPatient, sex: e.target.value })}>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="I">Ignorado / Indeterminado</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">CPF</label>
                          <input className="form-control" value={newPatient.cpf} onChange={e => setNewPatient({ ...newPatient, cpf: e.target.value })} placeholder="000.000.000-00" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Cartão SUS</label>
                          <input className="form-control" value={newPatient.cns} onChange={e => setNewPatient({ ...newPatient, cns: e.target.value })} placeholder="Nº do Cartão SUS" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Cidade de Origem</label>
                          <input className="form-control" value={newPatient.cityOfOrigin} onChange={e => setNewPatient({ ...newPatient, cityOfOrigin: e.target.value })} placeholder="Município de residência" />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">Alergias Conhecidas</label>
                          <input className="form-control" value={newPatient.allergies} onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })} placeholder="Alergias conhecidas ou nega alergias" />
                        </div>
                      </div>
                    </div>
                  </DocumentWorkspaceModal>
                )}
              </div>
            )}

            {/* 🟦 FLUXO DE ATENDIMENTO: TRIAGEM COMPLETA */}
            {activeMenu === 'triage' && (
              <TriageModule
                attendance={selectedAttendance || { id: 'att-2026-000123', openedAt: new Date().toISOString() }}
                patient={selectedPatient || { fullName: 'SADRAQUE PINHEIRO DE SOUZA', medicalRecordNumber: 'PRONT-137603', allergies: 'PACIENTE NEGA ALERGIAS' }}
                user={user}
                onFinishTriage={handleFinishTriage}
              />
            )}

            {/* 🟦 FLUXO DE ATENDIMENTO: ATENDIMENTO MÉDICO */}
            {activeMenu === 'consultations' && (
              <ConsultationsModule
                attendance={selectedAttendance || { id: 'att-6592', openedAt: new Date().toISOString() }}
                patient={selectedPatient || { fullName: 'SADRAQUE PINHEIRO DE SOUZA', medicalRecordNumber: 'PRONT-137603' }}
                user={user}
                onSaveConsultation={(data) => {
                  setSuccessMsg(`Atendimento Médico registrado com sucesso para ${data.patientName}! Transição para ${data.status}.`);
                  setTimeout(() => setSuccessMsg(null), 4000);
                }}
              />
            )}

            {/* 🟦 FLUXO DE ATENDIMENTO: REAVALIAÇÃO MÉDICA */}
            {activeMenu === 'reevaluation' && (
              <ReevaluationModule
                attendance={selectedAttendance || { id: 'att-6592', openedAt: new Date().toISOString() }}
                patient={selectedPatient || { fullName: 'SADRAQUE PINHEIRO DE SOUZA', medicalRecordNumber: 'PRONT-137603' }}
                user={user}
                onSaveReevaluation={(data) => {
                  setSuccessMsg(`Reavaliação Médica salva com sucesso para ${data.patientName}! Decisão: ${data.outcomeDecision}.`);
                  setTimeout(() => setSuccessMsg(null), 4000);
                }}
              />
            )}

            {/* 🟧 FLUXO DE PERMANÊNCIA: MAPA FÍSICO PERMANENTE DE LEITOS (36 LEITOS FÍSICOS) */}
            {activeMenu === 'beds_map' && (
              <BedsMapModule
                beds={beds}
                patients={patients}
                user={user}
                onRefreshData={loadData}
                onSelectPatientChart={(p, a, context) => {
                  setSelectedPatient(p);
                  setSelectedAttendance(a);
                  setActiveMenu(context);
                }}
              />
            )}

            {/* 🟧 FLUXO DE PERMANÊNCIA: OBSERVAÇÃO */}
            {activeMenu === 'observation' && (
              <PatientChartPermanence
                patient={selectedPatient || { fullName: 'SADRAQUE PINHEIRO DE SOUZA', medicalRecordNumber: '137603' }}
                attendance={selectedAttendance || { id: 'att-6592', openedAt: new Date().toISOString() }}
                isHospitalization={false}
              />
            )}

            {/* 🟧 FLUXO DE PERMANÊNCIA: INTERNAÇÃO */}
            {activeMenu === 'hospitalization' && (
              <PatientChartPermanence
                patient={selectedPatient || { fullName: 'SADRAQUE PINHEIRO DE SOUZA', medicalRecordNumber: '137603' }}
                attendance={selectedAttendance || { id: 'att-6592', openedAt: new Date().toISOString() }}
                isHospitalization={true}
              />
            )}

            {/* ⚙ ADMINISTRATIVO */}
            {activeMenu.startsWith('admin_') && (
              <AdminModule activeMenu={activeMenu} onNavigateMenu={(menu) => setActiveMenu(menu)} />
            )}
          </main>
        </DiagnosticErrorBoundary>
      </div>
    </div>
  );
}

export default App;
