// components/InfoAuditoria.js
// Componente reutilizável para mostrar informações de auditoria
import React from 'react'
import { User, Clock, CheckCircle, XCircle } from 'lucide-react'

function InfoAuditoria({ 
  criadoPorNome, 
  dataCriacao,
  aprovadoPorNome,
  dataAprovacao,
  recusadoPorNome,
  dataRecusa,
  atualizadoPorNome,
  dataAtualizacao,
  compacto = false 
}) {
  
  const formatarData = (dataISO) => {
    if (!dataISO) return ''
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInicial = (nome) => {
    if (!nome) return '?'
    return nome.charAt(0).toUpperCase()
  }

  if (compacto) {
    // Versão compacta - apenas uma linha
    return (
      <div className="info-auditoria-compacta">
        {criadoPorNome && (
          <div className="auditoria-item-compacto">
            <span className="auditoria-avatar-mini">{getInicial(criadoPorNome)}</span>
            <span className="auditoria-texto-mini">{criadoPorNome}</span>
          </div>
        )}
      </div>
    )
  }

  // Versão completa
  return (
    <div className="info-auditoria">
      {/* Criado por */}
      {criadoPorNome && (
        <div className="auditoria-item">
          <div className="auditoria-icone criado">
            <User size={14} />
          </div>
          <div className="auditoria-conteudo">
            <div className="auditoria-avatar">{getInicial(criadoPorNome)}</div>
            <div className="auditoria-texto">
              <span className="auditoria-label">Criado por</span>
              <span className="auditoria-nome">{criadoPorNome}</span>
              {dataCriacao && (
                <span className="auditoria-data">{formatarData(dataCriacao)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aprovado por */}
      {aprovadoPorNome && (
        <div className="auditoria-item">
          <div className="auditoria-icone aprovado">
            <CheckCircle size={14} />
          </div>
          <div className="auditoria-conteudo">
            <div className="auditoria-avatar aprovado">{getInicial(aprovadoPorNome)}</div>
            <div className="auditoria-texto">
              <span className="auditoria-label">Aprovado por</span>
              <span className="auditoria-nome">{aprovadoPorNome}</span>
              {dataAprovacao && (
                <span className="auditoria-data">{formatarData(dataAprovacao)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recusado por */}
      {recusadoPorNome && (
        <div className="auditoria-item">
          <div className="auditoria-icone recusado">
            <XCircle size={14} />
          </div>
          <div className="auditoria-conteudo">
            <div className="auditoria-avatar recusado">{getInicial(recusadoPorNome)}</div>
            <div className="auditoria-texto">
              <span className="auditoria-label">Recusado por</span>
              <span className="auditoria-nome">{recusadoPorNome}</span>
              {dataRecusa && (
                <span className="auditoria-data">{formatarData(dataRecusa)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Atualizado por */}
      {atualizadoPorNome && atualizadoPorNome !== criadoPorNome && (
        <div className="auditoria-item">
          <div className="auditoria-icone atualizado">
            <Clock size={14} />
          </div>
          <div className="auditoria-conteudo">
            <div className="auditoria-avatar atualizado">{getInicial(atualizadoPorNome)}</div>
            <div className="auditoria-texto">
              <span className="auditoria-label">Atualizado por</span>
              <span className="auditoria-nome">{atualizadoPorNome}</span>
              {dataAtualizacao && (
                <span className="auditoria-data">{formatarData(dataAtualizacao)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoAuditoria