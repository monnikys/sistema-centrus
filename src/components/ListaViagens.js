import React, { useState, useEffect } from 'react'
import { Paperclip, Calendar, MapPin, User, Clock } from 'lucide-react'
import { db } from '../db'
import { AuthService } from '../authDb'
import AnexosViagem from './AnexosViagem'

function ListaViagens({ viagens, onAtualizar }) {
  // Estados
  const [viagemSelecionada, setViagemSelecionada] = useState(null)
  const [mostrarAnexos, setMostrarAnexos] = useState(false)
  const [usuarioAtual, setUsuarioAtual] = useState(null)
  const [contadoresAnexos, setContadoresAnexos] = useState({})

  useEffect(() => {
    carregarDados()
  }, [viagens])

  const carregarDados = async () => {
    // Carregar usuário atual
    const usuario = await AuthService.obterUsuarioAtual()
    setUsuarioAtual(usuario)

    // Carregar contador de anexos para cada viagem
    if (viagens && viagens.length > 0) {
      const contadores = {}
      for (const viagem of viagens) {
        const count = await db.anexosViagem
          .where('viagemId')
          .equals(viagem.id)
          .count()
        contadores[viagem.id] = count
      }
      setContadoresAnexos(contadores)
    }
  }

  // Função para abrir modal de anexos
  const abrirAnexos = (viagem) => {
    console.log('🔍 Abrindo anexos para viagem:', viagem) // DEBUG
    setViagemSelecionada(viagem)
    setMostrarAnexos(true)
  }

  // Função para fechar modal
  const fecharAnexos = async () => {
    setMostrarAnexos(false)
    setViagemSelecionada(null)
    
    // Recarregar contadores após fechar
    await carregarDados()
    
    // Se houver callback para atualizar lista
    if (onAtualizar) {
      onAtualizar()
    }
  }

  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return '-'
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }

  // Verificar se pode ver anexos
  const podeVerAnexos = (viagem) => {
    if (!usuarioAtual) {
      console.log('❌ Sem usuário atual') // DEBUG
      return false
    }
    
    console.log('🔍 Verificando permissões:', { // DEBUG
      usuario: usuarioAtual.nome,
      tipo: usuarioAtual.tipo,
      permissoes: usuarioAtual.permissoes,
      viagemId: viagem.id
    })
    
    // Admin pode ver sempre
    if (usuarioAtual.tipo === 'admin') {
      console.log('✅ Admin tem acesso total') // DEBUG
      return true
    }
    
    // Tem permissão de anexos
    if ((usuarioAtual.permissoes || []).includes('anexos_viagem')) {
      console.log('✅ Tem permissão anexos_viagem') // DEBUG
      return true
    }
    
    // É o solicitante ou viajante
    if (viagem.criadoPorId === usuarioAtual.id || 
        viagem.viajanteId === usuarioAtual.id) {
      console.log('✅ É criador ou viajante') // DEBUG
      return true
    }
    
    console.log('❌ Sem permissão') // DEBUG
    return false
  }

  // Obter classe de status
  const getStatusClass = (status) => {
    // Normalizar para maiúsculo para comparação
    const statusUpper = (status || '').toUpperCase()
    
    switch (statusUpper) {
      case 'APROVADA':
        return 'status-aprovada'
      case 'RECUSADA':
        return 'status-recusada'
      default:
        return 'status-pendente'
    }
  }

  if (!viagens || viagens.length === 0) {
    return (
      <div className="lista-vazia">
        <p>Nenhuma viagem encontrada</p>
      </div>
    )
  }

  return (
    <div className="lista-viagens-container">
      <div className="viagens-grid">
        {viagens.map((viagem) => {
          // ⬇️ VERIFICAÇÃO DE DEBUG
          const statusNormalizado = (viagem.status || '').toUpperCase()
          const estaAprovada = statusNormalizado === 'APROVADA'
          const podeVer = podeVerAnexos(viagem)
          
          console.log('🔍 Card viagem:', {
            id: viagem.id,
            status: viagem.status,
            statusNormalizado,
            estaAprovada,
            podeVer,
            mostraraoBotao: estaAprovada && podeVer
          })
          // ⬆️ VERIFICAÇÃO DE DEBUG
          
          return (
            <div key={viagem.id} className="viagem-card">
              {/* Header do Card */}
              <div className="viagem-header">
                <div className="viagem-rota">
                  <h3>
                    {viagem.origem} → {viagem.destino}
                  </h3>
                </div>
                <span className={`viagem-status ${getStatusClass(viagem.status)}`}>
                  {viagem.status}
                </span>
              </div>

              {/* Informações da Viagem */}
              <div className="viagem-info">
                <div className="viagem-detalhe">
                  <User size={16} />
                  <span>
                    <strong>Viajante:</strong> {viagem.viajante}
                  </span>
                </div>

                <div className="viagem-detalhe">
                  <Calendar size={16} />
                  <span>
                    <strong>Ida:</strong> {formatarData(viagem.dataIda)}
                  </span>
                </div>

                <div className="viagem-detalhe">
                  <Calendar size={16} />
                  <span>
                    <strong>Volta:</strong> {formatarData(viagem.dataVolta)}
                  </span>
                </div>

                {viagem.justificativa && (
                  <div className="viagem-justificativa">
                    <strong>Justificativa:</strong>
                    <p>{viagem.justificativa}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="viagem-acoes">
                {/* ⬇️ CORREÇÃO: Verificar status em MAIÚSCULO */}
                {statusNormalizado === 'APROVADA' && podeVer && (
                  <button
                    onClick={() => abrirAnexos(viagem)}
                    className="btn-anexos"
                    title="Gerenciar Anexos"
                  >
                    <Paperclip size={18} />
                    <span>Anexos</span>
                    {contadoresAnexos[viagem.id] > 0 && (
                      <span className="badge-contador">
                        {contadoresAnexos[viagem.id]}
                      </span>
                    )}
                  </button>
                )}
                {/* ⬆️ CORREÇÃO APLICADA */}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Anexos */}
      {mostrarAnexos && viagemSelecionada && (
        <AnexosViagem
          viagem={viagemSelecionada}
          onFechar={fecharAnexos}
        />
      )}
    </div>
  )
}

export default ListaViagens