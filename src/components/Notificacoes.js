// components/Notificacoes.js
import React, { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, Check, Trash2, X, PlaneTakeoff, FileText, AlertCircle } from 'lucide-react'
import { notificacaoService } from '../db'

const Notificacoes = () => {
  const [aberto, setAberto] = useState(false)
  const dropdownRef = useRef(null)

  // Buscar notificações em tempo real usando useLiveQuery
  const notificacoes = useLiveQuery(
    () => notificacaoService.buscarTodas(),
    []
  ) || []

  const naoLidas = notificacoes.filter(n => !n.lida).length

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAberto(false)
      }
    }

    if (aberto) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [aberto])

  const marcarComoLida = async (id) => {
    await notificacaoService.marcarComoLida(id)
  }

  const marcarTodasComoLidas = async () => {
    await notificacaoService.marcarTodasComoLidas()
  }

  const excluirNotificacao = async (id) => {
    await notificacaoService.excluir(id)
  }

  const excluirTodas = async () => {
    if (window.confirm('Deseja realmente excluir todas as notificações?')) {
      await notificacaoService.excluirTodas()
    }
  }

  const formatarData = (dataISO) => {
    const data = new Date(dataISO)
    const agora = new Date()
    const diff = agora - data
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return 'Agora'
    if (minutos < 60) return `${minutos}min atrás`
    if (horas < 24) return `${horas}h atrás`
    if (dias < 7) return `${dias}d atrás`
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getIconeTipo = (tipo) => {
    switch (tipo) {
      case 'viagem':
        return <PlaneTakeoff size={20} className="icone-notif-viagem" />
      case 'documento':
        return <FileText size={20} className="icone-notif-documento" />
      case 'alerta':
        return <AlertCircle size={20} className="icone-notif-alerta" />
      default:
        return <Bell size={20} className="icone-notif-info" />
    }
  }

  return (
    <div className="notificacoes-wrapper" ref={dropdownRef}>
      <button 
        className="btn-notificacoes"
        onClick={() => setAberto(!aberto)}
        title="Notificações"
      >
        <Bell size={20} />
        {naoLidas > 0 && (
          <span className="badge-notificacoes">{naoLidas}</span>
        )}
      </button>

      {aberto && (
        <div className="dropdown-notificacoes">
          <div className="notificacoes-header">
            <h3>Notificações</h3>
            <div className="notificacoes-acoes-header">
              {naoLidas > 0 && (
                <button 
                  onClick={marcarTodasComoLidas}
                  title="Marcar todas como lidas"
                  className="btn-acao-notif"
                >
                  <Check size={16} />
                </button>
              )}
              {notificacoes.length > 0 && (
                <button 
                  onClick={excluirTodas}
                  title="Excluir todas"
                  className="btn-acao-notif"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setAberto(false)}
                title="Fechar"
                className="btn-acao-notif"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notificacoes-lista-scroll">
            {notificacoes.length === 0 ? (
              <div className="notificacoes-vazio">
                <Bell size={40} />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`item-notificacao ${!notif.lida ? 'item-nao-lida' : ''}`}
                  onClick={() => !notif.lida && marcarComoLida(notif.id)}
                >
                  <div className="notif-icone-wrapper">
                    {getIconeTipo(notif.tipo)}
                  </div>
                  <div className="notif-conteudo">
                    <div className="notif-titulo">{notif.titulo}</div>
                    <div className="notif-mensagem">{notif.mensagem}</div>
                    
                    {/* MOSTRAR USUÁRIO RESPONSÁVEL */}
                    {notif.usuarioResponsavelNome && (
                      <div className="notif-usuario-responsavel">
                        <span className="notif-usuario-avatar">
                          {notif.usuarioResponsavelNome.charAt(0).toUpperCase()}
                        </span>
                        <span className="notif-usuario-nome">
                          por {notif.usuarioResponsavelNome}
                        </span>
                      </div>
                    )}
                    
                    <div className="notif-data">
                      {formatarData(notif.dataCreacao)}
                    </div>
                  </div>
                  <div className="notif-acoes">
                    {!notif.lida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          marcarComoLida(notif.id)
                        }}
                        title="Marcar como lida"
                        className="btn-lida-notif"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        excluirNotificacao(notif.id)
                      }}
                      title="Excluir"
                      className="btn-excluir-notif"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notificacoes