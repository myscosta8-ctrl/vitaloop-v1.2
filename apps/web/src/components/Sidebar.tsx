import React from 'react';

export type ActiveMenu =
  | 'reception' | 'triage' | 'consultations' | 'reevaluation'
  | 'beds_map' | 'observation' | 'hospitalization'
  | 'admin_dashboard' | 'admin_users' | 'admin_professionals' | 'admin_sectors'
  | 'admin_beds' | 'admin_protocols' | 'admin_registry' | 'admin_reports'
  | 'admin_audit' | 'admin_settings';

interface SidebarProps {
  activeMenu: ActiveMenu;
  onSelectMenu: (menu: ActiveMenu) => void;
  isOpen: boolean;
  onClose: () => void;
}

function NavIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, opacity: 0.9 }}>
      <path d={d} />
    </svg>
  );
}

// Ícones SVG como paths padrão Feather/Lucide
const ICONS = {
  reception:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  triage:       'M22 12h-4l-3 9L9 3l-3 9H2',
  consultations:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  reevaluation: 'M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15',
  beds_map:     'M3 9h18M3 9l3-6h12l3 6M3 9v9a2 2 0 002 2h14a2 2 0 002-2V9M7 14h2m4 0h2',
  observation:  'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
  hospitalization: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  dashboard:    'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  users:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 7a4 4 0 100 8 4 4 0 000-8z',
  professionals:'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z',
  sectors:      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0',
  beds:         'M2 20h20M7 20V8h10v12M2 8l10-6 10 6',
  protocols:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  registry:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 10H2',
  reports:      'M18 20V10 M12 20V4 M6 20v-6',
  audit:        'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings:     'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
};

interface NavItemProps {
  menu: ActiveMenu;
  activeMenu: ActiveMenu;
  icon: string;
  label: string;
  onSelect: (m: ActiveMenu) => void;
}

function NavItem({ menu, activeMenu, icon, label, onSelect }: NavItemProps) {
  const isActive = activeMenu === menu;
  return (
    <button
      className={`sidebar-link ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(menu)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.58rem 0.8rem',
        width: '100%',
        borderRadius: '6px',
        background: isActive ? 'rgba(86,184,165,0.15)' : 'transparent',
        color: isActive ? 'var(--brand-mint)' : '#cbd5e1',
        fontWeight: isActive ? 700 : 600,
        fontSize: '0.875rem',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.12s ease',
        borderLeft: isActive ? '3px solid var(--brand-mint)' : '3px solid transparent',
        letterSpacing: '0.01em',
      }}
    >
      <NavIcon d={icon} size={16} />
      <span>{label}</span>
    </button>
  );
}

function SectionLabel({ children, color = '#94a3b8', bg = 'rgba(148,163,184,0.08)' }: {
  children: string; color?: string; bg?: string;
}) {
  return (
    <div style={{
      fontSize: '0.68rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color,
      background: bg,
      padding: '0.3rem 0.7rem',
      borderRadius: '4px',
      marginBottom: '0.3rem',
      marginTop: '0.1rem',
    }}>
      {children}
    </div>
  );
}

export function Sidebar({ activeMenu, onSelectMenu, isOpen, onClose }: SidebarProps) {
  if (!isOpen) return null;

  const handleSelect = (menu: ActiveMenu) => {
    onSelectMenu(menu);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="sidebar-backdrop" onClick={onClose} />

      <aside className="sidebar-drawer open" style={{ width: '272px' }}>
        {/* Cabeçalho do menu */}
        <div className="sidebar-header" style={{
          padding: '0.9rem 1rem',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'var(--brand-mint)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--brand-navy)', fontWeight: 900, fontSize: '1rem',
            }}>
              ∞
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff', lineHeight: 1.2 }}>
                Vitaloop UPA
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--brand-mint)', fontWeight: 600, lineHeight: 1 }}>
                Navegação do Sistema
              </div>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            title="Fechar Menu"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#94a3b8',
              width: '28px', height: '28px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Navegação */}
        <nav className="sidebar-nav" style={{ padding: '0.75rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', overflowY: 'auto', flex: 1 }}>

          {/* FLUXO DE ATENDIMENTO */}
          <div style={{ marginBottom: '0.5rem' }}>
            <SectionLabel color="#38bdf8" bg="rgba(56,189,248,0.08)">
              Fluxo de Atendimento
            </SectionLabel>
            <NavItem menu="reception"      activeMenu={activeMenu} icon={ICONS.reception}      label="Recepção"                  onSelect={handleSelect} />
            <NavItem menu="triage"         activeMenu={activeMenu} icon={ICONS.triage}         label="Triagem"                   onSelect={handleSelect} />
            <NavItem menu="consultations"  activeMenu={activeMenu} icon={ICONS.consultations}  label="Atendimento Médico"         onSelect={handleSelect} />
            <NavItem menu="reevaluation"   activeMenu={activeMenu} icon={ICONS.reevaluation}   label="Reavaliação Médica"         onSelect={handleSelect} />
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0.5rem 0.5rem' }} />

          {/* FLUXO DE PERMANÊNCIA */}
          <div style={{ marginBottom: '0.5rem' }}>
            <SectionLabel color="#fb923c" bg="rgba(251,146,60,0.08)">
              Fluxo de Permanência
            </SectionLabel>
            <NavItem menu="beds_map"         activeMenu={activeMenu} icon={ICONS.beds_map}       label="Mapa de Leitos"            onSelect={handleSelect} />
            <NavItem menu="observation"      activeMenu={activeMenu} icon={ICONS.observation}    label="Sala de Observação"        onSelect={handleSelect} />
            <NavItem menu="hospitalization"  activeMenu={activeMenu} icon={ICONS.hospitalization} label="Leitos de Internação"     onSelect={handleSelect} />
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0.5rem 0.5rem' }} />

          {/* ADMINISTRATIVO */}
          <div>
            <SectionLabel color="#94a3b8" bg="rgba(148,163,184,0.08)">
              Administrativo
            </SectionLabel>
            <NavItem menu="admin_dashboard"    activeMenu={activeMenu} icon={ICONS.dashboard}     label="Painel de Controle"        onSelect={handleSelect} />
            <NavItem menu="admin_users"        activeMenu={activeMenu} icon={ICONS.users}          label="Usuários e Acessos"        onSelect={handleSelect} />
            <NavItem menu="admin_professionals" activeMenu={activeMenu} icon={ICONS.professionals} label="Profissionais"             onSelect={handleSelect} />
            <NavItem menu="admin_sectors"      activeMenu={activeMenu} icon={ICONS.sectors}        label="Setores"                   onSelect={handleSelect} />
            <NavItem menu="admin_beds"         activeMenu={activeMenu} icon={ICONS.beds}           label="Gestão de Leitos"          onSelect={handleSelect} />
            <NavItem menu="admin_protocols"    activeMenu={activeMenu} icon={ICONS.protocols}      label="Protocolos Assistenciais"  onSelect={handleSelect} />
            <NavItem menu="admin_registry"     activeMenu={activeMenu} icon={ICONS.registry}       label="Cadastros Gerais"          onSelect={handleSelect} />
            <NavItem menu="admin_reports"      activeMenu={activeMenu} icon={ICONS.reports}        label="Relatórios"                onSelect={handleSelect} />
            <NavItem menu="admin_audit"        activeMenu={activeMenu} icon={ICONS.audit}          label="Auditoria"                 onSelect={handleSelect} />
            <NavItem menu="admin_settings"     activeMenu={activeMenu} icon={ICONS.settings}       label="Configurações"             onSelect={handleSelect} />
          </div>
        </nav>

        {/* Rodapé da Sidebar */}
        <div style={{
          padding: '0.65rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(0,0,0,0.15)',
          fontSize: '0.65rem',
          color: 'rgba(148,163,184,0.6)',
          fontWeight: 600,
          textAlign: 'center',
          letterSpacing: '0.3px',
        }}>
          Vitaloop PEP v1.2 — UPA 24h
        </div>
      </aside>
    </>
  );
}
