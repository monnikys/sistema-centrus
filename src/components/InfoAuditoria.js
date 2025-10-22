import React from 'react'
import { User, Clock, CheckCircle, XCircle } from 'lucide-react'

function InfoAuditoria({ // Componente InfoAuditoria
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
  
  const formatarData = (dataISO) => { // Função para formatar data
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

  const getInicial = (nome) => { // Função para obter a inicial do nome
    if (!nome) return '?'
    return nome.charAt(0).toUpperCase()
  }

  if (compacto) { // Se for versão compacta
    // Versão compacta - apenas uma linha
    return (
      <div className="info-auditoria-compacta"> {/* Contéudo da versão compacta */}
        {criadoPorNome && (
          <div className="auditoria-item-compacto"> {/* Item da versão compacta */}
            <span className="auditoria-avatar-mini">{getInicial(criadoPorNome)}</span> {/* Avatar da versão compacta */}
            <span className="auditoria-texto-mini">{criadoPorNome}</span> {/* Texto da versão compacta */}
          </div>
        )}
      </div>
    )
  }

  // Versão completa
  return (
    <div className="info-auditoria"> {/* Contéudo da versão completa */}
      {/* Criado por */}
      {criadoPorNome && (
        <div className="auditoria-item"> {/* Item da versão completa */}
          <div className="auditoria-icone criado"> {/* Icone da versão completa */}
            <User size={14} />
          </div>
          <div className="auditoria-conteudo"> {/* Contéudo da versão completa */}
            <div className="auditoria-avatar">{getInicial(criadoPorNome)}</div> {/* Avatar da versão completa */}
            <div className="auditoria-texto"> {/* Texto da versão completa */}
              <span className="auditoria-label">Criado por</span> {/* Label da versão completa */}
              <span className="auditoria-nome">{criadoPorNome}</span> {/* Nome da versão completa */}
              {dataCriacao && (
                <span className="auditoria-data">{formatarData(dataCriacao)}</span> /// Data da versão completa
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aprovado por */}
      {aprovadoPorNome && (
        <div className="auditoria-item"> {/* Item da versão completa */}
          <div className="auditoria-icone aprovado"> {/* Icone da versão completa */}
            <CheckCircle size={14} />
          </div>
          <div className="auditoria-conteudo"> {/* Contéudo da versão completa */}
            <div className="auditoria-avatar aprovado">{getInicial(aprovadoPorNome)}</div> {/* Avatar da versão completa */}
            <div className="auditoria-texto"> {/* Texto da versão completa */}
              <span className="auditoria-label">Aprovado por</span> {/* Label da versão completa */}
              <span className="auditoria-nome">{aprovadoPorNome}</span> {/* Nome da versão completa */}
              {dataAprovacao && (
                <span className="auditoria-data">{formatarData(dataAprovacao)}</span> /// Data da versão completa
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recusado por */}
      {recusadoPorNome && (
        <div className="auditoria-item"> {/* Item da versão completa */}
          <div className="auditoria-icone recusado"> {/* Icone da versão completa */}
            <XCircle size={14} />
          </div>
          <div className="auditoria-conteudo"> {/* Contéudo da versão completa */}
            <div className="auditoria-avatar recusado">{getInicial(recusadoPorNome)}</div> {/* Avatar da versão completa */}
            <div className="auditoria-texto"> {/* Texto da versão completa */}
              <span className="auditoria-label">Recusado por</span> {/* Label da versão completa */}
              <span className="auditoria-nome">{recusadoPorNome}</span> {/* Nome da versão completa */}
              {dataRecusa && (
                <span className="auditoria-data">{formatarData(dataRecusa)}</span> /// Data da versão completa
              )}
            </div>
          </div>
        </div>
      )}

      {/* Atualizado por */}
      {atualizadoPorNome && atualizadoPorNome !== criadoPorNome && (
        <div className="auditoria-item"> {/* Item da versão completa */}
          <div className="auditoria-icone atualizado"> {/* Icone da versão completa */}
            <Clock size={14} />
          </div>
          <div className="auditoria-conteudo"> {/* Contéudo da versão completa */}
            <div className="auditoria-avatar atualizado">{getInicial(atualizadoPorNome)}</div> {/* Avatar da versão completa */}
            <div className="auditoria-texto"> {/* Texto da versão completa */}
              <span className="auditoria-label">Atualizado por</span> {/* Label da versão completa */}
              <span className="auditoria-nome">{atualizadoPorNome}</span> {/* Nome da versão completa */}
              {dataAtualizacao && (
                <span className="auditoria-data">{formatarData(dataAtualizacao)}</span> /// Data da versão completa
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoAuditoria;