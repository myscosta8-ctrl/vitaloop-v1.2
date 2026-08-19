import React from 'react';

export interface InstitutionalPrintHeaderProps {
  documentTitle?: string;
  documentSubtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function InstitutionalPrintHeader({
  documentTitle,
  documentSubtitle,
  className,
  style,
}: InstitutionalPrintHeaderProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        paddingBottom: '12px',
        marginBottom: '16px',
        borderBottom: '2px solid #0F2B36',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
    >
      {/* Linha dos 3 Logos Oficiais */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Logo 1: Brasão da Prefeitura de Breves */}
        <div style={{ flex: '0 0 auto' }}>
          <img
            src="/logos/brasao-breves.jpg"
            alt="Prefeitura Municipal de Breves"
            style={{ height: '52px', objectFit: 'contain' }}
          />
        </div>

        {/* Texto Institucional Central */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F2B36',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            ESTADO DO PARÁ • PREFEITURA MUNICIPAL DE BREVES
          </div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#334155',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            SECRETARIA MUNICIPAL DE SAÚDE — SEMSA
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 900,
              color: '#0F2B36',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            UPA 24H BREVES — UNIDADE DE PRONTO ATENDIMENTO
          </div>
        </div>

        {/* Logo 2: SEMSA / Logo 3: UPA 24h */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' }}>
          <img
            src="/logos/semsa.jpg"
            alt="SEMSA Breves"
            style={{ height: '48px', objectFit: 'contain' }}
          />
          <img
            src="/logos/upa24h.jpg"
            alt="UPA 24h"
            style={{ height: '52px', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Título do Documento Impresso */}
      {documentTitle && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            marginTop: '4px',
            paddingTop: '6px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#0F2B36',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            {documentTitle}
          </div>
          {documentSubtitle && (
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
              {documentSubtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
